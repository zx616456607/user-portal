/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoScale Modal
 *
 * v0.1 - 2017-09-19
 * @author zhangxuan
 */

import React from 'react'
import { Modal, Form, Input, Select, Button, InputNumber } from 'antd'
import { connect } from 'react-redux'
import {
  loadAllServices, updateAutoScale,
} from '../../../../actions/services'
import {
  loadNotifyGroups
} from '../../../../actions/alert'
import Notification from '../../../Notification'
const FormItem = Form.Item
const Option = Select.Option;

const sendEmailOpt = [{
  type: 'SendEmailWhenScale',
  text: '伸缩时发送邮件'
}, {
  type: 'SendEmailWhenScaleUp',
  text: '扩展时发送邮件'
}, {
  type: 'SendEmailWHenScaleDown',
  text: '收缩时发送邮件'
}, {
  type: 'SendNoEmail',
  text: '不发送邮件'
}]

class AutoScaleModal extends React.Component {
  constructor() {
    super()
    this.state = {
      btnLoading: false
    }
  }
  componentDidMount() {
    const { loadAllServices, clusterID, loadNotifyGroups } = this.props
    console.log(clusterID,'will')
    loadAllServices(clusterID, {
      pageIndex: 1,
      pageSize: -1,
    })
    loadNotifyGroups(null, clusterID)
  }
  componentWillReceiveProps(nextProps) {
    const { visible: newVisible, scope } = nextProps
    const { visible: oldVisible } = this.props
    if (!oldVisible && newVisible) {
      scope.setState({
        scaleModal: true
      })
    } else if (oldVisible && !newVisible) {
      scope.setState({
        scaleModal: false
      })
    }
  }
  cancelModal = () => {
    const { scope } = this.props
    scope.setState({
      scaleModal: false
    })
  }
  confirmModal = () => {
    const { scope, form, updateAutoScale, clusterID } = this.props
    const { validateFields, resetFields } = form
    let notify = new Notification()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        btnLoading: true
      })
      notify.spin('创建中...')
      const { serviceName, min, max, cpu, memory, alert_strategy, alert_group} = values
      updateAutoScale(clusterID, serviceName, { min, max, cpu, memory, alert_strategy, alert_group, type: 1 }, {
        success: {
          func: () => {
            this.setState({
              btnLoading: false,
              scaleModal: false
            })
            scope.loadData(1)
            notify.close()
            notify.success('创建成功')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            this.setState({
              btnLoading: false,
              scaleModal: false
            })
            notify.close()
            notify.error('创建失败')
            resetFields()
          }
        }
      })
    })
  }
  checkScaleName = (rule, value, callback) => {
    if (!value) {
      callback('请输入策略名称')
    }
    callback()
  }
  renderFooter = () => {
    const { btnLoading } = this.state
    return [
      <Button key="cancel" size="large" onClick={this.cancelModal}>取消</Button>,
      <Button key="confirm" type="primary" size="large" loading={btnLoading} onClick={this.confirmModal}>确定</Button>
    ]
  }
  render() {
    const { visible, form, services, alertList } = this.props
    const { getFieldProps } = form
    const formItemLargeLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 16}
    }
    const formItemSmallLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 10}
    }
    const scaleName = getFieldProps('scaleName', {
      rules: [{
        // required: true,
        message: '请输入策略名称'
      }],
      validator: this.checkScaleName.bind(this)
    })
    const selectService = getFieldProps('serviceName', {
      rules: [{
        required: true,
        message: '请选择服务'
      }]
    })
    const minReplicas = getFieldProps('min', {
      rules: [{
        required: true,
        message: '请输入最小实例数'
      }]
    })
    const maxReplicas = getFieldProps('max', {
      rules: [{
        required: true,
        message: '请输入最大实例数'
      }]
    })
    const cpuProps = getFieldProps('cpu', {
      rules: [{
        required: true,
        message: '请输入CPU阈值'
      }]
    })
    const memoryProps = getFieldProps('memory', {
      rules: [{
        required: true,
        message: '请输入内存阈值'
      }]
    })
    const selectEmailSendType = getFieldProps('alert_strategy', {
      rules: [{
        required: true,
        message: '请选择邮件发送方式'
      }]
    })
    const selectAlertGroup = getFieldProps('alert_group', {
      rules: [{
        required: true,
        message: '请选择告警通知组'
      }]
    })
    return(
      <Modal
      title="创建自动伸缩策略"
      visible={visible}
      footer={this.renderFooter()}
      onCancel={this.cancelModal}
      onOk={this.confirmModal}>
        <Form form={form}>
          <FormItem
            {...formItemLargeLayout}
            label="策略名称"
          >
            <Input type="text" {...scaleName} placeholder="请输入策略名称"/>
          </FormItem>
          <FormItem
            {...formItemLargeLayout}
            label="选择服务"
          >
            <Select {...selectService} placeholder="请选择服务">
              {
                services && services.length && services.map(item => 
                  <Option key={item.metadata.name} value={item.metadata.name}>{item.metadata.name}</Option>)
              }
            </Select>
          </FormItem>
          <FormItem
            {...formItemSmallLayout}
            label="最小实例数"
          >
            <InputNumber {...minReplicas}/> 个
          </FormItem>
          <FormItem
            {...formItemSmallLayout}
            label="最大实例数"
          >
            <InputNumber {...maxReplicas}/> 个
          </FormItem>
          <FormItem
            {...formItemSmallLayout}
            label="CPU阈值"
          >
            <InputNumber {...cpuProps}/> %
          </FormItem>
          <FormItem
            {...formItemSmallLayout}
            label="内存阈值"
          >
            <InputNumber {...memoryProps}/> %
          </FormItem>
          <FormItem
            {...formItemLargeLayout}
            label="发送邮件"
          >
            <Select {...selectEmailSendType} placeholder="请选择邮件发送方式">
              {
                sendEmailOpt.map(item => <Option key={item.type} value={item.type}>{item.text}</Option>)
              }
            </Select>
          </FormItem>
          <FormItem
            {...formItemLargeLayout}
            label="告警通知组"
          >
            <Select {...selectAlertGroup} placeholder="请选择告警通知组">
              {
                alertList && alertList.length && alertList.map(item => 
                  <Option key={item.name} value={item.groupID}>{item.name}</Option>
                )
              }
            </Select>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { clusterID } = cluster || { clusterID: ''}
  const { serviceList } = state.services || { serviceList: {}}
  const { groups } = state.alert || { groups: {} }
  const { result } = groups || { result: {}}
  const { data: alertList } = result || { data: [] }
  const { services } = serviceList || { services: []}
  return {
    clusterID,
    services,
    alertList
  }
}

AutoScaleModal = Form.create()(AutoScaleModal)

export default connect(mapStateToProps, {
  loadAllServices,
  updateAutoScale,
  loadNotifyGroups
})(AutoScaleModal)