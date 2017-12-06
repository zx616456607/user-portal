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
import {connect} from 'react-redux'
import { Link } from 'react-router'
import {
  loadAllServices, updateAutoScale, checkAutoScaleName
} from '../../../../actions/services'
import {
  loadNotifyGroups
} from '../../../../actions/alert'
import Notification from '../../../Notification'
import {ASYNC_VALIDATOR_TIMEOUT} from '../../../../constants'
import { autoScaleNameCheck } from '../../../../common/naming_validation'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import './style/index.less'

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
const thresholdKey = ['cpu', 'memory']

class AutoScaleModal extends React.Component {
  constructor() {
    super()
    this.state = {
      btnLoading: false,
      thresholdArr: [0],
      cpuAndMemory: []
    }
    this.uuid = 0
  }

  componentDidMount() {
    const {scaleDetail} = this.props
    this.initThresholdArr(scaleDetail)
  }

  componentWillReceiveProps(nextProps) {
    const {visible: newVisible, scope, form, scaleDetail, loadAllServices, clusterID, loadNotifyGroups } = nextProps
    const {visible: oldVisible} = this.props
    if (oldVisible && !newVisible) {
      scope.setState({
        scaleModal: false,
        scaleDetail: null,
        create: false,
        reuse: false,
      })
      this.setState({
        thresholdArr: [0],
        cpuAndMemory: []
      })
      this.uuid = 0
      form.resetFields()
    }
    if (!oldVisible && newVisible) {
      setTimeout(() => {
        document.getElementById('scale_strategy_name') && document.getElementById('scale_strategy_name').focus()
      }, 0)
      this.initThresholdArr(scaleDetail)
      loadAllServices(clusterID, {
        pageIndex: 1,
        pageSize: -1,
      })
      loadNotifyGroups(null, clusterID)
    }
  }
  initThresholdArr = scaleDetail => {
    const { setFieldsValue } = this.props.form
    if (isEmpty(scaleDetail)) {
      return
    }
    setFieldsValue({'alert_group': scaleDetail.alert_group})
    let arr = []
    for (let [key, value] of Object.entries(scaleDetail)) {
      if (thresholdKey.includes(key) && value) {
        this.uuid++
        arr.push({
          [key]: value
        })
      }
    }
    this.setState({
      cpuAndMemory: arr,
      thresholdArr: arr.map((item, index) => index)
    })
  }
  cancelModal = () => {
    const {scope} = this.props
    scope.setState({
      scaleModal: false,
    })
    this.setState({
      thresholdArr: [0],
      cpuAndMemory: []
    })
    this.uuid = 0
  }
  confirmModal = () => {
    const {scope, form, updateAutoScale, clusterID, create, scaleDetail} = this.props
    const { thresholdArr } = this.state
    const {validateFields, resetFields, getFieldValue} = form
    let notify = new Notification()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      let opt = {}
      const isGroupHide = values.alert_strategy === 'SendNoEmail'
      thresholdArr.forEach(item => {
        let key = getFieldValue(`type${item}`)
        let value = getFieldValue(`value${item}`)
        opt = Object.assign(opt, { [key]: value})
      })
      this.setState({
        btnLoading: true
      })
      const msgSpin = create ? '创建中...' : '修改中'
      notify.spin(msgSpin)
      const {scale_strategy_name, serviceName, min, max, alert_strategy, alert_group} = values
      let body = {
        scale_strategy_name,
        min,
        max,
        alert_strategy,
        alert_group,
        ...opt,
        type: create ? 1 : scaleDetail.type
      }
      isGroupHide ? body.alert_group = '' : ''
      body = Object.assign(body, {operationType: create ? 'create' : 'update'})
      updateAutoScale(clusterID, serviceName, body, {
        success: {
          func: () => {
            this.setState({
              btnLoading: false,
              thresholdArr: [0],
              cpuAndMemory: []
            })
            this.uuid = 0
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
              thresholdArr: [0],
              cpuAndMemory: []
            })
            this.uuid = 0
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
    const {checkAutoScaleName, clusterID, form, create, scaleDetail} = this.props
    const {getFieldValue} = form
    let message = autoScaleNameCheck(value) 
    if (message !== 'success') {
      return callback(message)
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
          isAsync: true
        },
        failed: {
          func: res => {
            if (res.statusCode === 400) {
              callback('该策略名称已经存在')
            }
            callback()
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  checkServiceName = (rule, value, callback) => {
    const {checkAutoScaleName, clusterID, form, create} = this.props
    const {getFieldValue} = form
    if (!create) {
      return callback()
    }
    if (!value) {
      return callback('请选择服务')
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
          isAsync: true
        },
        failed: {
          func: res => {
            if (res.statusCode === 400) {
              callback('该服务已经关联弹性伸缩策略')
            }
            callback()
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  checkMin = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    const max = getFieldValue('max')
    if (!value && value !== 0) {
      return callback('请输入最小实例数')
    }
    if (value < 1) {
      return callback('最小实例不能少于1个')
    }
    if (value >= max) {
      return callback('最小实例数不能等于或者超过最大实例数')
    }
    callback()
  }
  checkMax = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    const min = getFieldValue('min')
    if (!value) {
      return callback('请输入最大实例数')
    }
    if (value > 10) {
      return callback('最大实例不能超过10个')
    }
    if (value <= min) {
      return callback('最大实例数不能等于或者少于最小实例数')
    }
    callback()
  }
  checkEmail = (rule, value, callback) => {
    if (!value) {
      return callback('请选择邮件发送方式')
    }
    callback()
  }
  checkAlert = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    const isGroupHide = getFieldValue('alert_strategy') === 'SendNoEmail'
    if (!value && !isGroupHide) {
      return callback('请选择告警通知组')
    }
    callback()
  }
  checkType = (rule, value, callback, key) => {
    const { form } = this.props
    const { getFieldValue } = form
    const { thresholdArr } = this.state
    if (!value) {
      return callback('请选择类型')
    }
    let newValue = getFieldValue(`type${key}`)
    const result = thresholdArr.some(item => {
      if (item === key) {
        return false
      }
      let existValue = getFieldValue(`type${item}`)
      if (newValue === existValue) {
        return true
      }
    })
    if (result) {
      return callback('阈值类型重复')
    }
    callback()
  }
  checkValue(rule, value, callback) {
    if (!value && value !== 0) {
      return callback('请输入阈值')
    }
    if (value < 1 || value > 99) {
      return callback('阈值范围为1至99')
    }
    callback()
  }
  addRule = () => {
    const { form } = this.props
    const { thresholdArr } = this.state
    const { validateFields } = form
    let l = thresholdArr.length
    let optArr = [`type${thresholdArr[l - 1]}`, `value${thresholdArr[l - 1]}`]
    validateFields(optArr, (errors, values) => {
      if (!!errors) {
        return
      }

      let copyThresholdArr = thresholdArr.slice(0)
      this.uuid++
      copyThresholdArr = copyThresholdArr.concat(this.uuid)
      this.setState({
        thresholdArr: copyThresholdArr
      })
    })
  }
  delRule = (key) => {
    const { form } = this.props
    const { setFields, getFieldValue } = form
    const { thresholdArr } = this.state
    let copyThreshold = thresholdArr.slice(0)
    let notify = new Notification()
    if (copyThreshold.length === 1) {
      notify.info('至少得有一项规则')
      return
    }
    copyThreshold = copyThreshold.filter(item => key !== item)
    this.setState({
      thresholdArr: copyThreshold
    }, () => {
      const { thresholdArr } = this.state
      let typeArr = []
      let typeOpt = {}
      thresholdArr.forEach(item => {
        typeArr.push(getFieldValue(`type${item}`))
        typeOpt = Object.assign(typeOpt, {[`type${item}`] : {
          errors: null,
          value: getFieldValue(`type${item}`)
        }})
      })
      let sortArr = typeArr.sort()
      let flag = false
      for (let i = 0; i < sortArr.length; i++) {
        if (sortArr[i] === sortArr[i + 1]) {
          flag = true
        }
      }
      if (!flag) {
        setFields(typeOpt)
      }
    })
  }
  renderFooter = () => {
    const {btnLoading} = this.state
    return [
      <Button key="cancel" size="large" onClick={this.cancelModal}>取消</Button>,
      <Button key="confirm" type="primary" size="large" loading={btnLoading} onClick={this.confirmModal}>确定</Button>
    ]
  }
  isPrivate(volumes) {
    let flag = false
    volumes && volumes.length && volumes.forEach(item => {
      if (item === 'private') {
        flag = true
      }
    })
    return flag
  }
  render() {
    const {visible, form, services, alertList, scaleDetail, create, reuse} = this.props
    const { thresholdArr, cpuAndMemory } = this.state
    const {getFieldProps, isFieldValidating, getFieldError, getFieldValue} = form
    const isGroupHide = getFieldValue('alert_strategy') === 'SendNoEmail'
    const formItemLargeLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16}
    }
    const formItemSmallLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 13}
    }
    const scaleName = getFieldProps('scale_strategy_name', {
      rules: [{
        validator: this.checkScaleName.bind(this),
      }],
      initialValue: create || isEmpty(scaleDetail) ? undefined : scaleDetail.scale_strategy_name
    })
    const selectService = getFieldProps('serviceName', {
      rules: [{
        validator: create ? this.checkServiceName.bind(this) : null,
      }],
      initialValue: create || isEmpty(scaleDetail) ? undefined : scaleDetail.serviceName
    })
    const minReplicas = getFieldProps('min', {
      rules: [{
        validator: this.checkMin.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? 1 : scaleDetail.min
    })
    const maxReplicas = getFieldProps('max', {
      rules: [{
        validator: this.checkMax.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? 10 : scaleDetail.max
    })
    const selectEmailSendType = getFieldProps('alert_strategy', {
      rules: [{
        validator: this.checkEmail.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? 'SendEmailWhenScale' : scaleDetail.alert_strategy
    })
    const selectAlertGroup = getFieldProps('alert_group', {
      rules: [{
        validator: this.checkAlert.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? undefined : scaleDetail.alert_group
    })
    let thresholdItem
    thresholdItem = thresholdArr.map((key) => {
      let optItem = cpuAndMemory[key] || { 'cpu': 80 }
      return (
        <Row type="flex" align="middle" key={key} className="strategyBox">
          <Col className={classNames({"strategyLabel": key === 0})} span={4} style={{ marginBottom: 24, textAlign: 'right' }}>
            {
              thresholdArr.indexOf(key) === 0 ? '阈值：' : ''
            }
          </Col>
          <Col span={7}>
            <FormItem>
              <Select
                style={{width: 120}}
                {...getFieldProps(`type${key}`, {
                  rules: [{
                    validator: (rule, value, callback) => this.checkType(rule, value, callback, key)
                  }],
                  initialValue: Object.keys(optItem)[0]
                }) }
              >
                <Option value="cpu">CPU阈值</Option>
                <Option value="memory">内存阈值</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem>
              <InputNumber
                {...getFieldProps(`value${key}`, {
                  rules: [{
                    validator: this.checkValue
                  }],
                  initialValue: optItem[Object.keys(optItem)[0]]
                })}/> %
            </FormItem>
          </Col>
          <Col span={7} style={{ marginBottom: 24 }}>
            <Button type="primary" size="large" icon="plus" onClick={this.addRule}/>&nbsp;
            <Button type="ghost" size="large" icon="cross" onClick={this.delRule.bind(this, key)}/>
          </Col>
        </Row>
      )
    })
    return (
      <Modal
        title={reuse ? '复用自动伸缩策略' : (isEmpty(scaleDetail) ? "创建自动伸缩策略" : "修改自动伸缩策略")}
        className="autoScaleModal"
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
              disabled={create ? false : true}
              optionFilterProp="children"
              notFoundContent="没有未关联的服务"
              {...selectService}
              placeholder="请选择服务">
              {
                services && services.length ? services.map(item =>
                  <Option key={item.metadata.name} value={item.metadata.name} disabled={this.isPrivate.apply(this, [item.volumeTypeList])}>{item.metadata.name}</Option>) : null
              }
            </Select>
          </FormItem>
          <Row style={{margin: '-3px 0 10px'}}>
            <Col span={4} style={{ height: 18 }}/>
            <Col span={16}>
              <Icon type="exclamation-circle-o"/> 挂载独享型存储的服务不支持自动伸缩
            </Col>
          </Row>
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
          {thresholdItem}
          <Row style={{margin: '-3px 0 10px'}}>
            <Col span={4}/>
            <Col span={16}>
              <Icon type="exclamation-circle-o"/> 所有实例平均使用率超过阈值自动扩展，n-1个实例平均值低于阈值自动收缩
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
          {
            isGroupHide ? null :
              [
                <FormItem
                  {...formItemLargeLayout}
                  label="告警通知组"
                  key="alertGroup"
                >
                  <Select
                    {...selectAlertGroup}
                    placeholder="请选择告警通知组"
                    showSearch
                    optionFilterProp="children"
                    notFoundContent="没有告警通知组">
                    {
                      alertList && alertList.length ? alertList.map(item =>
                        <Option key={item.name} value={item.groupID}>{item.name}</Option>
                      ) : null
                    }
                  </Select>
                </FormItem>,
                <Row style={{margin: '-3px 0 10px'}} key="alertGroupHint">
                  <Col span={4} style={{ height: 18 }}/>
                  <Col span={16}>
                    <Icon type="exclamation-circle-o"/> 发生弹性伸缩时会向该通知组发送邮件通知
                  </Col>
                </Row>,
                <Row style={{margin: '-10px 0 10px'}} key="createGroup">
                  <Col span={4}/>
                  <Col span={16}>
                    没有告警通知组？<Link to="/manange_monitor/alarm_group">去创建>></Link>
                  </Col>
                </Row>
              ]
          }
        </Form>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const { existServices } = props
  const {cluster} = state.entities.current
  const {clusterID} = cluster || {clusterID: ''}
  const {serviceList} = state.services || {serviceList: {}}
  const {groups} = state.alert || {groups: {}}
  const {result} = groups || {result: {}}
  const {data: alertList} = result || {data: []}
  let {services} = serviceList || {services: []}
  services = services && services.length && existServices && services.filter(item => {
    return !existServices.includes(item.metadata.name)
  })
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