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
  Icon, Button, Tooltip
} from 'antd'
import isEmpty from 'lodash/isEmpty'
import classNames from 'classnames'
import Notification from '../../Notification'
import './style/MonitorDetail.less'
import HealthCheckModal from './HealthCheckModal'

import { loadAllServices } from '../../../actions/services'
import { createIngress, updateIngress, getLBDetail } from '../../../actions/load_balance'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group;


let uidd = 0
class MonitorDetail extends React.Component {
  state = {
    defaultAllServices: [],
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
            allServices: res.data.services.map(item => item.service),
            defaultAllServices: res.data.services.map(item => item.service),
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
      if (!isEmpty(currentIngress.items)) {
        const keys = []
        currentIngress.items.forEach(item => {
          keys.push(++ uidd)
          form.setFieldsValue({
            [`service-${uidd}`]: item.serviceName,
            [`port-${uidd}`]: item.servicePort
          })
          this.selectService(item.serviceName, uidd)
          if (currentIngress.lbAlgorithm === 'round-robin') {
            form.setFieldsValue({
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
  validateNewItem = () => {
    const { form } = this.props
    const { getFieldValue, setFields } = form
    const keys = getFieldValue('keys')
    let endIndexValue = keys[keys.length - 1]
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
    if (!weight) {
      Object.assign(errorObj, {
        [`weight-${endIndexValue}`]: {
          errors: ['请输入权重'],
          value: ''
        }
      })
    }
    setFields(errorObj)
    return errorObj
  }
  
  addItem = () => {
    const { defaultAllServices } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    
    const currentKeys = getFieldValue('keys')
    
    if (currentKeys.length) {
      const result = this.validateNewItem()
      if (!isEmpty(result)) {
        return
      }
      let filterServices
      filterServices = defaultAllServices.filter(item => {
        let flag = true
        currentKeys.forEach(key => {
          if (item.metadata.name === getFieldValue(`service-${key}`)) {
            flag = false
          }
        })
        return flag
      })
      this.setState({
        allServices: filterServices
      })
    }
    uidd ++
    
    setFieldsValue({
      keys: currentKeys.concat(uidd)
    })
  }
  
  removeKey = key => {
    const { allServices, defaultAllServices } = this.state
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    const serviceName = getFieldValue(`service-${key}`)
    const service = defaultAllServices.filter(item => item.metadata.name === serviceName)
    this.setState({
      allServices: allServices.concat(service)
    })
    setFieldsValue({
      keys: getFieldValue('keys').filter(item => item !== key)
    })
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
    togglePart(true, null)
  }
  
  monitorNameCheck = (rules, value, callback) => {
    if (!value) {
      return callback('请输入监听器名称')
    } 
    callback()
  }
  
  agreementCheck = (rules, value, callback) => {
    if (!value) {
      return callback('请选择监听协议')
    }
    callback()
  }
  
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
  
  handleConfirm = () => {
    const { form, createIngress, updateIngress, clusterID, location, getLBDetail, currentIngress } = this.props
    const { validateFields, getFieldValue } = form
    const { healthOptions, healthCheck } = this.state
    const { name, displayName } = location.query
    let notify = new Notification()
    const keys = getFieldValue('keys')
    let endIndexValue = keys[keys.length - 1]
    let validateArr = ['monitorName', 'agreement', 'port', 'lbAlgorithm', 'sessionSticky', 'host']
    if (keys.length) {
      validateArr = validateArr.concat([
        `service-${endIndexValue}`,
        `port-${endIndexValue}`,
        `weight-${endIndexValue}`
      ])
    }
    if (getFieldValue('sessionSticky')) {
      validateArr.push('sessionPersistent')
    }
    validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      if (!keys.length) {
        notify.warn('请添加监听服务')
        return
      }
      
      const { monitorName, agreement, port, lbAlgorithm, sessionSticky, sessionPersistent, host } = values
      const [hostname, ...path] = host.split('/')
      const body = {
        displayName: monitorName,
        agreement,
        port,
        lbAlgorithm,
        host: hostname,
        path: '/' + path.join('/'),
        items: this.getServiceList()
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
            this.setState({
              confirmLoading: false,
              healthCheck: false,
              healthOptions: null
            })
            getLBDetail(clusterID, name, displayName)
            notify.close()
            notify.success(currentIngress ? '修改成功' : '创建成功')
            form.resetFields()
            this.goBack()
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.close()
            this.setState({
              confirmLoading: false
            })
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
        updateIngress(clusterID, name, displayName, body, callback)
        return
      }
      createIngress(clusterID, name, body, callback)
    })
  }
  
  selectService = (name, key) => {
    const { allServices } = this.state
    const currentService = allServices.filter(item => item.metadata.name === name)[0]
    this.setState({
      [`port-${key}`]: currentService.spec.ports.map(item => item.port)
    })
  }
  render() {
    const { checkVisible, allServices,  confirmLoading, healthCheck, healthOptions } = this.state
    const { currentIngress, form } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue } = form
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 9 }
    }
    const showSlider = getFieldValue('sessionSticky')
    const showWeight = getFieldValue('lbAlgorithm') === 'round-robin'
    getFieldProps('keys', {
      initialValue: [],
    });
    
    const monitorNameProps = getFieldProps('monitorName', {
      rules: [
        {
          validator: this.monitorNameCheck
        }
      ],
      initialValue: currentIngress && currentIngress.displayName
    })
    
    const agreementProps = getFieldProps('agreement', {
      rules: [
        {
          validator: this.agreementCheck
        }
      ],
      initialValue: 'HTTP'
    })
    
    const portProps = getFieldProps('port', {
      rules: [
        {
          validator: this.portCheck
        }
      ],
      initialValue: 80
    })
    
    const lbAlgorithmProps = getFieldProps('lbAlgorithm', {
      rules: [
        {
          validator: this.algorithmCheck
        }
      ],
      initialValue: currentIngress && currentIngress.lbAlgorithm || 'round-robin'
    })
    
    const sessionProps = getFieldProps('sessionSticky', {
      valuePropName: 'checked',
      initialValue: currentIngress ? currentIngress.sessionSticky : false
    })
    
    const relayRuleProps = getFieldProps('host', {
      initialValue: currentIngress && (currentIngress.host + currentIngress.path)
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
                  ]
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
                    ]
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
                          className="editServiceBtn" onClick={() => this.setState({[`service${item}`]: true})}>
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
        title={currentIngress ? '编辑监听' : '创建监听'}
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
          >
            <Input {...monitorNameProps} placeholder="请输入监听器名称"/>
          </FormItem>
          <Row>
            <Col span={6}>
              <FormItem
                label="监听协议"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <Select {...agreementProps}>
                  <Option key="HTTP">HTTP</Option>
                  <Option key="HTTPS" disabled>HTTPS</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                wrapperCol={{ span: 14 }}
              >
                <Select {...portProps}>
                  <Option key="80">80</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <FormItem
            label="调度算法"
            {...formItemLayout}
          >
            <RadioGroup {...lbAlgorithmProps}>
              <Radio value="round-robin">加权轮询</Radio>
              <Radio value="least_conn">最小连接数</Radio>
              <Radio value="ip_hash">源地址散列IP_HASH</Radio>
            </RadioGroup>
          </FormItem>
          {
            getFieldValue('lbAlgorithm') !== 'ip_hash' &&
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
              <Col span={8}>
                <FormItem
                  label="保持时间"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Slider max={3600} {...getFieldProps('sessionPersistent', { initialValue: 100 })}/>
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
            <p className="ant-form-text">已开启客户端真是 IP<span className="hintColor">（通过 X-Forwarded-For 头字段获取）</span></p>
            <p className="ant-form-text">已开启负载均衡监听协议<span className="hintColor">（通过 X-Forwarded-Proto 头字段获取）</span></p>
          </FormItem>
          <FormItem
            label="转发规则"
            {...formItemLayout}
          >
            <Input placeholder="输入域名 URL （非必填）" {...relayRuleProps}/>
          </FormItem>
          <Row>
            <Col span={20} offset={2}>
              <Button type="ghost" className="bundleBtn" onClick={this.addItem}><Icon type="link" /> 绑定后端服务</Button>
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
            </Col>
          </Row>
        </Form>
        <div className="configFooter">
          <Button type="ghost" size="large" onClick={this.goBack} disabled={confirmLoading}>取消</Button>
          <Button type="primary" size="large" onClick={this.handleConfirm} loading={confirmLoading}>确认</Button>
        </div>
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
  getLBDetail
})(MonitorDetail)