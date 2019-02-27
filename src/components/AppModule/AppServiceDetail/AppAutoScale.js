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
  Modal, Form, Select, Input, Tabs, Tooltip, Checkbox, Spin,
} from 'antd'
import {
  loadAutoScale,
  updateAutoScale,
  updateAutoScaleStatus,
  getAutoScaleLogs,
  checkAutoScaleName,
  loadServiceDetail
} from '../../../actions/services'
import {
  loadNotifyGroups
} from '../../../actions/alert'
import {
  getServiceLBList
} from '../../../actions/load_balance'
import AppAutoScaleLogs from './AppAutoScaleLogs'
import './style/AppAutoScale.less'
import NotificationHandler from '../../../components/Notification'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { autoScaleNameCheck } from '../../../common/naming_validation'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import scaleImg from '../../../../client/assets/img/AppCenter/autoScale.png'

const FormItem = Form.Item
const Option = Select.Option;
const TabPane = Tabs.TabPane;

const sendEmailOpt = formatMessage => [{
  type: 'SendEmailWhenScale',
  text: formatMessage(AppServiceDetailIntl.SendEmailWhenScale),
}, {
  type: 'SendEmailWhenScaleUp',
  text: formatMessage(AppServiceDetailIntl.SendEmailWhenScaleUp),
}, {
  type: 'SendEmailWHenScaleDown',
  text: formatMessage(AppServiceDetailIntl.SendEmailWHenScaleDown),
}, {
  type: 'SendNoEmail',
  text: formatMessage(AppServiceDetailIntl.SendNoEmail),
}]
const thresholdKey = ['cpu', 'memory', 'qps']
let maxInstance = null

