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

import './style/MonitorDetail.less'
import HealthCheckModal from './HealthCheckModal'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group;


let uidd = 0

class MonitorDetail extends React.Component {
  state = {
    
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
          errors: ['请选择权重'],
          value: ''
        }
      })
    }
    setFields(errorObj)
    return errorObj
  }
  
  addItem = () => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    
    const currentKeys = getFieldValue('keys')
    
    if (currentKeys.length) {
      const result = this.validateNewItem()
      if (!isEmpty(result)) {
        return
      }
    }
    uidd ++
    
    setFieldsValue({
      keys: currentKeys.concat(uidd)
    })
  }
  
  removeKey = key => {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    
    setFieldsValue({
      keys: getFieldValue('keys').filter(item => item !== key)
    })
  }
  
  cancelEdit = key => {
    const { form } = this.props
    const { setFieldsValue } = form
    this.setState({
      [`service${key}`]: false
    })
    setFieldsValue({
      [`service-${key}`]: this.state[`service${key}Value`],
      [`port-${key}`]: this.state[`port${key}Value`],
      [`weight-${key}`]: this.state[`weight${key}Value`]
    })
  }
  
  confirmEdit = key => {
    
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
      return callback('请选择权重')
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
  
  render() {
    const { checkVisible } = this.state
    const { currentMonitor, form } = this.props
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue, setFieldsValue } = form
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 8 }
    }
    const showSlider = getFieldValue('conversation')
  
    getFieldProps('keys', {
      initialValue: [],
    });
    const agreementProps = getFieldProps('agreement')
    const relayRuleProps = getFieldProps('relayRule')
    const serviceList = getFieldValue('keys').length ? getFieldValue('keys').map(item => {
      return (
        <Row className="serviceList" type="flex" align="middle" key={`service${item}`}>
          <Col span={6}>
            <FormItem>
              <Select 
                placeholder="请选择服务"
                disabled={!this.state[`service${item}`] && currentMonitor}
                {...getFieldProps(`service-${item}`, {
                  rules: [
                    {
                      validator: this.checkService
                    }
                  ]
                })} >
                <Option key={`service${item}1`}>service1</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span={3} offset={2}>
            <FormItem>
              <Select
                placeholder="请选择端口"
                disabled={!this.state[`service${item}`] && currentMonitor}
                {...getFieldProps(`port-${item}`, {
                  rules: [
                    {
                      validator: this.checkPort
                    }
                  ]
                })}>
                <Option key={`port${item}8080`}>8080</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Select
                placeholder="请选择权重"
                disabled={!this.state[`service${item}`] && currentMonitor}
                {...getFieldProps(`weight-${item}`, {
                  rules: [
                    {
                      validator: this.checkWeight
                    }
                  ]
                })}>
                <Option key={`weight${item}40`}>40</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <span className="successColor">已开启</span>&nbsp;
            <i className="fa fa-pencil-square-o pointer" aria-hidden="true" onClick={this.openCheckModal}/>
          </Col>
          <Col span={4} offset={1}>
            {
              !this.state[`service${item}`] ?
                [
                  currentMonitor && 
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
        暂时监听服务
      </Row>
    return (
      <Card
        title={currentMonitor ? '编辑监听' : '创建监听'}
        className="monitorDetail"
      >
        {
          checkVisible &&
          <HealthCheckModal
            visible={checkVisible}
            closeModal={this.closeCheckModal}
          />
        }
        <Form form={form}>
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
                <Select {...getFieldProps('port')}>
                  <Option key="80">80</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <FormItem
            label="调度算法"
            {...formItemLayout}
          >
            <RadioGroup {...getFieldProps('algorithm', { initialValue: '1'})}>
              <Radio value="1">轮询</Radio>
              <Radio value="2">最小连接数</Radio>
              <Radio value="3">源地址散列IP_HASH</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label="会话保持"
            {...formItemLayout}
          >
            <Checkbox {...getFieldProps('conversation')}>启用会话</Checkbox>
          </FormItem>
          {
            showSlider &&
            <Row>
              <Col span={8}>
                <FormItem
                  label="保持时间"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <Slider {...getFieldProps('time')}/>
                </FormItem>
              </Col>
              <Col span={2}>
                <InputNumber
                  style={{ marginRight: 0 }} max={100}
                  value={getFieldValue('time')} onChange={value => setFieldsValue({time: value})}/> s
              </Col>
            </Row>
          }
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
                <Col span={4}>权重&nbsp;
                  <Tooltip title="填写0-100 数值越大权重越大">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Col>
                <Col span={4}>健康检查</Col>
                <Col span={4}>操作</Col>
              </Row>
              {serviceList}
            </Col>
          </Row>
        </Form>
        <div className="configFooter">
          <Button type="ghost" size="large" onClick={this.goBack}>取消</Button>
          <Button type="primary" size="large">确认</Button>
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
  
})(MonitorDetail)