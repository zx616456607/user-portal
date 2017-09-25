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
import {
  Modal, Form, Input, Select, Button,
  InputNumber, Row, Col, Icon
} from 'antd'
import { connect } from 'react-redux'
import {
  loadAllServices, updateAutoScale, checkAutoScaleName
} from '../../../../actions/services'
import {
  loadNotifyGroups
} from '../../../../actions/alert'
import Notification from '../../../Notification'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import isEmpty from 'lodash/isEmpty'
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
    loadAllServices(clusterID, {
      pageIndex: 1,
      pageSize: -1,
    })
    loadNotifyGroups(null, clusterID)
  }
  componentWillReceiveProps(nextProps) {
    const { visible: newVisible, scope, form } = nextProps
    const { visible: oldVisible } = this.props
    if (oldVisible && !newVisible) {
      scope.setState({
        scaleModal: false,
        scaleDetail: null,
        create: false,
        reuse: false
      })
      form.resetFields()
    }
  }
  cancelModal = () => {
    const { scope } = this.props
    scope.setState({
      scaleModal: false
    })
  }
  confirmModal = () => {
    const { scope, form, updateAutoScale, clusterID, create, scaleDetail } = this.props
    const { validateFields, resetFields, setFields } = form
    let notify = new Notification()
    validateFields((errors, values) => {
      if (values.cpu) {
        setFields({
          memory: {
            errors: null,
            value: values.memory
          }
        })
      }
      if (values.memory) {
        setFields({
          cpu: {
            errors: null,
            value: values.cpu
          }
        })
      }
      if (!!errors) {
        return
      }
      this.setState({
        btnLoading: true
      })
      const msgSpin = create ? '创建中...' : '修改中'
      notify.spin(msgSpin)
      const { scale_strategy_name, serviceName, min, max, cpu, memory, alert_strategy, alert_group} = values
      let body = { scale_strategy_name, min, max, cpu, memory, alert_strategy, alert_group, type: create ? 1 : scaleDetail.type }
      body = Object.assign(body, {operationType: create ? 'create' : 'update'})
      updateAutoScale(clusterID, serviceName, body, {
        success: {
          func: () => {
            this.setState({
              btnLoading: false,
            })
            scope.setState({
              scaleModal: false
            })
            scope.loadData(clusterID, 1)
            notify.close()
            notify.success('操作成功')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            this.setState({
              btnLoading: false,
            })
            scope.setState({
              scaleModal: false
            })
            notify.close()
            notify.error('操作失败')
            resetFields()
          }
        }
      })
    })
  }
  checkScaleName = (rule, value, callback) => {
    const { checkAutoScaleName, clusterID, form, create } = this.props
    const { getFieldValue } = form
    if (!value) {
      callback('请输入策略名称')
    }
    const service_name = create ? getFieldValue('serviceName') : ''
    clearTimeout(this.checkScaleNameExist)
    this.checkScaleNameExist = setTimeout(() => {
      checkAutoScaleName(clusterID, {
        service_name,
        strategy_name: value
      }, {
        success: {
          func: () => {
            callback()
          },
        },
        failed: {
          func: res => {
            if (res.statusCode === 400) {
              callback('该策略名称已经存在')
            }
            callback()
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  checkServiceName = (rule, value, callback) => {
    const { checkAutoScaleName, clusterID, form } = this.props
    const { getFieldValue } = form
    if (!value) {
      callback('请选择服务')
    }
    const strategy_name = getFieldValue('scale_strategy_name') || ''
    clearTimeout(this.checkSerivceNameExist)
    this.checkSerivceNameExist = setTimeout(() => {
      checkAutoScaleName(clusterID, {
        service_name: value,
        strategy_name,
      }, {
        success: {
          func: () => {
            callback()
          },
        },
        failed: {
          func: res => {
            if (res.statusCode === 400) {
              callback('该服务已经关联弹性伸缩策略')
            }
            callback()
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  checkCpu = (rule, value, callback) => {
    const { form } = this.props
    const { getFieldValue } = form
    let memoryValue = getFieldValue('memory')
    if (!value && !memoryValue) {
      callback('请输入CPU阈值')
    }
    callback()
  }
  checkMemory = (rule, value, callback) => {
    const { form } = this.props
    const { getFieldValue } = form
    let cpuValue = getFieldValue('cpu')
    if (!value && !cpuValue) {
      callback('请输入内存阈值')
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
    const { visible, form, services, alertList, scaleDetail, create, reuse } = this.props
    const { getFieldProps, isFieldValidating, getFieldError } = form
    const formItemLargeLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 16}
    }
    const formItemSmallLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 10}
    }
    const scaleName = getFieldProps('scale_strategy_name', {
      rules: [{
        validator: this.checkScaleName.bind(this),
      }],
      initialValue: create || isEmpty(scaleDetail) ? undefined: scaleDetail.scale_strategy_name
    })
    const selectService = getFieldProps('serviceName', {
      rules: [{
        validator: create ? this.checkServiceName.bind(this) : null,
      }],
      initialValue: create || isEmpty(scaleDetail) ? undefined: scaleDetail.serviceName
    })
    const minReplicas = getFieldProps('min', {
      rules: [{
        required: true,
        message: '请输入最小实例数'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.min
    })
    const maxReplicas = getFieldProps('max', {
      rules: [{
        required: true,
        message: '请输入最大实例数'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.max
    })
    const cpuProps = getFieldProps('cpu', {
      rules: [{
        validator: this.checkCpu.bind(this),
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.cpu
    })
    const memoryProps = getFieldProps('memory', {
      rules: [{
        validator: this.checkMemory.bind(this),
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.memory
    })
    const selectEmailSendType = getFieldProps('alert_strategy', {
      rules: [{
        required: true,
        message: '请选择邮件发送方式'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.alert_strategy
    })
    const selectAlertGroup = getFieldProps('alert_group', {
      rules: [{
        required: true,
        message: '请选择告警通知组'
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.alert_group
    })
    return(
      <Modal
      title={reuse ? '复用自动伸缩侧漏' : (isEmpty(scaleDetail) ? "创建自动伸缩策略" : "修改自动伸缩策略")}
      visible={visible}
      footer={this.renderFooter()}
      onCancel={this.cancelModal}
      onOk={this.confirmModal}>
        <Form form={form}>
          <FormItem
            {...formItemLargeLayout}
            label="策略名称"
            hasFeedback
            help={isFieldValidating('scale_strategy_name') ? '校验中...' : (getFieldError('scale_strategy_name') || []).join(', ')}
          >
            <Input type="text" {...scaleName} placeholder="请输入策略名称"/>
          </FormItem>
          <FormItem
            {...formItemLargeLayout}
            label="选择服务"
          >
            <Select
              showSearch
              disabled={create ? false: true}
              optionFilterProp="children"
              notFoundContent="无法找到"
              {...selectService}
              placeholder="请选择服务">
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
          <Row style={{margin: '-10px 0 10px'}}>
            <Col span={4}/>
            <Col span={16}>
              <Icon type="exclamation-circle-o" /> 所有实例平均使用率超过阈值自动扩展，n-1个实例平均值低于阈值自动收缩
            </Col>
          </Row>
          <FormItem
            {...formItemSmallLayout}
            label="内存阈值"
          >
            <InputNumber {...memoryProps}/> %
          </FormItem>
          <Row style={{margin: '-10px 0 10px'}}>
            <Col span={4}/>
            <Col span={16}>
              <Icon type="exclamation-circle-o" /> 所有实例平均使用率超过阈值自动扩展，n-1个实例平均值低于阈值自动收缩
            </Col>
          </Row>
          <FormItem
            {...formItemLargeLayout}
            label="发送邮件"
          >
            <Select
              {...selectEmailSendType}
              placeholder="请选择邮件发送方式"
              showSearch
              optionFilterProp="children"
              notFoundContent="无法找到">
              {
                sendEmailOpt.map(item => <Option key={item.type} value={item.type}>{item.text}</Option>)
              }
            </Select>
          </FormItem>
          <FormItem
            {...formItemLargeLayout}
            label="告警通知组"
          >
            <Select
              {...selectAlertGroup}
              placeholder="请选择告警通知组"
              showSearch
              optionFilterProp="children"
              notFoundContent="无法找到">
              {
                alertList && alertList.length && alertList.map(item =>
                  <Option key={item.name} value={item.groupID}>{item.name}</Option>
                )
              }
            </Select>
          </FormItem>
          <Row style={{margin: '-10px 0 10px'}}>
            <Col span={4}/>
            <Col span={16}>
              <Icon type="exclamation-circle-o" /> 发生弹性伸缩时会向该通知组发送邮件通知
            </Col>
          </Row>
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
  loadNotifyGroups,
  checkAutoScaleName
})(AutoScaleModal)