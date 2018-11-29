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
import _difference from 'lodash/difference'
import { buildNetworkPolicy, parseNetworkPolicy } from '../../../../kubernetes/objects/securityGroup'
import ServiceCommonIntl, { AppServiceDetailIntl } from '../../../../src/components/AppModule/ServiceIntl'
import { injectIntl } from 'react-intl'

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
    sm: { span: 16 },
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
    const { formatMessage } = this.props.intl
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
              name: item.metadata && item.metadata.annotations.policyName,
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
          const { message, statusCode } = error
          notification.close()
          if (statusCode !== 403) {
            notification.warn(formatMessage(AppServiceDetailIntl.getSecurityGroupErrorInfo),
              message.message)
          }
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
    const { formatMessage } = this.props.intl
    form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      const add = _difference(values.target, this.state.targetArr).map(key => ({ key, type: 'add' }))
      const remove = _difference(this.state.targetArr, values.target).map(key => ({ key, type: 'remove' }))
      const changeArray = []
      const conbineArr = add.concat(remove)
      conbineArr.forEach(item => {
        changeArray.push(
          getfSecurityGroupDetail(cluster, item.key, {
            failed: {
              func: error => {
                const { message, statusCode } = error
                notification.close()
                if (statusCode !== 403) {
                  notification.warn(formatMessage(AppServiceDetailIntl.getDetailErrorInfo),
                    message.message)
                }
              },
            },
          }).then(res => {
            const resData = res.response.result.data
            const result = parseNetworkPolicy(resData)
            const { ingress, egress, name, targetServices } = result
            let newArr = []
            if (item.type === 'add') {
              targetServices.push(values.name)
              newArr = targetServices
            } else if (item.type === 'remove') {
              newArr = targetServices.filter(el => el !== values.name)
            }
            const body = buildNetworkPolicy(name, newArr, ingress || [], egress || [])
            return updateSecurityGroup(cluster, body, {
              failed: {
                func: error => {
                  const { message, statusCode } = error
                  notification.close()
                  if (statusCode !== 403) {
                    notification.warn(
                      formatMessage(AppServiceDetailIntl.changeSecurityGroupFailure),
                      message.message)
                  }
                },
              },
            })
          })
        )
      })
      await Promise.all(changeArray)
      this.relatedGroup()
      this.loadListData()
    })
  }

  confirmRemoveRelate = () => {
    const { current } = this.state
    const { formatMessage } = this.props.intl
    const { getfSecurityGroupDetail, updateSecurityGroup, cluster, serviceDetail } = this.props
    const serviceName = Object.keys(serviceDetail[cluster])[ 0 ]
    getfSecurityGroupDetail(cluster, current.metaName, {
      failed: {
        func: error => {
          const { message, statusCode } = error
          notification.close()
          if (statusCode !== 403) {
            notification.warn(
              formatMessage(AppServiceDetailIntl.getDetailErrorInfo),
              message.message)
          }
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
            const { message, statusCode } = error
            notification.close()
            if (statusCode !== 403) {
              notification.warn(
                formatMessage(AppServiceDetailIntl.removeRelactionSecurityGroupFailure),
                message.message
              )
            }
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
    const { formatMessage } = this.props.intl
    const columns = [
      {
        title: formatMessage(AppServiceDetailIntl.SecurityGroupName),
        key: 'name',
        dataIndex: 'name',
        width: '55%',
      }, {
        title: formatMessage(ServiceCommonIntl.operation),
        key: 'opearater',
        dataIndex: 'opearater',
        width: '40%',
        render: (key, record) => <Button type="ghost" onClick={() => this.changeRemoveStatus(record)}>
          {formatMessage(AppServiceDetailIntl.removeRelation)}</Button>,
      }]
    return (
      <Card id="securityTab">
        <Modal
          title={formatMessage(AppServiceDetailIntl.rleationRecurityGroup)}
          visible={relatedVisible}
          onOk={this.handleOk}
          onCancel={this.relatedGroup}
        >
          <div className="relateCont">
            <FormItem
              label={formatMessage(AppServiceDetailIntl.serviceName)}
              {...formItemLayout}>
              <Input
                disabled
                {...getFieldProps('name')}
              />
            </FormItem>
            <FormItem
              label={formatMessage(AppServiceDetailIntl.SecurityGroup)}
              {...formItemLayout}
            >
              <Select
                multiple
                size="large"
                style={{ width: '100%' }}
                {...getFieldProps('target', {
                  rules: [{
                    required: true,
                    message: formatMessage(AppServiceDetailIntl.pleaseChoiceSecurityGroup),
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
          title={formatMessage(AppServiceDetailIntl.removeRelation)}
          visible={deleteVisible}
          onOk={this.confirmRemoveRelate}
          onCancel={this.changeRemoveStatus}
          okText={formatMessage(AppServiceDetailIntl.removeRelation)}
        >
          <div className="securityGroupContent">
            <i className="fa fa-exclamation-triangle modalIcon" aria-hidden="true"></i>
            <div>
              <p>{formatMessage(AppServiceDetailIntl.removeRelationRecurityGroupInfo)}</p>
              <p>{formatMessage(AppServiceDetailIntl.confirmRmoveSecurityGroup,
                { name: current.name })}</p>
            </div>
          </div>
        </Modal>
        <QueueAnim>
          <div className="securityTit" key="securityTit">
            {formatMessage(AppServiceDetailIntl.fireWall)}
          </div>
          <div className="securityCont" key="securityCont">
            <div className="securityText">
              <p >
                {formatMessage(AppServiceDetailIntl.SecurityGroupComposeInfo)}
              </p>
              <p>
                {formatMessage(AppServiceDetailIntl.SecurityGroupIngressRules)}
              </p>
            </div>
            <div className="securityBtn">
              <Button type="primary" onClick={this.relatedGroup}>
                <i className="fa fa-plus"/>
                {formatMessage(AppServiceDetailIntl.noRelationSecurityGroup)}
              </Button>
              <Button
                type="ghost"
                onClick={this.loadListData}>
                <i className="fa fa-refresh"/>
                {formatMessage(ServiceCommonIntl.refresh)}
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
    name: item.metadata && item.metadata.annotations['policy-name'],
    metaName: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    serviceDetail,
    selectData,
  }
}

export default injectIntl(connect(mapStateToProps, {
  getServiceReference: serviceAction.getServiceReference,
  getSecurityGroupList: securityActions.getSecurityGroupList,
  getfSecurityGroupDetail: securityActions.getfSecurityGroupDetail,
  updateSecurityGroup: securityActions.updateSecurityGroup,
})(Form.create()(SecurityGroupTab)), { withRef: true })
