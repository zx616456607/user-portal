/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance
 *
 * v0.1 - 2018-01-17
 * @author Zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Select, Radio, Checkbox, Slider, Form,
  InputNumber, Icon, Button, Input, Row, Col 
} from 'antd'
import isEmpty from 'lodash/isEmpty'

import './style/LoadBalance.less'
import HealthCheckModal from '../../../LoadBalance/HealthCheckModal'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

let uidd = 0

class LoadBalance extends React.Component {
  
  state = {
    
  }
  
  checkLoadBalance = (rule, value, callback) => {
    if (!value) {
      return callback('请选择负载均衡')
    }
    callback()
  }
  
  validateNewItem = () => {
    const { form } = this.props
    const { getFieldValue, setFields } = form
    const keys = getFieldValue('keys')
    let endIndexValue = keys[keys.length - 1]
    let service = getFieldValue(`service-${endIndexValue}`)
    let port = getFieldValue(`port-${endIndexValue}`)
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
  
  render() {
    const { checkVisible } = this.state
    const { form } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue, isFieldValidating, getFieldError } = form
    
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 20 }
    }
    getFieldProps('keys', {
      initialValue: [],
    });
    const showSlider = getFieldValue('conversation')
    const lbSelectProps = getFieldProps('loadBalance', {
      rules: [
        {
          validator: this.checkLoadBalance
        }
      ]
    })
    const serviceList = getFieldValue('keys').length ? getFieldValue('keys').map((item, index, array) => {
        return (
          <Row className="serviceList" type="flex" align="middle" key={`service${item}`}>
            <Col span={6}>
              <FormItem>
                <Input
                  placeholder="输入域名 URL（非必填）"
                  {...getFieldProps(`service-${item}`, {
                    rules: [
                      {
                        validator: this.checkService
                      }
                    ]
                  })} >
                </Input>
              </FormItem>
            </Col>
            <Col span={4} offset={3}>
              <FormItem>
                <Input
                  placeholder="请输入端口"
                  {...getFieldProps(`port-${item}`, {
                    rules: [
                      {
                        validator: this.checkPort
                      }
                    ]
                  })}>
                </Input>
              </FormItem>
            </Col>
            <Col span={4} offset={1}>
              <span className="successColor">已开启</span>&nbsp;
              <i className="fa fa-pencil-square-o pointer" aria-hidden="true" onClick={this.openCheckModal}/>
            </Col>
            <Col span={4} offset={1}>
              <Button disabled={item !== array[array.length - 1]} type="dashed" icon="delete" key={`delete${item}`} onClick={() => this.removeKey(item)}/>
            </Col>
          </Row>
        )
      }):
      <Row className="serviceList hintColor noneService" type="flex" align="middle" justify="center">
        暂无监听服务
      </Row>
    return (
      <Row className="serviceCreateLb">
        {
          checkVisible &&
          <HealthCheckModal
            visible={checkVisible}
            closeModal={this.closeCheckModal}
          />
        }
        <Col span={20} offset={4}>
          <FormItem
            wrapperCol={{ span: 8 }}
          >
            <Select placeholder="选择应用负载均衡" {...lbSelectProps}>
              <Option key="load1">load balance 1</Option>
            </Select>
          </FormItem>
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
            <Checkbox {...getFieldProps('conversation')}>启用会话保持</Checkbox>
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
              <Col span={3}>
                <InputNumber
                  style={{ marginRight: 0 }} max={100}
                  value={getFieldValue('time')} onChange={value => setFieldsValue({time: value})}/> s
              </Col>
            </Row>
          }
          <Button className="addConfig" type="ghost" icon="plus" onClick={this.addItem}>添加监听器配置</Button>
          <Row className="monitorConfigHeader">
            <Col span={9}>域名</Col>
            <Col span={5}>服务端口</Col>
            <Col span={5}>健康检查</Col>
            <Col span={5}>操作</Col>
          </Row>
          {serviceList}
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = () => {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(LoadBalance)