class AppAutoScale extends Component {
  constructor() {
    super()
    this.state = {
      scaleDetail: null,
      isEdit: false,
      activeKey: 'autoScaleForm',
      thresholdArr: [0],
      cpuAndMemory: [],
      isPrivate: false,
      showImg: true,
      loading: false,
      threshold: []
    }
    this.uuid = 0
  }
  componentWillMount() {
    const { loadNotifyGroups, cluster } = this.props
    this.loadData(this.props)
    loadNotifyGroups(null, cluster)
    this.isPrivateType(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { isCurrentTab: newCurrentTab, form, serviceDetailmodalShow: newScopeModal } = nextProps
    const { isCurrentTab: oldCurrentTab, serviceDetailmodalShow: oldScopeModal } = this.props
    if ((!oldScopeModal && newScopeModal) || (newCurrentTab && !oldCurrentTab)) {
      this.loadData(nextProps)
      this.isPrivateType(nextProps)
      this.setState({
        activeKey: 'autoScaleForm'
      })
    }
    if ((oldScopeModal && !newScopeModal) || (!newCurrentTab && oldCurrentTab)) {
      form.resetFields()
      this.setState({
        activeKey: 'autoScaleForm',
        thresholdArr: [0],
        cpuAndMemory: [],
        isPrivate: false
      })
      this.uuid = 0
    }
  }
  isPrivateType(props) {
    const { loadServiceDetail, cluster, serviceName } = props
    loadServiceDetail(cluster, serviceName, {
      success: {
        func: res => {
          res.data.volume.length && res.data.volume.forEach(item => {
            if (item.srType === 'private') {
              this.setState({
                isPrivate: true
              })
            }
          })
        }
      }
    })
  }
  loadData = props => {
    const { serviceName, cluster, loadAutoScale } = props
    this.setState({ loading: true })
    loadAutoScale(cluster, serviceName, {
      success: {
        func: res=> {
          if (!isEmpty(res.data)) {
            const { metadata, spec } = res.data
            const { name: serviceName } = metadata
            const { strategyName } = metadata.labels
            const { alertStrategy: alert_strategy, alertgroupId: alert_group, status, qpsValid } = metadata.annotations
            const { maxReplicas: max, minReplicas: min, metrics } = spec
            let cpu, memory, qps
            metrics.forEach(item => {
              if (item.resource.name === 'memory') {
                memory = item.resource.targetAverageUtilization
              } else if (item.resource.name === 'cpu') {
                cpu = item.resource.targetAverageUtilization
              } else if (item.resource.name === 'qps') {
                qps = item.resource.targetAverageUtilization
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
              qps,
              qpsValid,
              type: status === 'RUN' ? 1 : 0
            }
            this.setState({
              scaleDetail,
              showImg: false,
              loading: false,
            }, () => {
              this.initThresholdArr(this.state.scaleDetail)
            })
          } else {
            this.setState({
              scaleDetail: null,
              loading: false,
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
            scaleDetail: null,
            loading: false,
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
  startEdit = () => {
    const { formatMessage } = this.props.intl
    const { isPrivate } = this.state
    if (isPrivate) {
      let notify = new NotificationHandler()
      notify.info(formatMessage(AppServiceDetailIntl.MountPrivateStorageNoAutoScale))
      return
    }
    this.setState({
      showImg: false,
      isEdit: true
    })
  }
  cancelEdit = () => {
    const { form } = this.props
    form.resetFields()
    this.loadData(this.props)
    if (isEmpty(this.state.scaleDetail)) {
      this.setState({
        isEdit: false,
        showImg: true,
      })
    } else {
      this.setState({
        isEdit: false,
      })
    }
  }
  saveEdit = () => {
    const { form, updateAutoScale, cluster, serviceDetail } = this.props
    const { scaleDetail, thresholdArr } = this.state
    const { validateFields, resetFields, getFieldValue } = form
    const { formatMessage } = this.props.intl
    let notify = new NotificationHandler()
    validateFields((errors, values) => {
      const ipv4 = getDeepValue(serviceDetail, [ cluster, this.props.serviceName, 'service', 'spec', 'template',
        'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
      const isFexed = ipv4 && true || false
      if (isFexed) {
        return notify.warn('服务已固定 IP, 不能自动伸缩')
      }
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
      const msgSpin = isEmpty(scaleDetail) ? formatMessage(AppServiceDetailIntl.creating) :
      formatMessage(AppServiceDetailIntl.changing)
      notify.spin(msgSpin)
      const { strategyName, serviceName, min, max, alert_strategy, alert_group, openScale } = values
      let body = { scale_strategy_name: strategyName, min, max, ...opt, alert_strategy, alert_group, type: openScale ? 1 : 0 }
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
            notify.success(formatMessage(AppServiceDetailIntl.operationSuccess))
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
            notify.error(formatMessage(AppServiceDetailIntl.operationFailure))
            resetFields()
          }
        }
      })
    })
  }
  checkScaleName = (rule, value, callback) => {
    const { checkAutoScaleName, cluster, form } = this.props
    const { isEdit, scaleDetail } = this.state
    const { getFieldValue } = form
    const { formatMessage } = this.props.intl
    let message = autoScaleNameCheck(value)
    if (message !== 'success') {
      return callback(message)
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
              callback(formatMessage(AppServiceDetailIntl.ThisStrategyIsExist))
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
    const { formatMessage } = this.props.intl
    if (!isEdit) {
      return callback()
    }
    if (!value) {
      callback(formatMessage(AppServiceDetailIntl.pleaseChoiceService))
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
              callback(formatMessage(AppServiceDetailIntl.thisServiceLinkAutoScale))
            }
            callback()
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  checkMin = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    const { formatMessage } = this.props.intl
    const max = getFieldValue('max')
    if (!value) {
      return callback(formatMessage(AppServiceDetailIntl.pleaseInputLeastContainerNum))
    }
    if (value < 1) {
      return callback(formatMessage(AppServiceDetailIntl.leastContainerMoreThanOne))
    }
    if (value >= max) {
      return callback(formatMessage(AppServiceDetailIntl.containerLeastMaxNum))
    }
    callback()
  }
  checkMax = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    const { formatMessage } = this.props.intl
    const min = getFieldValue('min')
    if (!value) {
      return callback(formatMessage(AppServiceDetailIntl.pleaseInputMaxContainerNum))
    }
    if (value > 300) {
      return callback(formatMessage(AppServiceDetailIntl.maxContainerLeast300))
    }
    if (value <= min) {
      return callback(formatMessage(AppServiceDetailIntl.maxContainerNoLeastMinContainer))
    }
    if (maxInstance && value > maxInstance) {
      return callback('服务开启了固定实例 IP，实例数量最多为 IP 数量')
    }
    callback()
  }
  checkEmail = (rule, value, callback) => {
    const { formatMessage } = this.props.intl
    if (!value) {
      return callback(formatMessage(AppServiceDetailIntl.pleaseChoiceSendEmailWay))
    }
    callback()
  }
  checkAlert = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    const { formatMessage } = this.props.intl
    const isGroupHide = getFieldValue('alert_strategy') === 'SendNoEmail'
    if (!value && !isGroupHide) {
      return callback(formatMessage(AppServiceDetailIntl.pleaseChoiceGroup))
    }
    callback()
  }
  checkType = (rule, value, callback, key) => {
    const { form, getServiceLBList, cluster } = this.props
    const { getFieldValue, getFieldError, getFieldsValue, setFields } = form
    const { formatMessage } = this.props.intl
    const { thresholdArr } = this.state
    if (!value) {
      return callback(formatMessage(AppServiceDetailIntl.pleaseChoiceType))
    }
    let newValue = getFieldValue(`type${key}`)
    const result = thresholdArr.some(item => {
      if (item === key) {
        return false
      } else {
        const thisValue = getFieldsValue([`type${item}`])[`type${item}`]
        if (thisValue) {
          setFields({
            [`type${item}`]: {
              value: thisValue,
              errors: null
            }
          })
        }
      }
      let existValue = getFieldValue(`type${item}`)
      if (newValue === existValue) {
        return true
      }
    })
    if (result) {
      return callback(formatMessage(AppServiceDetailIntl.limitTypeRepeat))
    }
    const serviceName = form.getFieldValue('serviceName')
    if (!serviceName || value !== 'qps') return callback()
    if (getFieldError(`type${key}`)) return callback()
    clearTimeout(this.checkSerivceIsLB)
    this.checkSerivceIsLB = setTimeout(() => {
      getServiceLBList(cluster, serviceName, {
        success: {
          func: res => {
            if (isEmpty(res.data)) {
              return callback(formatMessage(AppServiceDetailIntl.serviceNoBindAnyLoadBalance))
            } else {
              callback()
            }
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }
  checkValue = (rule, value, callback, type) => {
    const { formatMessage } = this.props.intl
    if (!value && value !== 0) {
      return callback(formatMessage(AppServiceDetailIntl.pleaseInputLimit, { type }))
    }
    if (type === 'qps') {
      if (value < 1 || value > 1000000) {
        return callback(formatMessage(AppServiceDetailIntl.limitIs1100000, { type }))
      }
      return callback()
    }
    if (value < 1 || value > 99) {
      return callback(formatMessage(AppServiceDetailIntl.limitIs199, { type }))
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
    const { formatMessage } = this.props.intl
    const { form } = this.props
    const { setFields, getFieldValue } = form
    const { thresholdArr } = this.state

    let copyThreshold = thresholdArr.slice(0)
    let notify = new NotificationHandler()
    if (copyThreshold.length === 1) {
      notify.info(formatMessage(AppServiceDetailIntl.leastOneRule))
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
  render() {
    const { formatMessage } = this.props.intl
    const { isEdit, scaleDetail, btnLoading, activeKey, thresholdArr, cpuAndMemory, showImg, loading } = this.state
    const { form, services, alertList, getAutoScaleLogs, cluster, serviceName, serviceDetailmodalShow, isCurrentTab,
      serviceDetail, currentNetType } = this.props
    const { getFieldProps, isFieldValidating, getFieldError, getFieldValue } = form
    const isGroupHide = getFieldValue('alert_strategy') === 'SendNoEmail'
    const formItemLargeLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 13}
    }
    const formItemSmallLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 8}
    }
    const scaleName = getFieldProps('strategyName', {
      rules: [{
        validator: this.checkScaleName,
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.strategyName
    })
    const selectService = getFieldProps('serviceName', {
      rules: [{
        validator: isEdit ? null : this.checkServiceName,
      }],
      initialValue: isEmpty(scaleDetail) ? serviceName: scaleDetail.serviceName
    })
    const minReplicas = getFieldProps('min', {
      rules: [{
        validator: (rule, value, callback) => this.checkMin(rule, value, callback),
        // this.checkMin.bind(this),
      }],
      initialValue: isEmpty(scaleDetail) ? 1: scaleDetail.min,
      onChange: () => setTimeout(() => this.props.form.validateFields(['max'], { force: true }),0 )
    })
    const maxReplicas = getFieldProps('max', {
      rules: [{
        validator: this.checkMax.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? 10: scaleDetail.max,
      onChange: () => setTimeout(() => this.props.form.validateFields(['min'], { force: true }), 0)
    })
    const selectEmailSendType = getFieldProps('alert_strategy', {
      rules: [{
        validator: this.checkEmail.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? 'SendNoEmail' : scaleDetail.alert_strategy
    })
    const selectAlertGroup = getFieldProps('alert_group', {
      rules: [{
        validator: this.checkAlert.bind(this)
      }],
      initialValue: isEmpty(scaleDetail) ? undefined: scaleDetail.alert_group
    })
    const openScaleStatus = getFieldProps('openScale', {
      initialValue: isEmpty(scaleDetail) ? true : scaleDetail.type === 1,
      valuePropName: 'checked',
    })
    let thresholdItem
    let message = formatMessage(AppServiceDetailIntl.allContainerExceedInfo)
    thresholdItem = thresholdArr.map((key) => {
      let optItem = cpuAndMemory[key] || { 'cpu': 80 }
      return (
        <div key={key}>
          <Row className="strategyBox">
            <Col className={classNames({"strategyLabel": key === 0})} span={4} style={{ marginTop: 8, textAlign: 'right'}}>
              {
                thresholdArr.indexOf(key) === 0
                  ? <div>{formatMessage(AppServiceDetailIntl.limitValue)}<Tooltip title={message}><Icon type="exclamation-circle-o"/></Tooltip><span style={{ margin: '0 8px 0 2px' }}>:</span></div>
                  : ''
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
                  <Option value="cpu">{formatMessage(AppServiceDetailIntl.CPULimitValue)}</Option>
                  <Option value="memory">{formatMessage(AppServiceDetailIntl.memoryLimitValue)}</Option>
                  <Option value="qps">{formatMessage(AppServiceDetailIntl.QPSLimitValue)}</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={5}>
              <FormItem>
                <InputNumber
                  disabled={!isEdit}
                  {...getFieldProps(`value${key}`, {
                    rules: [{
                      validator: (rules, value, callback) => this.checkValue(rules, value, callback, getFieldValue(`type${key}`))
                    }],
                    initialValue: optItem[Object.keys(optItem)[0]]
                  })}/>
                {
                  getFieldValue(`type${key}`) !== 'qps' ? '%' : '次/s'
                }
              </FormItem>
            </Col>
            <Col span={9} style={{ marginBottom: 24 }}>
              <Button type="primary" size="large" icon="plus" disabled={!isEdit} onClick={this.addRule}/>&nbsp;
              <Button type="ghost" size="large" icon="cross" disabled={!isEdit} onClick={() => this.delRule(key)}/>
              {
                scaleDetail && scaleDetail.qpsValid === 'false' && getFieldValue(`type${key}`) === 'qps' &&
                <Tooltip
                  title={formatMessage(AppServiceDetailIntl.bindServiceLBDelete)}
                >
                  <span className="failedColor">{formatMessage(AppServiceDetailIntl.loseEfficacy)}</span>
                </Tooltip>
              }
            </Col>
          </Row>
          {
            getFieldValue(`type${key}`) === 'qps' &&
            <Row style={{margin: '0 0 20px'}}>
              <Col offset={4} span={20}>
                <Icon type="exclamation-circle-o"/>{formatMessage(AppServiceDetailIntl.thisLimitValueBindLB)}
              </Col>
            </Row>
          }
        </div>
      )
    })
    const currentService = serviceDetail[cluster]
    && serviceDetail[cluster][serviceName]
    && serviceDetail[cluster][serviceName].service
    || null
    let isFexed = false
    if (currentNetType !== 'macvlan') {
      const ipv4 = getDeepValue(currentService, [ 'spec', 'template', 'metadata', 'annotations', 'cni.projectcalico.org/ipAddrs' ])
      isFexed = ipv4 && true || false
      maxInstance = ipv4 && JSON.parse(ipv4).length
    } else {
      const ipStr = getDeepValue(currentService, [ 'spec', 'template', 'metadata', 'annotations', 'system/reserved-ips' ])
      isFexed = ipStr && true || false
      maxInstance = ipStr && ipStr.split(',').length
    }
    const hasScale = showImg ? true : false
    return(
      <div id="AppAutoScale">
        <div className="alertRow">
          {formatMessage(AppServiceDetailIntl.anyIndexExceedLimitValue)}
        </div>
        <Tabs activeKey={activeKey} onChange={activeKey => this.setState({activeKey})} type="card" id="autoScaleTabs">
          <TabPane tab={formatMessage(AppServiceDetailIntl.scaleStrategy)} key="autoScaleForm">
            {
              showImg ?
                <div className="serverNoScale">
                  {
                    loading ?
                      <Spin size="large" spinning={loading} /> :
                      <div>
                        <img src={scaleImg} alt="noScale" />
                        <div>
                          {formatMessage(AppServiceDetailIntl.noScale)}
                          &nbsp;&nbsp;&nbsp;
                            <Button type="primary" size="large" onClick={this.startEdit}>
                              {formatMessage(AppServiceDetailIntl.addScale)}
                            </Button>
                        </div>
                      </div>
                  }
                </div>
                : <div className="autoScaleFormBox">
                    <div className="autoScaleInnerBox">
                      <Form form={form} className="autoScaleForm">
                        <FormItem
                          {...formItemLargeLayout}
                          label={formatMessage(AppServiceDetailIntl.strategyName)}
                          hasFeedback
                          help={isFieldValidating('strategyName') ? formatMessage(AppServiceDetailIntl.verifying) : (getFieldError('strategyName') || []).join(', ')}
                        >
                          <Input disabled={!isEdit} type="text" {...scaleName} placeholder={formatMessage(AppServiceDetailIntl.pleaseInputstrategyName)}/>
                        </FormItem>
                        <FormItem
                          {...formItemLargeLayout}
                          label={formatMessage(AppServiceDetailIntl.choiceService)}
                        >
                          <Select
                            showSearch
                            disabled={true}
                            optionFilterProp="children"
                            notFoundContent={formatMessage(AppServiceDetailIntl.NoLinkService)}
                            {...selectService}
                            placeholder={formatMessage(AppServiceDetailIntl.pleaseChoiceService)}>
                            {
                              services && services.length && services.map(item =>
                                <Option key={item.metadata.name} value={item.metadata.name}>{item.metadata.name}</Option>)
                            }
                          </Select>
                        </FormItem>
                        <Row>
                          <Col className="ant-col-4 ant-form-item-label">
                            <span style={{ paddingRight: 8 }}>
                              {formatMessage(AppServiceDetailIntl.leastContainerNum)} :
                            </span>
                          </Col>
                          <Col span={4}>
                            <Form.Item>
                              <InputNumber disabled={!isEdit} {...minReplicas}/>个
                            </Form.Item>
                          </Col>
                          <Col className="ant-col-3 ant-form-item-label">
                            <span style={{ paddingRight: 8 }}>
                              {formatMessage(AppServiceDetailIntl.moreContainerNum)} :
                            </span>
                          </Col>
                          <Col span={4}>
                            <Form.Item>
                              <InputNumber disabled={!isEdit} {...maxReplicas}/>个
                            </Form.Item >
                          </Col>
                          <Col span={8}>
                            <span className="maxInstance">
                            {
                              currentNetType === 'macvlan' && isFexed ?
                                '服务开启了固定实例 IP，实例数量最多为 IP 数量'
                                :'扩展实例数不会超过地址池实际可用数'
                            }
                            </span>
                          </Col>
                        </Row>
                        {thresholdItem}
                        <FormItem
                          {...formItemLargeLayout}
                          label={formatMessage(AppServiceDetailIntl.sendEmail)}
                        >
                          <Select
                            disabled={!isEdit}
                            {...selectEmailSendType}
                            placeholder={formatMessage(AppServiceDetailIntl.pleaseChoiceSendEmailManner)}
                            showSearch
                            optionFilterProp="children"
                            notFoundContent={formatMessage(AppServiceDetailIntl.noFind)}>
                            {
                              sendEmailOpt(formatMessage).map(item => {
                                return <Option key={item.type} value={item.type} >{item.text}</Option>
                              })
                            }

                          </Select>
                        </FormItem>
                        {
                          isGroupHide ? null :
                            [
                              <FormItem
                                {...formItemLargeLayout}
                                label={formatMessage(AppServiceDetailIntl.monitorGroup)}
                                key="alertGroup"
                                className="candleBottom"
                              >
                                <Select
                                  disabled={!isEdit}
                                  {...selectAlertGroup}
                                  placeholder={formatMessage(AppServiceDetailIntl.pleaseChoiceGroup)}
                                  showSearch
                                  optionFilterProp="children"
                                  notFoundContent={formatMessage(AppServiceDetailIntl.noMonitorGroup)}>
                                  {
                                    alertList && alertList.length ? alertList.map(item =>
                                      <Option key={item.name} value={item.groupID}>{item.name}</Option>
                                    ) : null
                                  }
                                </Select>
                              </FormItem>,
                              <Row key="groupHint">
                                <Col span={4}/>
                                <Col span={20} className="hintBox">
                                  <Icon type="exclamation-circle-o" />
                                  {formatMessage(AppServiceDetailIntl.autoScaleSendEmail)}
                                </Col>
                              </Row>,
                              <Row style={{margin: '-10px 0 10px'}} key="createGroup">
                                <Col span={4}/>
                                <Col span={16}>
                                  {formatMessage(AppServiceDetailIntl.noHaveMonitorGroup)}<Link to="/account/noticeGroup">{formatMessage(AppServiceDetailIntl.goCreate)}>></Link>
                                </Col>
                              </Row>
                            ]
                        }
                        <Row key="openScale">
                          <Col span={4}/>
                          <Col span={16}>
                          <FormItem className="candleBottom">
                            <Checkbox {...openScaleStatus} disabled={!isEdit}>开启伸缩策略</Checkbox>
                          </FormItem>
                          </Col>
                        </Row>
                      </Form>
                      <Row className="autoScaleBtnGroup">
                        <Col offset={2}>
                          {
                            !isEdit
                              ?
                              <Tooltip placement='top'
                                title={ isFexed ?
                                  currentNetType !== 'macvlan'
                                  && '固定实例 IP 功能开启后，不支持服务自动伸缩'
                                  || '服务开启了固定实例 IP，实例数量最多为 IP 数量'
                                  : null }
                              >
                                <Button key="edit" size="large" type="primary" disabled={currentNetType !== 'macvlan' ? isFexed : false} onClick={this.startEdit.bind(this)}>{formatMessage(ServiceCommonIntl.edit)}</Button>
                              </Tooltip>
                              :
                              [
                                <Button key="cancel" size="large" onClick={this.cancelEdit}>{formatMessage(ServiceCommonIntl.cancel)}</Button>,
                                <Button type="primary" key="save" size="large" loading={btnLoading} onClick={this.saveEdit}>{formatMessage(ServiceCommonIntl.save)}</Button>
                              ]
                          }

                        </Col>
                      </Row>
                    </div>
                  </div>
            }
          </TabPane>
          <TabPane tab={formatMessage(AppServiceDetailIntl.scaleLog)} key="autoScaleLogs">
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
  const { services } = state || {}
  const { serviceDetail } = services
  const currentNetType = getDeepValue(state, [ 'cluster_nodes', 'networksolutions', props.cluster, 'current' ])
  return {
    alertList,
    serviceDetail,
    currentNetType,
  }
}

export default injectIntl(connect(mapStateToProps, {
  loadAutoScale,
  updateAutoScale,
  updateAutoScaleStatus,
  getAutoScaleLogs,
  checkAutoScaleName,
  loadNotifyGroups,
  loadServiceDetail,
  getServiceLBList
})(Form.create()(AppAutoScale)), { withRef: true, })
