/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Create SecurityGroup
 *
 * v0.1 - 2018-07-23
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Form, Row, Col, Button } from 'antd'
import './style/index.less'
import CreateNameAndTarget from './components/NameAndTarget'
import IngressAndEgressWhiteList from './components/IngressAndEgressWhiteList'
import { browserHistory } from 'react-router'
import Notification from '../../../../src/components/Notification'
import * as servicesActions from '../../../../src/actions/services'
import { buildNetworkPolicy } from '../../../../kubernetes/objects/securityGroup'
import * as securityActions from '../../../actions/securityGroup'

const notification = new Notification()
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
  colon: false,
}

class CreateSecurityGroup extends React.Component {

  state={
    isEdit: false,
    loading: false,
    current: {},
  }

  componentDidMount() {
    const { loadAllServices, cluster, location } = this.props
    const { pathname } = location
    if (pathname.indexOf('/app_manage/security_group/edit/') > -1) {
      this.setState({
        isEdit: true,
      }, this.setInitialStatus)
    }
    loadAllServices(cluster, {}, {
      failed: {
        func: err => {
          notification.warn('获取服务列表失败', err.message)
        },
      },
    })
  }

  setInitialStatus = () => {
    const { params, getfSecurityGroupDetail, cluster } = this.props
    getfSecurityGroupDetail(cluster, params.name, {
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn('获取列表数据出错', message.message)
        },
      },
    }).then(res => {
      this.setState({
        current: res.response.result.data,
      }, () => {
        const { current } = this.state
        const { setFieldsValue } = this.props.form
        const groupName = current.metadata && current.metadata.annotations['policy-name'] || ''
        const targetArr = current.spec && current.spec.podSelector.matchExpressions[0].values || []
        setFieldsValue({
          name: groupName,
          target: targetArr,
        })
        const { ingress, egress } = current.spec && current.spec
        if (ingress && ingress.length) {
          const num = ingress[0].from.length
          const ingressArr = []
          for (let i = 0; i < num; i++) {
            ingressArr.push(i)
          }
          setFieldsValue({
            ingress: ingressArr,
          })
          ingress[0].from.map((item, ind) => {
            // console.log( 'key1111', Object.keys(item)[0], item )
            switch (Object.keys(item)[0]) {
              case 'podSelector':
                switch (Object.keys(item[Object.keys(item)[0]].matchLabels)[0]) {
                  case 'tenxcloud.com/svcName':
                    return setFieldsValue({
                      [`ingress${ind}`]: 'service',
                      [`ingressservice${ind}`]: item.podSelector.matchLabels['tenxcloud.com/svcName'],
                    })
                  case 'tenxcloud.com/lb':
                    return setFieldsValue({
                      [`ingress${ind}`]: 'ingress',
                      [`ingressingress${ind}`]: item.podSelector.matchLabels['tenxcloud.com/lb'],
                    })
                  default:
                    return null
                }
              case 'namespaceSelector':
                return setFieldsValue({
                  [`ingress${ind}`]: 'namespace',
                  [`ingressnamespace${ind}`]: item.namespaceSelector.matchLabels['system/namespace'],
                })
              case 'ipBlock':
                return setFieldsValue({
                  [`ingress${ind}`]: 'cidr',
                  [`ingressnamespace${ind}`]: item.ipBlock.cidr,
                })
              default:
                return <span>---</span>
            }
          })
        }
        if (egress && egress.length) {
          const ln = egress[0].to.length
          const egressArr = []
          for (let i = 0; i < ln; i++) {
            egressArr.push(i)
          }
          setFieldsValue({
            egress: egressArr,
          })
          egress[0].to.map((item, ind) => {
            switch (Object.keys(item)[0]) {
              case 'podSelector':
                switch (Object.keys(item[Object.keys(item)[0]].matchLabels)[0]) {
                  case 'tenxcloud.com/svcName':
                    return setFieldsValue({
                      [`egress${ind}`]: 'service',
                      [`egressservice${ind}`]: item.podSelector.matchLabels['tenxcloud.com/svcName'],
                    })
                  default:
                    return null
                }
              case 'namespaceSelector':
                return setFieldsValue({
                  [`egress${ind}`]: 'namespace',
                  [`egressnamespace${ind}`]: item.namespaceSelector.matchLabels['system/namespace'],
                })
              case 'ipBlock':
                return setFieldsValue({
                  [`egress${ind}`]: 'cidr',
                  [`egressnamespace${ind}`]: item.ipBlock.cidr,
                })
              default:
                return <span>---</span>
            }
          })
        }
      })
    })
  }

  submit = () => {
    const { isEdit } = this.state
    const { form, createSecurityGroup, cluster, updateSecurityGroup } = this.props
    form.validateFields((errors, values) => {
      // console.log( '****', values )
      if (errors) {
        return
      }
      this.setState({ loading: true })
      const { name, target, ingress, egress } = values
      const ingList = []
      const egList = []
      if (ingress.length > 0) {
        ingress.map(el => {
          const type = values[`ingress${el}`]
          switch (type) {
            case 'cidr':
              return ingList.push({
                type: 'cidr',
                cidr: values[`ingress${type}${el}`],
                except: [ `ingress${type}${el}except` ],
              })
            case 'service':
              return ingList.push({
                type: 'service',
                serviceName: values[`ingress${type}${el}`],
              })
            case 'haproxy':
              return ingList.push({
                type: 'haproxy',
              })
            case 'ingress':
              return ingList.push({
                type: 'ingress',
                ingressId: values[`ingress${type}${el}`],
              })
            case 'namespace':
              return ingList.push({
                type: 'namespace',
                namespace: values[`ingress${type}${el}`],
              })
            default:
              return null
          }
        })
      }
      if (egress.length > 0) {
        egress.map(el => {
          const type = values[`egress${el}`]
          switch (type) {
            case 'cidr':
              return egList.push({
                type: 'cidr',
                cidr: values[`egress${type}${el}`],
                except: [ `egress${type}${el}except` ],
              })
            case 'service':
            case 'mysql':
            case 'redis':
              return egList.push({
                type: 'service',
                serviceName: values[`egress${type}${el}`],
              })
            case 'namespace':
              return egList.push({
                type: 'namespace',
                namespace: values[`egress${type}${el}`],
              })
            default:
              return null
          }
        })
      }
      const body = buildNetworkPolicy(name, target, ingList, egList)
      if (!isEdit) {
        createSecurityGroup(cluster, body, {
          success: {
            func: () => {
              notification.close()
              notification.success('新建安全组成功')
              this.setState({ loading: false })
              browserHistory.goBack()
            },
            isAsync: true,
          },
          failed: {
            func: error => {
              const { message } = error
              notification.close()
              notification.warn('新建安全组失败', message.message)
              this.setState({ loading: false })
            },
          },
        })
      } else {
        // const { metadata } = this.state.current
        // body.metadata.name = metadata.name
        // body.metadata.resourceVersion = metadata.resourceVersion
        updateSecurityGroup(cluster, body, {
          success: {
            func: () => {
              notification.close()
              notification.success('修改安全组成功')
              this.setState({ loading: false })
              browserHistory.goBack()
            },
            isAsync: true,
          },
          failed: {
            func: error => {
              const { message } = error
              notification.close()
              notification.warn('修改安全组失败', message.message)
              this.setState({ loading: false })
            },
          },
        })
      }
    })
  }
  render() {
    const { form, serverList } = this.props
    const { isEdit, loading } = this.state
    return <QueueAnim className="createSecurityGroup">
      <div className="createSecurityPage" key="security">
        {
          !isEdit ?
            <div className="securityGroudHeader">
              <span className="returnBtn">
                <span className="btnLeft"></span>
                <span className="btnRight" onClick={() => browserHistory.goBack()}>返回</span>
              </span>
              <span className="headerTitle">
                <span className="headerLeft"></span>
                <span>创建安全组</span>
              </span>
            </div>
            : null
        }
        <div className="securityGroudContent">
          <CreateNameAndTarget
            form={form}
            isEdit={isEdit}
            formItemLayout={formItemLayout}
            serverList={serverList}
          />
          <p className="whiteList">隔离对象的访问白名单</p>
          <IngressAndEgressWhiteList
            form={form}
            isEdit={isEdit}
          />
          <Row className="submitBtn">
            <Col span={4}></Col>
            <Col span={20}>
              <Button onClick={() => browserHistory.goBack()} style={{ marginRight: 8 }}>取消</Button>
              <Button type="primary" loading={loading} onClick={this.submit}>{ !isEdit ? '确定' : '保存' }</Button>
            </Col>
          </Row>
        </div>
      </div>
    </QueueAnim>
  }
}

const mapStateToProps = ({ entities: { current }, services: { serviceList: { services } } }) => {
  const serverList = []
  services && services.length > 0 && services.map(item => serverList.push(item.metadata.name))
  return {
    cluster: current.cluster.clusterID,
    serverList,
  }
}

export default connect(mapStateToProps, {
  loadAllServices: servicesActions.loadAllServices,
  createSecurityGroup: securityActions.createSecurityGroup,
  getfSecurityGroupDetail: securityActions.getfSecurityGroupDetail,
  updateSecurityGroup: securityActions.updateSecurityGroup,
})(Form.create()(CreateSecurityGroup))
