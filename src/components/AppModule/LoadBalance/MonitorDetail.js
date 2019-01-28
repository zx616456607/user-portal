/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance monitor detail
 *
 * v0.1 - 2018-01-16
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import {
  Card, Form, Select, Row, Col, Radio,
  Checkbox, Slider, InputNumber, Input,
  Icon, Button, Tooltip,
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import classNames from 'classnames'
import Notification from '../../Notification'
import { ASYNC_VALIDATOR_TIMEOUT, CONNECT_FLAG } from '../../../constants'
import './style/MonitorDetail.less'
import HealthCheckModal from './HealthCheckModal'
import DetailFooter from './DetailFooter'
import RoutingRules from '../../../../client/containers/AppModule/LoadBalance/RoutingRules'

import { loadAllServices } from '../../../actions/services'
import { createIngress, updateIngress, getLBDetail, checkIngressNameAndHost } from '../../../actions/load_balance'
import { ingressNameCheck, ingressRelayRuleCheck, ingressContextCheck } from '../../../common/naming_validation'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { sleep } from "../../../common/tools";
import { CERT_REGEX, PRIVATE_KEY_REGEX } from '../../../../constants'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group;

let uidd = 0
class MonitorDetail extends React.Component {
  state = {
    allServices: [],
    healthCheck: false
  }
  componentWillMount() {
    const { loadAllServices, clusterID } = this.props
    loadAllServices(clusterID, {
      pageIndex: 1,
      pageSize: 100,
    }, {
      success: {
        func: res => {
          this.setState({
            allServices: res.data.services.filter(item => !isEmpty(item.service)).map(item => item.service),
          }, () => {
            this.initialForm()
          })
        }
      }
    })
  }
  componentWillUnmount() {
    uidd = 0
  }

  initialForm = () => {
    const { currentIngress, form } = this.props
    if (currentIngress) {
      if (currentIngress.healthCheck) {
        const { interval, fall, rise } = currentIngress.healthCheck
        this.setState({
          healthOptions: currentIngress.healthCheck
        })
        if (interval && fall && rise) {
          this.setState({
            healthCheck: true
          })
        }
      }
      if (currentIngress.lbAlgorithm === 'round-robin') {
        this.setState({
          sessionSticky: currentIngress.sessionSticky,
          sessionPersistent: parseInt(currentIngress.sessionPersistent)
        })
      }
      if (!isEmpty(currentIngress.items)) {
        const keys = []
        currentIngress.items.forEach(item => {
          keys.push(++ uidd)
          form.setFieldsValue({
            [`service-${uidd}`]: item.serviceName,
            [`port-${uidd}`]: item.servicePort
          })
          this.selectService(item.serviceName, uidd)
          if (currentIngress.lbAlgorithm !== 'ip_hash') {
            form.setFieldsValue({
              [`weight-${uidd}`]: item.weight
            })
            this.setState({
              [`weight-${uidd}`]: item.weight
            })
          }
        })
        form.setFieldsValue({
          keys
        })
      }
    }

  }
  validateNewItem = key => {
    const { form } = this.props
    const { getFieldValue, setFields } = form
    const keys = getFieldValue('keys')
    let endIndexValue = keys[keys.length - 1]
    if (key) {
      endIndexValue = key
    }
    let service = getFieldValue(`service-${endIndexValue}`)
    let port = getFieldValue(`port-${endIndexValue}`)
    let weight = getFieldValue(`weight-${endIndexValue}`)
    let errorObj = {}
    if (!service) {
      Object.assign(errorObj, {
        [`service-${endIndexValue}`]: {
          errors: ['请选择服务'],
          value: ''
        }
      })
    }
    if (!port) {
      Object.assign(errorObj, {
        [`port-${endIndexValue}`]: {
          errors: ['请选择端口'],
          value: ''
        }
      })
    }
    if (getFieldValue('lbAlgorithm') === 'round-robin') {
      if (!weight) {
        Object.assign(errorObj, {
          [`weight-${endIndexValue}`]: {
            errors: ['请输入权重'],
            value: ''
          }
        })
      }
    }
    setFields(errorObj)
    return errorObj
  }

  checkBundleService = () => {
    const { form } = this.props
    const { getFieldValue, getFieldError } = form
    const keys = getFieldValue('keys')
    if (isEmpty(keys)) {
      this.setState({
        hasBundleService: false,
      })
      return
    }
    if (keys.length > 1) {
      this.setState({
        hasBundleService: true,
      })
      return
    }
    const validateArr = []
    const key = keys[0]
    validateArr.push(`service-${key}`, `port-${key}`)
    const allHasValue = validateArr.every(item => {
      if (isEmpty(getFieldValue(item)) && !getFieldValue(item)) {
        return false
      }
      return true
    })
    if (!allHasValue) {
      this.setState({
        hasBundleService: false,
      })
      return
    }
    const allRight = validateArr.some(item => {
      if (!isEmpty(getFieldError(item))) {
        return false
      }
      return true
    })
    this.setState({
      hasBundleService: allRight,
    })
  }

  getRuleErrors = key => {
    const { form } = this.props
    const { getFieldValue, getFieldError } = form
    const ruleKeys = getFieldValue('ruleKeys')
    if (isEmpty(ruleKeys)) {
      return
    }
    let lastKey = ruleKeys[ruleKeys.length - 1]
    if (key) {
      lastKey = key
    }
    const validateArray = []
    const fieldsErrors = []
    validateArray.push(
      `rule-service-${lastKey}`,
      `rule-type-${lastKey}`,
      `rule-name-${lastKey}`,
      `rule-regex-${lastKey}`,
      `rule-value-${lastKey}`,
    )
    validateArray.forEach(item => {
      const itemErrors = getFieldError(item)
      if (!isEmpty(itemErrors)) {
        fieldsErrors.push(itemErrors)
      }
    })
    return fieldsErrors
  }

  addItem = async () => {
    const { form, currentIngress } = this.props
    const { getFieldValue, setFieldsValue } = form

    const currentKeys = getFieldValue('keys')

    if (currentKeys.length) {
      const result = this.validateNewItem()
      if (!isEmpty(result)) {
        return
      }
    }
    uidd ++
    if (currentIngress) {
      this.setState({
        [`service${uidd}`]: true
      })
    }
    setFieldsValue({
      keys: currentKeys.concat(uidd)
    })
    await sleep()
    this.checkBundleService()
  }

  editItem = item => {
    this.setState({[`service${item}`]: true})
  }

  removeKey = async key => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    setFieldsValue({
      keys: getFieldValue('keys').filter(item => item !== key)
    })
    await sleep()
    this.checkBundleService()
  }

  cancelEdit = key => {
    const { form, currentIngress } = this.props
    const { setFieldsValue } = form
    const { items } = currentIngress
    this.setState({
      [`service${key}`]: false
    })
    if (!items[key - 1]) {
      return
    }
    setFieldsValue({
      [`service-${key}`]: items[key - 1].serviceName,
      [`port-${key}`]: items[key - 1].servicePort,
      [`weight-${key}`]: items[key - 1].weight
    })
  }

  confirmEdit = key => {
    const result = this.validateNewItem(key)
    if (!isEmpty(result)) {
      return
    }
    this.setState({
      [`service${key}`]: false
    })
  }

  checkService = (rules, value, callback) => {
    if (!value) {
      return callback('请选择服务')
    }
    callback()
  }

  checkPort = (rules, value, callback) => {
    if (!value) {
      return callback('请选择端口')
    }
    callback()
  }

  checkWeight = (rules, value, callback) => {
    if (!value) {
      return callback('请输入权重')
    }
    callback()
  }

  openCheckModal = () => {
    this.setState({
      checkVisible: true
    })
  }

  closeCheckModal = () => {
    this.setState({
      checkVisible: false
    })
  }

  goBack = () => {
    const { togglePart } = this.props
    togglePart(true, null, 'listener', 'HTTP')
  }

  monitorNameCheck = (rules, value, callback) => {
    const { checkIngressNameAndHost, clusterID, location, form, currentIngress } = this.props
    const { name: lbname } = location.query
    if (currentIngress && (currentIngress.displayName === value)) {
      return callback()
    }
    let message = ingressNameCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    const query = {
      displayName: value,
      path: form.getFieldValue('host')
    }
    if (currentIngress) {
      delete query.path
    }
    clearTimeout(this.nameTimeout)
    this.nameTimeout = setTimeout(() => {
      checkIngressNameAndHost(clusterID, lbname, query, {
        success: {
          func: () => {
            callback()
          },
          isAsync: true,
        },
        failed: {
          func: res => {
            if (res.statusCode === 409) {
              return callback('监听器名称已经存在')
            }
            callback(res.message.message || res.message)
          },
          isAsync: true,
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }

  hostCheck = (rules, value, callback) => {
    const { checkIngressNameAndHost, clusterID, location, form, currentIngress } = this.props
    const { name: lbname } = location.query
    if (currentIngress && (`${currentIngress.host}${currentIngress.path}` === value)) {
      return callback()
    }
    let message = ingressRelayRuleCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    clearTimeout(this.nameTimeout)
    const query = {
      path: value,
      displayName: form.getFieldValue('monitorName'),
    }
    if (currentIngress) {
      delete query.displayName
    }
    this.nameTimeout = setTimeout(() => {
      checkIngressNameAndHost(clusterID, lbname, query, {
        success: {
          func: () => {
            callback()
          },
          isAsync: true,
        },
        failed: {
          func: res => {
            if (res.statusCode === 409) {
              return callback('校验规则已经存在')
            }
            callback(res.message.message || res.message)
          },
          isAsync: true,
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }

  contextCheck = (rule, value, callback) => {
    const message = ingressContextCheck(value)
    if (message !== 'success') {
      return callback(message)
    }
    callback()
  }

  /*agreementCheck = (rules, value, callback) => {
    if (!value) {
      return callback('请选择监听协议')
    }
    callback()
  }*/

  portCheck = (rules, value, callback) => {
    if (!value) {
      return callback('请选择监听端口')
    }
    callback()
  }

  algorithmCheck = (rules, value, callback) => {
    if (!value) {
      return callback('请选择调度算法')
    }
    callback()
  }

  handleAlgorithm = e => {
    const { sessionSticky,  sessionPersistent } = this.state
    const { getFieldValue, setFieldsValue } = this.props.form
    const keys = getFieldValue('keys')
    if (!isEmpty(keys)) {

      keys.forEach(item => {
        if (e.target.value === 'ip_hash') {
          this.setState({
            [`weight-${item}`]: 1
          })
          setFieldsValue({
            [`weight-${item}`]: 1
          })
        } else {
          setFieldsValue({
            [`weight-${item}`]: this.state[`weight-${item}`]
          })
        }
      })
    }
    if (e.target.value === 'round-robin') {
      setFieldsValue({
        sessionSticky,
        sessionPersistent
      })
    }
  }

  getHealthData = values => {
    const {
      isCheck, httpSend, interval, fall, rise,
      http_1xx, http_2xx, http_3xx, http_4xx, http_5xx
    } = values
    let expectAlive = []
    http_1xx && expectAlive.push('http_1xx')
    http_2xx && expectAlive.push('http_2xx')
    http_3xx && expectAlive.push('http_3xx')
    http_4xx && expectAlive.push('http_4xx')
    http_5xx && expectAlive.push('http_5xx')
    this.setState({
      healthCheck: isCheck,
      healthOptions: {
        httpSend,
        interval,
        fall,
        rise,
        expectAlive
      }
    })
  }

  getServiceList = () => {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    const service = []
    keys.forEach(key => {
      service.push({
        serviceName: getFieldValue(`service-${key}`),
        servicePort: Number(getFieldValue(`port-${key}`)),
        weight: getFieldValue(`weight-${key}`)
      })
    })
    return service
  }

  getRuleList = () => {
    const { form } = this.props
    const { getFieldValue } = form
    const ruleKeys = getFieldValue('ruleKeys')
    if (isEmpty(ruleKeys)) {
      return []
    }
    const host = getFieldValue('host')
    const [hostname, ...path] = (host || '/').split('/')
    const ruleMaps = new Map()
    const ruleObj = {}
    ruleKeys.forEach(key => {
      const mapKey = {
        type: getFieldValue(`rule-type-${key}`),
        name: getFieldValue(`rule-name-${key}`),
        regex: JSON.parse(getFieldValue(`rule-regex-${key}`)),
        value: getFieldValue(`rule-value-${key}`),
      }
      const [name, port] = getFieldValue(`rule-service-${key}`).split(CONNECT_FLAG)
      const mapKeys = Object.values(ruleObj)
      const isKeyExists = mapKeys.some(_key => isEqual(_key, mapKey))
      if (!isKeyExists) {
        Object.assign(ruleObj, {
          [`key-${key}`]: mapKey,
        })
        ruleMaps.set(ruleObj[`key-${key}`], [{
          name,
          port,
        }])
      } else {
        let currentKey
        for (const [_key, value] of Object.entries(ruleObj)) {
          if (isEqual(value, mapKey)) {
            currentKey = ruleObj[_key]
          }
        }
        const svcArray = ruleMaps.get(currentKey)
        svcArray.push({
          name,
          port,
        })
        ruleMaps.set(currentKey, svcArray)
      }
    })
    const rules = []
    for (const [key, mapValue] of ruleMaps) {
      const { type, name, regex, value } = key
      rules.push({
        host: hostname,
        path: path ? '/' + path.join('/') : '/',
        type,
        name,
        regex,
        value,
        service_infos: mapValue,
      })
    }
    return rules
  }

  handleConfirm = () => {
    const { form, createIngress, updateIngress, clusterID, location, getLBDetail, currentIngress, lbDetail } = this.props
    const { validateFields, getFieldValue } = form
    const { healthOptions, healthCheck } = this.state
    const { name, displayName } = location.query
    const { agentType } = getDeepValue(lbDetail.deployment, ['metadata', 'labels'])
    let notify = new Notification()
    const keys = getFieldValue('keys')
    let endIndexValue = keys[keys.length - 1]
    let validateArr = ['monitorName', 'protocol', 'lbAlgorithm', 'host', 'context', 'clientMaxBody']
    if (keys.length) {
      validateArr = validateArr.concat([
        `service-${endIndexValue}`,
        `port-${endIndexValue}`
      ])
      if (getFieldValue('lbAlgorithm') === 'round-robin') {
        validateArr.push(`weight-${endIndexValue}`)
      }
    }
    let ruleKeys = getFieldValue('ruleKeys')
    if (!isEmpty(ruleKeys)) {
      const ruleLastValue = ruleKeys[ruleKeys.length - 1]
      validateArr.push(
        `rule-service-${ruleLastValue}`,
        `rule-type-${ruleLastValue}`,
        `rule-name-${ruleLastValue}`,
        `rule-regex-${ruleLastValue}`,
        `rule-value-${ruleLastValue}`,
      )
      if (!isEmpty(this.getRuleErrors(ruleLastValue))) {
        return
      }
    }
    if (getFieldValue('lbAlgorithm') === 'round-robin') {
      validateArr.push('sessionSticky')
      if (getFieldValue('sessionSticky')) {
        validateArr.push('sessionPersistent')
      }
    }
    if (getFieldValue('protocol') === 'https') {
      validateArr.push('crt', 'key')
    }

    validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      if (!keys.length) {
        notify.warn('请添加监听服务')
        return
      }

      const {
        monitorName, protocol, lbAlgorithm, sessionSticky,
        sessionPersistent, host, context, clientMaxBody, crt, key,
      } = values
      const [hostname, ...path] = (host || '/').split('/')
      let strategy = lbAlgorithm
      // Nginx don't need round-robin to be explicitly specified
      if (strategy === 'round-robin') {
        strategy = ''
      }
      const body = {
        displayName: monitorName,
        protocol,
        lbAlgorithm: strategy,
        host: hostname,
        path: path ? '/' + path.join('/') : '/',
        context,
        items: this.getServiceList(),
        shunts: this.getRuleList(),
        clientMaxBody: clientMaxBody ? `${clientMaxBody}m` : '',
      }
      if (currentIngress) {
        Object.assign(body, { name: currentIngress.name })
      }
      if (healthCheck) {
        const { httpSend, interval, fall, rise, expectAlive } = healthOptions
        Object.assign(body, {
          healthCheck: {
            httpSend: httpSend ? httpSend : '/',
            interval,
            fall,
            rise,
            expectAlive
          }
        })
      }

      if (sessionSticky) {
        Object.assign(body, {
          sessionSticky,
          sessionPersistent: `${sessionPersistent}s`
        })
      }
      if (crt) {
        body.crt = crt
      }
      if (key) {
        body.key = key
      }
      if (lbAlgorithm === 'ip_hash ') {
        delete body.sessionSticky
        delete body.sessionPersistent
      }
      this.setState({
        confirmLoading: true
      })
      notify.spin(currentIngress ? '修改中' : '创建中')
      const callback = {
        success: {
          func: () => {
            getLBDetail(clusterID, name, displayName, {
              success: {
                func: () => {
                  this.goBack()
                },
                isAsync: true,
              }
            })
            this.setState({
              confirmLoading: false,
              healthCheck: false,
              healthOptions: null
            })
            notify.close()
            notify.success(currentIngress ? '修改成功' : '创建成功')
            form.resetFields()
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.close()
            this.setState({
              confirmLoading: false
            })
            if (res.statusCode === 409) {
              if (res.message.message.indexOf('URL') > -1) {
                notify.warn(currentIngress ? '修改失败' : '创建失败', '该转发规则已经存在')
                return
              } else if (res.message.message.indexOf('name') > -1) {
                notify.warn(currentIngress ? '修改失败' : '创建失败', '该监听名称已经存在')
                return
              } else {
                notify.warn(currentIngress ? '修改失败' : '创建失败', '禁止同一个服务的同一个端口，被同一个lb中的不同ingress使用')
                return
              }
            }
            notify.warn(currentIngress ? '修改失败' : '创建失败', res.message.message || res.message)
          }
        },
        finally: {
          func: () => {
            notify.close()
            this.setState({
              confirmLoading: false
            })
          }
        }
      }
      if (currentIngress) {
        updateIngress(clusterID, name, currentIngress.displayName, displayName, agentType, body, callback)
        return
      }
      createIngress(clusterID, name, monitorName, displayName, agentType, body, callback)
    })
  }

  selectService = async (name, key) => {
    const { allServices } = this.state
    const currentService = allServices.filter(item => item.metadata.name === name)[0]
    await sleep()
    this.checkBundleService()
    if (!currentService) return
    const existPorts = []
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('keys')
    keys.forEach(_key => {
      const serviceName = getFieldValue(`service-${_key}`)
      const portValue = getFieldValue(`port-${_key}`)
      if (serviceName === name && portValue) {
        existPorts.push(Number(portValue))
      }
    })
    this.setState({
      [`port-${key}`]: currentService.spec.ports.filter(item => !existPorts.includes(item.port)).map(item => item.port)
    })
  }

  getInitClientMaxBody = () => {
    const { currentIngress } = this.props
    if (!currentIngress || !currentIngress.clientMaxBody) {
      return
    }
    return +currentIngress.clientMaxBody.replace('m', '')
  }

  renderPort = () => {
    const { form } = this.props
    const protocol = form.getFieldValue('protocol')
    if (protocol === 'https') {
      return <Option key={443}>443</Option>
    }
    return <Option key={80}>80</Option>
  }

  checkCrt = (rules, value, callback) => {
    const { currentIngress, form } = this.props
    const protocol = form.getFieldValue('protocol')
    if (!currentIngress || currentIngress.protocol === 'http' && protocol === 'https') {
      if (!value) {
        return callback('请输入证书内容')
      }
      if (!CERT_REGEX.test(value)) {
        return callback('证书格式错误')
      }
      return callback()
    }
    callback()
  }

  checkKey = (rules, value, callback) => {
    const { currentIngress, form } = this.props
    const protocol = form.getFieldValue('protocol')
    if (!currentIngress || currentIngress.protocol === 'http' && protocol === 'https') {
      if (!value) {
        return callback('请输入密钥内容')
      }
      if (!PRIVATE_KEY_REGEX.test(value)) {
        return callback('私钥格式错误')
      }
      return callback()
    }
    callback()
  }

  isUpdateHttps = () => {
    const { currentIngress, form } = this.props
    const protocol = form.getFieldValue('protocol')
    if (currentIngress && currentIngress.protocol === 'https' && protocol === 'https') {
      return true
    }
    return false
  }

  render() {
    const { checkVisible, allServices,  confirmLoading, healthCheck, healthOptions } = this.state
    const { currentIngress, form } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue, getFieldError, isFieldValidating } = form
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10 }
    }
    const showSlider = getFieldValue('sessionSticky') && (getFieldValue('lbAlgorithm') === 'round-robin')
    const showWeight = getFieldValue('lbAlgorithm') !== 'ip_hash'
    getFieldProps('keys', {
      initialValue: [],
    });

    const protocol = getFieldValue('protocol')
    const monitorNameProps = getFieldProps('monitorName', {
      rules: [
        {
          validator: this.monitorNameCheck
        }
      ],
      initialValue: currentIngress && currentIngress.displayName
    })

    const agreementProps = getFieldProps('protocol', {
      initialValue: currentIngress ? currentIngress.protocol : 'http',
      rules: [{
        required: true,
        message: '请选择监听协议',
      }]
    })

    const portProps = getFieldProps('port', {
      rules: [
        {
          validator: this.portCheck
        }
      ],
      initialValue: protocol === 'https' ? 443 : 80,
    })

    const lbAlgorithmProps = getFieldProps('lbAlgorithm', {
      rules: [
        {
          validator: this.algorithmCheck
        }
      ],
      initialValue: currentIngress && currentIngress.lbAlgorithm || 'round-robin',
      onChange: this.handleAlgorithm
    })

    const sessionProps = getFieldProps('sessionSticky', {
      valuePropName: 'checked',
      initialValue: currentIngress ? currentIngress.sessionSticky : false
    })

    const clientMaxBodyProps = getFieldProps('clientMaxBody', {
      initialValue: this.getInitClientMaxBody(),
    })

    const relayRuleProps = getFieldProps('host', {
      initialValue: currentIngress && (currentIngress.host + currentIngress.path),
      rules: [
        {
          validator: this.hostCheck
        }
      ]
    })

    const contextProps = getFieldProps('context', {
      initialValue: currentIngress && currentIngress.context,
      rules: [
        {
          validator: this.contextCheck
        }
      ]
    })
    const serviceChild = (allServices || []).map(item =>{
      return <Option key={item.metadata.name}>{item.metadata.name}</Option>
    })
    const serviceList = getFieldValue('keys').length ? getFieldValue('keys').map(item => {
      return (
        <Row className="serviceList" type="flex" align="middle" key={`service${item}`}>
          <Col span={6}>
            <FormItem>
              <Select
                placeholder="请选择服务"
                disabled={!this.state[`service${item}`] && currentIngress}
                {...getFieldProps(`service-${item}`, {
                  rules: [
                    {
                      validator: this.checkService
                    }
                  ],
                  onChange: name => this.selectService(name, item)
                })} >
                {serviceChild}
              </Select>
            </FormItem>
          </Col>
          <Col span={4} offset={2}>
            <FormItem>
              <Select
                placeholder="请选择端口"
                disabled={!this.state[`service${item}`] && currentIngress}
                {...getFieldProps(`port-${item}`, {
                  rules: [
                    {
                      validator: this.checkPort
                    }
                  ],
                  onChange: async () => { await sleep(); this.checkBundleService()}
                })}>
                {
                  (this.state[`port-${item}`] || []).map(child => {
                    return <Option key={child}>{child}</Option>
                  })
                }
              </Select>
            </FormItem>
          </Col>
          {
            showWeight &&
            <Col span={4} offset={1}>
              <FormItem>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0} max={100} placeholder="请输入权重"
                  disabled={!this.state[`service${item}`] && currentIngress}
                  {...getFieldProps(`weight-${item}`, {
                    rules: [
                      {
                        validator: this.checkWeight
                      }
                    ],
                    onChange: value => this.setState({ [`weight-${item}`]: value }),
                    initialValue: 1
                  })}
                />
              </FormItem>
            </Col>
          }
          <Col span={4} offset={showWeight ? 1 : 6}>
            {
              !this.state[`service${item}`] ?
                [
                  currentIngress &&
                  <Button type="dashed" key={`edit${item}`}
                          className="editServiceBtn" onClick={() => this.editItem(item)}>
                    <i className="fa fa-pencil-square-o" aria-hidden="true"/></Button>,
                  <Button type="dashed" icon="delete" key={`delete${item}`} onClick={() => this.removeKey(item)}/>
                ]
                :
                [
                  <Button type="ghost" key={`cancel${item}`} className="cancelEditBtn" onClick={() => this.cancelEdit(item)}><Icon type="cross" /></Button>,
                  <Button type="primary" key={`confirm${item}`} className="confirmEditBtn" onClick={() => this.confirmEdit(item)}><Icon type="check" /></Button>
                ]
            }
          </Col>
        </Row>
      )
    }):
      <Row className="serviceList hintColor noneService" type="flex" align="middle" justify="center">
        暂无监听服务
      </Row>
    return (
      <Card
        title={currentIngress ? '编辑 HTTP/HTTPS 监听' : '创建 HTTP/HTTPS 监听'}
        className="monitorDetail"
      >
        {
          checkVisible &&
          <HealthCheckModal
            visible={checkVisible}
            healthOptions={healthOptions}
            closeModal={this.closeCheckModal}
            callback={this.getHealthData}
          />
        }
        <Form form={form}>
          <FormItem
            label="监听器名称"
            {...formItemLayout}
            hasFeedback={!!getFieldValue('monitorName')}
            help={isFieldValidating('monitorName') ? '校验中...' : (getFieldError('monitorName') || []).join(', ')}
          >
            <Input {...monitorNameProps} placeholder="请输入监听器名称"/>
          </FormItem>
          <FormItem
            label="监听协议端口"
            {...formItemLayout}
          >
            <Row>
              <Col span={16}>
                <FormItem>
                  <Select {...agreementProps}>
                    <Option key="http">HTTP</Option>
                    <Option key="https">HTTPS</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span={7} offset={1}>
                <FormItem>
                  <Select {...portProps}>
                    {this.renderPort()}
                  </Select>
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          {
            protocol === 'https' && <div>
              <FormItem
                label="证书内容"
                {...formItemLayout}
              >
                <Input
                  {...getFieldProps('crt', {
                    rules: [{
                      validator: this.checkCrt,
                    }]
                  })}
                  type="textarea"
                  placeholder={this.isUpdateHttps() ? '默认不再显示证书内容，如需更新请输入' : 'PEM编码'}
                />
              </FormItem>
              {/*<Row className={'ant-form-item'}>
                <Col span={10} offset={3}>
                  <a target="_blank" href="http://docs.tenxcloud.com/guide/service#https">
                    查看样例
                  </a>
                </Col>
              </Row>*/}
              <FormItem
                label='密钥内容'
                {...formItemLayout}
              >
                <Input
                  {...getFieldProps('key', {
                    rules: [{
                      validator: this.checkKey,
                    }]
                  })}
                  type='textarea'
                  placeholder={this.isUpdateHttps() ? '默认不再显示密钥内容，如需更新请输入' : 'PEM编码'}
                />
              </FormItem>
              {/*<Row className={'ant-form-item'}>
                <Col span={10} offset={3}>
                  <a target="_blank" href="http://docs.tenxcloud.com/guide/service#https">
                    查看样例
                  </a>
                </Col>
              </Row>*/}
            </div>
          }
          <FormItem
            label="调度算法"
            {...formItemLayout}
          >
            <RadioGroup {...lbAlgorithmProps}>
              <Radio value="round-robin">加权轮询</Radio>
              <Radio value="least_conn">最小连接数</Radio>
              <Radio value="ip_hash">源地址散列 IP_HASH</Radio>
            </RadioGroup>
          </FormItem>
          {
            getFieldValue('lbAlgorithm') === 'round-robin' &&
            <FormItem
              label="会话保持"
              {...formItemLayout}
            >
              <Checkbox {...sessionProps}>启用会话</Checkbox>
            </FormItem>
          }
          {
            showSlider &&
            <Row>
              <Col span={12}>
                <FormItem
                  label="保持时间"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Slider max={3600} {...getFieldProps('sessionPersistent',
                    {
                      initialValue: (currentIngress && currentIngress.sessionPersistent) ? parseInt(currentIngress.sessionPersistent) : 100
                    })}/>
                </FormItem>
              </Col>
              <Col span={2}>
                <InputNumber
                  style={{ marginRight: 0, width: '80%' }} max={3600}
                  value={getFieldValue('sessionPersistent')} onChange={value => setFieldsValue({time: value})}/> s
              </Col>
            </Row>
          }
          <FormItem
            label="健康检查"
            {...formItemLayout}
          >
            <p className="ant-form-text">
              <span className={classNames("successColor", { 'hintColor': !healthCheck })}>{healthCheck ? '已开启' : '未开启'}</span>&nbsp;
              <i className="fa fa-pencil-square-o pointer" aria-hidden="true" onClick={this.openCheckModal}/>
            </p>
          </FormItem>
          <FormItem
            label="添加 HTTP头 "
            {...formItemLayout}
          >
            <p className="ant-form-text">已开启客户端真实 IP<span className="hintColor">（通过 X-Forwarded-For 头字段获取）</span></p>
            <p className="ant-form-text">已开启负载均衡监听协议<span className="hintColor">（通过 X-Forwarded-Proto 头字段获取）</span></p>
          </FormItem>
          <FormItem
            label={'最大上传数据大小'}
            {...formItemLayout}
          >
            <div>
              <InputNumber {...clientMaxBodyProps}/> MiB
            </div>
          </FormItem>
          <FormItem
            label="服务位置"
            {...formItemLayout}
            hasFeedback={!!getFieldValue('host')}
            help={isFieldValidating('host') ? '校验中...' : (getFieldError('host') || []).join(', ')}
          >
            <Input placeholder="请输入服务位置，例如 www.tenxcloud.com/www/index.html" {...relayRuleProps}/>
          </FormItem>
          <Row className="ant-form-item">
            <Col offset={3} span={10}>
              <div className="hintColor"><Icon type="info-circle-o" /> 确保 HTTPS 证书域名同服务位置域名一致，否则证书不生效</div>
            </Col>
          </Row>
          <FormItem
            label="访问路径"
            {...formItemLayout}
          >
            <Input placeholder="请输入访问路径，以 / 开头" {...contextProps}/>
          </FormItem>
          <FormItem
            label={'绑定后端服务'}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 20 }}
          >
            <div>
              <Button type="ghost" className="bundleBtn" onClick={this.addItem}><Icon type="link" /> 绑定后端服务</Button>
              <div className="hintColor qpsHint"><Icon type="info-circle-o" /> 删除或修改监听器绑定后端服务，会导致该服务基于QPS的弹性伸缩策略失效！</div>
              <Row className="serviceHeader">
                <Col span={8}>服务</Col>
                <Col span={4}>服务端口</Col>
                {
                  showWeight &&
                  <Col span={4} offset={1}>权重&nbsp;
                    <Tooltip title="填写0-100 数值越大权重越大">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </Col>
                }
                <Col span={4} offset={showWeight ? 1 : 6}>操作</Col>
              </Row>
              {serviceList}
            </div>
          </FormItem>
          <RoutingRules
            form={form}
            hasBundleService={this.state.hasBundleService}
            currentIngress={currentIngress}
            getRuleErrors={this.getRuleErrors}
          />
        </Form>
        <DetailFooter
          onCancel={this.goBack}
          onOk={this.handleConfirm}
          loading={confirmLoading}
        />
      </Card>
    )
  }
}

MonitorDetail = Form.create()(MonitorDetail)

const mapStateToProps = (state, props) => {
  return {
  }
}

export default connect(mapStateToProps, {
  loadAllServices,
  createIngress,
  updateIngress,
  getLBDetail,
  checkIngressNameAndHost
})(MonitorDetail)
