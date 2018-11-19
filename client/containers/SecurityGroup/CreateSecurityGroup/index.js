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
import { buildNetworkPolicy, parseNetworkPolicy } from '../../../../kubernetes/objects/securityGroup'
import * as securityActions from '../../../actions/securityGroup'
import Title from '../../../../src/components/Title'

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
    policyName: undefined,
    result: undefined,
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
          const { message, statusCode } = error
          notification.close()
          if (statusCode !== 403) {
            notification.warn('获取列表数据出错', message.message)
          }
        },
      },
    }).then(res => {
      const resData = res.response.result.data
      const result = parseNetworkPolicy(resData)
      const { name, targetServices } = result
      const { setFieldsValue } = this.props.form
      const metaName = resData.metadata && resData.metadata.name || ''
      setFieldsValue({
        name,
        target: targetServices,
      })
      this.setState({
        policyName: {
          name,
          metaName,
        },
      })
      this.setState({
        result,
      })
    })
  }

  cidrExcept = v => {
    const arr = v.split(',')
    const brr = []
    arr.forEach(item => {
      brr.push(item)
    })
    return brr
  }

  submit = () => {
    const { isEdit, policyName } = this.state
    const { form, createSecurityGroup, cluster,
      updateSecurityGroup, deleteSecurityGroup } = this.props
    form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      const { name, target, ingress, egress } = values
      const ingList = []
      const egList = []
      const data = {}
      if (ingress.length > 0) {
        ingress.map(el => {
          const type = values[`ingress${el}`]
          if (type === 'haproxy') {
            data.haproxy = this.props.proxiesArr
            values[`ingress${type}${el}`].forEach(item => {
              ingList.push({
                type: 'haproxy',
                groupId: item,
              })
            })
          }
          switch (type) {
            case 'cidr':
              if (!values[`ingress${type}${el}except`]) {
                return ingList.push({
                  type: 'cidr',
                  cidr: values[`ingress${type}${el}`],
                  except: null,
                })
              }
              return ingList.push({
                type: 'cidr',
                cidr: values[`ingress${type}${el}`],
                except: this.cidrExcept(values[`ingress${type}${el}except`]),
              })
            case 'service':
              return ingList.push({
                type: 'service',
                serviceName: values[`ingress${type}${el}`],
              })
            // case 'haproxy':
            //   data.haproxy = this.props.proxiesArr
            //   return ingList.push({
            //     type: 'haproxy',
            //     groupId: values[`ingress${type}${el}`],
            //   })
            case 'ingress':
              data.ingress = this.props.loadBalanceList
              return ingList.push({
                type: 'ingress',
                ingressId: values[`ingress${type}${el}`],
              })
            case 'namespace':
              return ingList.push({
                type: 'namespace',
                namespace: values[`ingress${type}${el}`],
                serviceName: values[`ingress${type}${el}server`]
                  && values[`ingress${type}${el}server`].split(','),
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
              if (!values[`egress${type}${el}except`]) {
                return egList.push({
                  type: 'cidr',
                  cidr: values[`egress${type}${el}`],
                  except: null,
                })
              }
              return egList.push({
                type: 'cidr',
                cidr: values[`egress${type}${el}`],
                except: [ values[`egress${type}${el}except`] ],
              })
            case 'service':
              return egList.push({
                type: 'service',
                serviceName: values[`egress${type}${el}`],
              })
            case 'namespace':
              return egList.push({
                type: 'namespace',
                namespace: values[`egress${type}${el}`],
                serviceName: values[`egress${type}${el}server`]
                  && values[`egress${type}${el}server`].split(','),
              })
            case 'mysql':
            case 'redis':
              return egList.push({
                type: 'daas',
                daasName: values[`egress${type}${el}`],
                daasType: values[`egress${el}`],
              })
            default:
              return null
          }
        })
      }
      const body = buildNetworkPolicy(name, target, ingList, egList, data)
      this.setState({ loading: true })
      const isChangeName = policyName && policyName.name === name
      if (!isEdit || !isChangeName) {
        if (!isChangeName && isEdit) {
          await deleteSecurityGroup(cluster, policyName.metaName, {
            failed: {
              func: error => {
                const { message, statusCode } = error
                notification.close()
                if (statusCode !== 403) {
                  notification.warn(`删除安全组 ${policyName.metaName} 失败`, message.message)
                }
              },
            },
          })
        }
        await createSecurityGroup(cluster, body, {
          success: {
            func: () => {
              notification.close()
              if (isEdit) {
                notification.success('修改安全组成功')
              } else {
                notification.success('新建安全组成功')
              }
              this.setState({ loading: false })
              browserHistory.push('/app_manage/security_group')
            },
            isAsync: true,
          },
          failed: {
            func: error => {
              const { message, statusCode } = error
              notification.close()
              if (statusCode !== 403) {
                if (isEdit) {
                  notification.success('修改安全组失败')
                } else if (statusCode === 422 && message.message.indexOf('not within CIDR range') > -1) {
                  notification.warn('输入的 cidr 范围错误', message.message)
                } else {
                  notification.warn('新建安全组失败', message.message)
                }
              }
              this.setState({ loading: false })
            },
          },
        })
      } else {
        updateSecurityGroup(cluster, body, {
          success: {
            func: () => {
              notification.close()
              notification.success('修改安全组成功')
              this.setState({ loading: false })
              browserHistory.push('/app_manage/security_group')
            },
            isAsync: true,
          },
          failed: {
            func: error => {
              const { message, statusCode } = error
              notification.close()
              if (statusCode !== 403) {
                notification.warn('修改安全组失败', message.message)
              }
              this.setState({ loading: false })
            },
          },
        })
      }
    })
  }
  render() {
    const { form, serverList } = this.props
    const { isEdit, loading, result } = this.state
    return <QueueAnim className="createSecurityGroup">
      <Title title="安全组" key="title"/>
      <div className="createSecurityPage" key="security">
        {
          !isEdit ?
            <div className="securityGroudHeader">
              <span className="returnBtn">
                <span className="btnLeft"></span>
                <span className="btnRight" onClick={() => browserHistory.push('/net-management/securityGroup')}>返回</span>
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
          {
            (!isEdit || (isEdit && result)) &&
            <IngressAndEgressWhiteList
              form={form}
              result={result}
            />
          }
          <Row className="submitBtn">
            <Col span={4}></Col>
            <Col span={20}>
              <Button onClick={() => browserHistory.push('/net-management/securityGroup')} style={{ marginRight: 8 }}>取消</Button>
              <Button type="primary" loading={loading} onClick={this.submit}>{ !isEdit ? '确定' : '保存' }</Button>
            </Col>
          </Row>
        </div>
      </div>
    </QueueAnim>
  }
}

const mapStateToProps = ({ entities: { current },
  services: { serviceList: { services } },
  cluster: { proxy },
  loadBalance: { loadBalanceList },
}) => {
  const serverList = []
  services && services.length > 0 && services.map(item => serverList.push(item.metadata.name))
  let proxiesArr = []
  if (proxy.result) {
    const cluster = Object.keys(proxy.result)[0]
    proxiesArr = proxy.result[cluster].data
  }
  return {
    cluster: current.cluster.clusterID,
    serverList,
    proxiesArr,
    loadBalanceList: loadBalanceList.data || [],
  }
}

export default connect(mapStateToProps, {
  loadAllServices: servicesActions.loadAllServices,
  createSecurityGroup: securityActions.createSecurityGroup,
  getfSecurityGroupDetail: securityActions.getfSecurityGroupDetail,
  updateSecurityGroup: securityActions.updateSecurityGroup,
  deleteSecurityGroup: securityActions.deleteSecurityGroup,
})(Form.create()(CreateSecurityGroup))
