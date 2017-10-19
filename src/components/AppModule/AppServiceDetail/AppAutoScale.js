/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/25
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {
  Button, Row, Col, InputNumber, Icon, Switch,
  Modal, Form, Select, Input, Tabs
} from 'antd'
import {
  loadAutoScale,
  updateAutoScale,
  updateAutoScaleStatus,
  getAutoScaleLogs,
  checkAutoScaleName
} from '../../../actions/services'
import {
  loadNotifyGroups
} from '../../../actions/alert'
import AppAutoScaleLogs from './AppAutoScaleLogs'
import './style/AppAutoScale.less'
import NotificationHandler from '../../../components/Notification'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'

const FormItem = Form.Item
const Option = Select.Option;
const TabPane = Tabs.TabPane;

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

class AppAutoScale extends Component {
  constructor() {
    super()
    this.state = {
      scaleDetail: null,
      switchOpen: false,
      isEdit: false,
      activeKey: 'autoScaleForm',
      thresholdArr: [0],
      cpuAndMemory: []
    }
    this.uuid = 0
  }
  componentWillMount() {
    const { loadNotifyGroups, cluster } = this.props
    this.loadData(this.props)
    loadNotifyGroups(null, cluster)
  }

  componentWillReceiveProps(nextProps) {
    const { serviceName: newServiceName, isCurrentTab: newCurrentTab, form, serviceDetailmodalShow: newScopeModal } = nextProps
    const { serviceName: oldServiceName, isCurrentTab: oldCurrentTab, serviceDetailmodalShow: oldScopeModal } = this.props
    if ( !oldScopeModal && newScopeModal || (newCurrentTab && !oldCurrentTab)) {
      this.loadData(nextProps)
      this.setState({
        activeKey: 'autoScaleForm'
      })
    }
    if (oldScopeModal && !newScopeModal) {
      form.resetFields()
      this.setState({
        activeKey: 'autoScaleForm',
        switchOpen: false,
        thresholdArr: [0],
        cpuAndMemory: []
      })
      this.uuid = 0
    }
  }
  loadData = props => {
    const { serviceName, cluster, loadAutoScale } = props
    loadAutoScale(cluster, serviceName, {
      success: {
        func: () => {
          loadAutoScale(cluster, serviceName, {
            success: {
              func: res=> {
                if (!isEmpty(res.data)) {
                  const { metadata, spec } = res.data
                  const { name: serviceName } = metadata
                  const { strategyName } = metadata.labels
                  const { alertStrategy: alert_strategy, alertgroupId: alert_group, status } = metadata.annotations
                  const { maxReplicas: max, minReplicas: min, metrics } = spec
                  let cpu, memory
                  metrics.forEach(item => {
                    if (item.resource.name === 'memory') {
                      memory = item.resource.targetAverageUtilization
                    } else if (item.resource.name === 'cpu') {
                      cpu = item.resource.targetAverageUtilization
                    }
                  })
                  const scaleDetail = {
                    strategyName,
                    serviceName,
                    alert_group,
                    alert_strategy,
                    max,
                    min,
                    cpu,
                    memory,
                    type: status === 'RUN' ? 1 : 0
                  }
                  this.setState({
                    scaleDetail,
                    switchOpen: scaleDetail.type ? true : false
                  }, () => {
                    this.initThresholdArr(this.state.scaleDetail)
                  })
                } else {
                  this.setState({
                    scaleDetail: null
                  }, () => {
                    this.initThresholdArr(this.state.scaleDetail)
                  })
                }
              },
              isAsync: true
            },
            failed: {
              func: () => {
                this.setState({
                  scaleDetail: null
                })
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            scaleDetail: null
          })
        }
      }
    })
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
  cancelEdit = () => {
    const { form } = this.props
    form.resetFields()
    this.loadData(this.props)
    this.setState({
      isEdit: false,
    })
  }
  saveEdit = () => {
    const { form, updateAutoScale, cluster } = this.props
    const { scaleDetail, switchOpen, thresholdArr } = this.state
    const { validateFields, resetFields, getFieldValue } = form
    let notify = new NotificationHandler()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const isGroupHide = values.alert_strategy === 'SendNoEmail'
      let opt = {}
      thresholdArr.forEach(item => {
        let key = getFieldValue(`type${item}`)
        let value = getFieldValue(`value${item}`)
        opt = Object.assign(opt, { [key]: value})
      })
      this.setState({
        btnLoading: true
      })
      const msgSpin = isEmpty(scaleDetail) ? '创建中...' : '修改中'
      notify.spin(msgSpin)
      const { strategyName, serviceName, min, max, alert_strategy, alert_group} = values
      let body = { scale_strategy_name: strategyName, min, max, ...opt, alert_strategy, alert_group, type: switchOpen ? 1 : 0 }
      isEmpty(scaleDetail) ? body.type = 1 : ''
      isGroupHide ? body.alert_group = '' : ''
      body = Object.assign(body, {operationType: isEmpty(scaleDetail) ? 'create' : 'update'})
      updateAutoScale(cluster, serviceName, body, {
        success: {
          func: () => {
            this.setState({
              btnLoading: false,
              isEdit: false,
            })
            this.loadData(this.props)
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
              isEdit: false,
            })
            notify.close()
            notify.error('操作失败')
            resetFields()
          }
        }
      })
    })
  }
  updateScaleStatus = () => {
    const { updateAutoScaleStatus, cluster, serviceName } = this.props
    const { switchOpen, scaleDetail } = this.state
    let notify = new NotificationHandler()
    let msg = switchOpen ? '关闭' : '开启'
    notify.spin(`${msg}中...`)
    if (isEmpty(scaleDetail)) {
      notify.close()
      notify.error(`${msg}失败，请编辑伸缩策略`)
      return
    }
    this.setState({
      switchOpen: !switchOpen
    }, () => {
      updateAutoScaleStatus(cluster, {
        services: [serviceName],
        type: this.state.switchOpen ? 1 : 0
      }, {
        success: {
          func: () => {
            this.loadData(this.props)
            notify.close()
            notify.success(`${msg}成功`)
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.close()
            notify.error(`${msg}失败`)
            this.setState({
              switchOpen
            })
          }
        }
      })
    })
  }
  checkScaleName = (rule, value, callback) => {
    const { checkAutoScaleName, cluster, form } = this.props
    const { isEdit, scaleDetail } = this.state
    const { getFieldValue } = form
    if (!value) {
      return callback('请输入策略名称')
    }
    if (value.length < 3 || value.length > 21) {
      return callback('策略名称长度在3-21位之间')
    }
    if (!isEmpty(scaleDetail)) {
      if (getFieldValue('serviceName') === scaleDetail.serviceName) {
        return callback()
      }
    }
    const service_name = isEdit ? '' : getFieldValue('serviceName')
    clearTimeout(this.checkScaleNameExist)
    this.checkScaleNameExist = setTimeout(() => {
      checkAutoScaleName(cluster, {
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
    const { isEdit } = this.state
    const { checkAutoScaleName, cluster, form } = this.props
    const { getFieldValue } = form
    if (!isEdit) {
      return callback()
    }
    if (!value) {
      callback('请选择服务')
    }
    const strategy_name = getFieldValue('scale_strategy_name') || ''
    clearTimeout(this.checkSerivceNameExist)
    this.checkSerivceNameExist = setTimeout(() => {
      checkAutoScaleName(cluster, {
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
  checkMin = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    const max = getFieldValue('max')
    if (!value) {
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
  checkValue = (rule, value, callback) => {
    if (!value) {
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
    const { thresholdArr } = this.state
    let copyThreshold = thresholdArr.slice(0)
    let notify = new NotificationHandler()
    if (copyThreshold.length === 1) {
      notify.info('至少得有一项规则')
      return
    }
    copyThreshold = copyThreshold.filter(item => key !== item)
    this.setState({
      thresholdArr: copyThreshold
    })
  }
  render() {
    const { isEdit, scaleDetail, switchOpen, btnLoading, activeKey, thresholdArr, cpuAndMemory } = this.state
    const { form, services, alertList, getAutoScaleLogs, cluster, serviceName, serviceDetailmodalShow, isCurrentTab } = this.props
    const { getFieldProps, isFieldValidating, getFieldError, getFieldValue } = form
    const isGroupHide = getFieldValue('alert_strategy') === 'SendNoEmail'
    const formItemLargeLayout = {
      labelCol: { span: 3},
      wrapperCol: { span: 13}
    }
    const formItemSmallLayout = {
      labelCol: { span: 3},
      wrapperCol: { span: 8}
    }
    const scaleName = getFieldProps('strategyName', {
      rules: [{
        validator: this.checkScaleName.bind(this),
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.strategyName
    })
    const selectService = getFieldProps('serviceName', {
      rules: [{
        validator: isEdit ? null : this.checkServiceName.bind(this),
      }],
      initialValue: isEmpty(scaleDetail) ? serviceName: scaleDetail.serviceName
    })
    const minReplicas = getFieldProps('min', {
      rules: [{
        validator: this.checkMin.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? 1: scaleDetail.min
    })
    const maxReplicas = getFieldProps('max', {
      rules: [{
        validator: this.checkMax.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? 10: scaleDetail.max
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
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.alert_group
    })
    let thresholdItem
    thresholdItem = thresholdArr.map((key) => {
      let optItem = cpuAndMemory[key] || { 'cpu': 80 }
      return (
        <Row type="flex" align="middle" key={key}>
          <Col className={classNames({"strategyLabel": key === 0})} span={3} style={{ marginBottom: 24, textAlign: 'right'}}>
            {
              thresholdArr.indexOf(key) === 0 ? '阈值' : ''
            }
          </Col>
          <Col span={6}>
            <FormItem>
              <Select
                disabled={!isEdit}
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
          <Col span={5}>
            <FormItem>
              <InputNumber
                disabled={!isEdit}
                {...getFieldProps(`value${key}`, {
                  rules: [{
                    validator: this.checkValue
                  }],
                  initialValue: optItem[Object.keys(optItem)[0]]
                })}/> %
            </FormItem>
          </Col>
          <Col span={4} style={{ marginBottom: 24 }}>
            <Button type="primary" size="large" icon="plus" disabled={!isEdit} onClick={this.addRule}/>&nbsp;
            <Button type="ghost" size="large" icon="cross" disabled={!isEdit} onClick={() => this.delRule(key)}/>
          </Col>
        </Row>
      )
    })
    return(
      <div id="AppAutoScale">
        <div className="autoScaleSwitch">
          <span>自动弹性伸缩</span>
          <Switch checked={switchOpen} onChange={this.updateScaleStatus} checkedChildren="开" unCheckedChildren="关" />
        </div>
        <Tabs activeKey={activeKey} onChange={activeKey => this.setState({activeKey})} type="card" id="autoScaleTabs">
          <TabPane tab="伸缩策略" key="autoScaleForm">
            <div className="autoScaleFormBox">
              <div className="alertRow">
                任意指标超过阈值都会触发扩展，所有指标都满足n-1个实例平均值低于阈值才会触发收缩
              </div>
              <div className="autoScaleInnerBox">
                <Form form={form} className="autoScaleForm">
                  <FormItem
                    {...formItemLargeLayout}
                    label="策略名称"
                    hasFeedback
                    help={isFieldValidating('strategyName') ? '校验中...' : (getFieldError('strategyName') || []).join(', ')}
                  >
                    <Input disabled={!isEdit} type="text" {...scaleName} placeholder="请输入策略名称"/>
                  </FormItem>
                  <FormItem
                    {...formItemLargeLayout}
                    label="选择服务"
                  >
                    <Select
                      showSearch
                      disabled={true}
                      optionFilterProp="children"
                      notFoundContent="没有未关联的服务"
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
                    <InputNumber disabled={!isEdit} {...minReplicas}/> 个
                  </FormItem>
                  <FormItem
                    {...formItemSmallLayout}
                    label="最大实例数"
                  >
                    <InputNumber disabled={!isEdit} {...maxReplicas}/> 个
                  </FormItem>
                  {thresholdItem}
                  <Row style={{margin: '0 0 20px'}}>
                    <Col span={3}/>
                    <Col span={21}>
                      <Icon type="exclamation-circle-o"/> 所有实例平均使用率超过阈值自动扩展，n-1个实例平均值低于阈值自动收缩
                    </Col>
                  </Row>
                  <FormItem
                    {...formItemLargeLayout}
                    label="发送邮件"
                  >
                    <Select
                      disabled={!isEdit}
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
                            disabled={!isEdit}
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
                        <Row key="groupHint">
                          <Col span={3}/>
                          <Col span={21} className="hintBox">
                            <Icon type="exclamation-circle-o" /> 发生弹性伸缩时会向该通知组发送邮件通知
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
                <Row className="autoScaleBtnGroup">
                  <Col offset={2}>
                    {
                      !isEdit
                        ?
                        <Button key="edit" size="large" type="primary" onClick={() => this.setState({isEdit: true})}>编辑</Button>
                        :
                        [
                          <Button key="cancel" size="large" onClick={this.cancelEdit}>取消</Button>,
                          <Button type="primary" key="save" size="large" loading={btnLoading} onClick={this.saveEdit}>保存</Button>
                        ]
                    }

                  </Col>
                </Row>
              </div>
            </div>
          </TabPane>
          <TabPane tab="伸缩日志" key="autoScaleLogs">
            <AppAutoScaleLogs
              getAutoScaleLogs={getAutoScaleLogs}
              cluster={cluster}
              isCurrentTab={isCurrentTab}
              serviceDetailmodalShow={serviceDetailmodalShow}
              serviceName={serviceName}
            />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

AppAutoScale.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  loadAutoScale: PropTypes.func.isRequired,
  updateAutoScale: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  const {groups} = state.alert || {groups: {}}
  const {result} = groups || {result: {}}
  const {data: alertList} = result || {data: []}
  return {
    alertList
  }
}

export default connect(mapStateToProps, {
  loadAutoScale,
  updateAutoScale,
  updateAutoScaleStatus,
  getAutoScaleLogs,
  checkAutoScaleName,
  loadNotifyGroups
})(Form.create()(AppAutoScale))