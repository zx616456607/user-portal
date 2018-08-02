/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * SecurityGroup of AppDetailTab
 *
 * v0.1 - 2018-07-25
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'
import { connect } from 'react-redux'
import { Card, Button, Table, Modal, Form, Input, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import * as serviceAction from '../../../../src/actions/app_manage'
import Notification from '../../../../src/components/Notification'
import * as securityActions from '../../../actions/securityGroup'
import _difference from 'lodash/difference';
import { buildNetworkPolicy, parseNetworkPolicy } from '../../../../kubernetes/objects/securityGroup'

const notification = new Notification()
const FormItem = Form.Item
const Option = Select.Option
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

class SecurityGroupTab extends React.Component {

  state={
    relatedVisible: false,
    listData: [],
    targetArr: [],
    deleteVisible: false,
    current: '',
  }

  componentDidMount() {
    const { cluster, form, getSecurityGroupList, serviceDetail } = this.props
    form.setFieldsValue({ name: Object.keys(serviceDetail[cluster])[ 0 ] })
    this.loadListData()
    getSecurityGroupList(cluster, {})
  }

  loadListData = () => {
    const { getServiceReference, cluster, serviceDetail } = this.props
    const query = {
      service: Object.keys(serviceDetail[cluster])[ 0 ],
    }
    getServiceReference(cluster, query, {
      success: {
        func: res => {
          const arr = []
          const targetArr = []
          res.data.map(item => {
            targetArr.push(item.metadata.name)
            return arr.push({
              name: item.metadata.annotations.policyName,
              metaName: item.metadata.name,
            })
          })
          this.setState({
            listData: arr,
            targetArr,
          })
        },
      },
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn('获取安全组列表数据出错', message.message)
        },
      },
    })
  }
  relatedGroup = () => {
    this.setState({
      relatedVisible: !this.state.relatedVisible,
    })
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      target: this.state.targetArr,
    })
  }

  handleOk = () => {
    const { form, getfSecurityGroupDetail, updateSecurityGroup, cluster } = this.props
    form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      const add = _difference(values.target, this.state.targetArr)
      const remove = _difference(this.state.targetArr, values.target)
      const addArray = []
      const removeArray = []
      add.map(item => {
        return addArray.push(
          getfSecurityGroupDetail(cluster, item, {
            failed: {
              func: error => {
                const { message } = error
                notification.close()
                notification.warn('获取详情出错', message.message)
              },
            },
          }).then(res => {
            const resData = res.response.result.data
            const result = parseNetworkPolicy(resData)
            const { ingress, egress, name, targetServices } = result
            targetServices.push(values.name)
            const body = buildNetworkPolicy(name, targetServices, ingress || [], egress || [])
            return updateSecurityGroup(cluster, body, {
              failed: {
                func: error => {
                  const { message } = error
                  notification.close()
                  notification.warn('修改安全组失败', message.message)
                },
              },
            })
          })
        )
      })
      remove.map(item => {
        return removeArray.push(
          getfSecurityGroupDetail(cluster, item, {
            failed: {
              func: error => {
                const { message } = error
                notification.close()
                notification.warn('获取详情出错', message.message)
              },
            },
          }).then(res => {
            const resData = res.response.result.data
            const result = parseNetworkPolicy(resData)
            const { ingress, egress, name, targetServices } = result
            const serviceArr = targetServices.filter(el => el !== values.name)
            const body = buildNetworkPolicy(name, serviceArr, ingress || [], egress || [])
            return updateSecurityGroup(cluster, body, {
              failed: {
                func: error => {
                  const { message } = error
                  notification.close()
                  notification.warn('修改安全组失败', message.message)
                },
              },
            })
          })
        )
      })
      await Promise.all(addArray)
      await Promise.all(removeArray)
      this.relatedGroup()
      this.loadListData()
    })
  }

  confirmRemoveRelate = () => {
    const { current } = this.state
    const { getfSecurityGroupDetail, updateSecurityGroup, cluster, serviceDetail } = this.props
    const serviceName = Object.keys(serviceDetail[cluster])[ 0 ]
    getfSecurityGroupDetail(cluster, current.metaName, {
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn('获取详情出错', message.message)
        },
      },
    }).then(res => {
      const resData = res.response.result.data
      const result = parseNetworkPolicy(resData)
      const { ingress, egress, name, targetServices } = result
      const serviceArr = targetServices.filter(el => el !== serviceName)
      const body = buildNetworkPolicy(name, serviceArr, ingress || [], egress || [])
      return updateSecurityGroup(cluster, body, {
        success: {
          func: () => {
            this.changeRemoveStatus()
            this.loadListData()
          },
          isAsync: true,
        },
        failed: {
          func: error => {
            const { message } = error
            notification.close()
            notification.warn('移除关联安全组失败', message.message)
          },
        },
      })
    })

  }
  changeRemoveStatus = record => {
    this.setState({
      deleteVisible: !this.state.deleteVisible,
      current: record && record || '',
    })
  }
  render() {
    const { relatedVisible, listData, deleteVisible, current } = this.state
    const { form, selectData } = this.props
    const { getFieldProps } = form
    const columns = [
      {
        title: '安全组名称',
        key: 'name',
        dataIndex: 'name',
        width: '55%',
      }, {
        title: '操 作',
        key: 'opearater',
        dataIndex: 'opearater',
        width: '40%',
        render: (key, record) => <Button type="ghost" onClick={() => this.changeRemoveStatus(record)}>移除关联</Button>,
      }]
    return (
      <Card id="securityTab">
        <Modal
          title="关联安全组"
          visible={relatedVisible}
          onOk={this.handleOk}
          onCancel={this.relatedGroup}
        >
          <div className="relateCont">
            <FormItem
              label="服务名称"
              {...formItemLayout}>
              <Input
                disabled
                style={{ width: 300 }}
                {...getFieldProps('name')}
              />
            </FormItem>
            <FormItem
              label="安全组"
              {...formItemLayout}
            >
              <Select
                multiple
                size="large"
                style={{ width: 300 }}
                {...getFieldProps('target', {
                  rules: [{
                    required: true,
                    message: '请选择服务',
                  }],
                })}
              >
                {
                  selectData.map(item => {
                    return <Option value={item.metaName} key={item.metaName}>{item.name}</Option>
                  })
                }
              </Select>
            </FormItem>
          </div>
        </Modal>
        <Modal
          title="移除关联"
          visible={deleteVisible}
          onOk={this.confirmRemoveRelate}
          onCancel={this.changeRemoveStatus}
          okText={'移除关联'}
        >
          <div className="securityGroupContent">
            <i className="fa fa-exclamation-triangle modalIcon" aria-hidden="true"></i>
            <div>
              <p>移除关联安全组导致隔离不再生效，请谨慎操作</p>
              <p>确认移除关联安全组 {current.name} ？</p>
            </div>
          </div>
        </Modal>
        <QueueAnim>
          <div className="securityTit" key="securityTit">安全组 (防火墙)</div>
          <div className="securityCont" key="securityCont">
            <div className="securityText">
              <p >
                安全组是由同一个集群内，具有相同安全保护需求并相互信任的服务组成
              </p>
              <p>
                安全组内服务互通，安全组外服务需配置（ingress/egress）白名单规则
              </p>
            </div>
            <div className="securityBtn">
              <Button type="primary" onClick={this.relatedGroup}>
                <i className="fa fa-plus"/>
                关联安全组
              </Button>
              <Button
                type="ghost"
                onClick={this.loadListData}>
                <i className="fa fa-refresh"/>
                刷新
              </Button>
            </div>
            <Table
              className="securityTable"
              columns={columns}
              dataSource={listData}
              pagination={false}
              // loading={ isFetching }
            />
          </div>
        </QueueAnim>
      </Card>
    )
  }
}

const mapStateToProps = ({
  entities: { current },
  services: { serviceDetail },
  securityGroup: { getSecurityGroupList: { data } },
}) => {
  const selectData = []
  data && data.map(item => selectData.push({
    name: item.metadata.annotations['policy-name'],
    metaName: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    serviceDetail,
    selectData,
  }
}

export default connect(mapStateToProps, {
  getServiceReference: serviceAction.getServiceReference,
  getSecurityGroupList: securityActions.getSecurityGroupList,
  getfSecurityGroupDetail: securityActions.getfSecurityGroupDetail,
  updateSecurityGroup: securityActions.updateSecurityGroup,
})(Form.create()(SecurityGroupTab))
