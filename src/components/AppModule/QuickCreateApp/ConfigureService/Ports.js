/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: ports configure for service
 *
 * v0.1 - 2017-05-11
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import {
  Form, Row, Col,
  Input, InputNumber, Select,
  Button, Icon, Tooltip
} from 'antd'
import { isDomain } from '../../../../common/tools'
import './style/Ports.less'

const FormItem = Form.Item
const Option = Select.Option
const MIN = 1
const SPECIAL_MIN = 10000
const MAX = 65535
const MAPPING_PORT_AUTO = 'auto'
const MAPPING_PORT_SPECIAL = 'special'

const Ports = React.createClass({
  checkContainerPort(key, rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (value < MIN || value > MAX) {
      return callback(`容器端口范围为${MIN}~${MAX}`)
    }
    const { getFieldValue } = this.props.form
    const portsKeys = getFieldValue('portsKeys') || []
    let error
    portsKeys.every(_key => {
      const port = getFieldValue(`port${_key}`)
      if (_key !== key && value === port) {
        error = '已填写过该端口'
        return false
      }
      return true
    })
    callback(error)
  },
  checkMappingPort(key, rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (value < SPECIAL_MIN || value > MAX) {
      return callback(`容器端口范围为${SPECIAL_MIN}~${MAX}`)
    }
    const { getFieldValue } = this.props.form
    const portsKeys = getFieldValue('portsKeys') || []
    let error
    portsKeys.every(_key => {
      const mappingPort = getFieldValue(`mappingPort${_key}`)
      if (_key !== key && value === mappingPort) {
        error = '已填写过该端口'
        return false
      }
      return true
    })
    callback(error)
  },
  removePortsKey(key) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const portsKeys = getFieldValue('portsKeys') || []
    setFieldsValue({
      portsKeys: portsKeys.filter(_key => _key !== key)
    })
  },
  renderPortItem(key) {
    const { form, currentCluster } = this.props
    const { getFieldProps, getFieldValue } = form
    const { bindingDomains } = currentCluster
    const httpOptionDisabled = !isDomain(bindingDomains)
    const portKey = `port${key}`
    const portProtocolKey = `portProtocol${key}`
    const mappingPportTypeKey = `mappingPportType${key}`
    const mappingPortKey = `mappingPort${key}`
    const portProps = getFieldProps(portKey, {
      rules: [
        { required: true, message: '请输入容器端口' },
        { validator: this.checkContainerPort.bind(this, key) }
      ],
    })
    const portProtocolProps = getFieldProps(portProtocolKey, {
      rules: [
        { required: true, message: '请选择端口协议' },
      ],
    })
    const mappingPortTypeProps = getFieldProps(mappingPportTypeKey, {
      rules: [
        { required: true, message: '请选择映射服务端口类型' },
      ],
      initialValue: MAPPING_PORT_AUTO,
    })
    const mappingPortTypeValue = getFieldValue(mappingPportTypeKey)
    let mappingPortProps
    if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
      mappingPortProps = getFieldProps(mappingPortKey, {
        rules: [
          { required: true, message: '请输入指定端口' },
          { validator: this.checkMappingPort.bind(this, key) }
        ],
      })
    }
    return (
      <Row className="portItem">
        <Col span={4}>
          <FormItem>
            <InputNumber
              size="default"
              min={MIN}
              max={MAX}
              {...portProps} />
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem>
            <Select size="default" {...portProtocolProps}>
              <Option value="HTTP" disabled={httpOptionDisabled}>HTTP</Option>
              <Option value="TCP">TCP</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={10}>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem>
                <Select size="default" {...mappingPortTypeProps}>
                  <Option value={MAPPING_PORT_AUTO}>动态生成</Option>
                  <Option value={MAPPING_PORT_SPECIAL}>指定端口</Option>
                </Select>
              </FormItem>
            </Col>
            {
              mappingPortProps && (
                <Col span={12}>
                  <FormItem>
                    <InputNumber
                      size="default"
                      {...mappingPortProps}
                      min={SPECIAL_MIN}
                      max={MAX} />
                  </FormItem>
                </Col>
              )
            }
          </Row>
        </Col>
        <Col span={5}>
          <Tooltip title="删除">
            <Button
              className="deleteBtn"
              type="dashed"
              disabled={key === 0} size="default"
              onClick={this.removePortsKey.bind(this, key)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    )
  },
  addPortsKey() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    let mappingPortAutoFlag
    let portsKeys = getFieldValue('portsKeys') || []
    const validateFieldsKeys = []
    portsKeys.forEach(key => {
      validateFieldsKeys.push(`port${key}`)
      validateFieldsKeys.push(`portProtocol${key}`)
      validateFieldsKeys.push(`mappingPportType${key}`)
      const mappingPortTypeValue = getFieldValue(`mappingPportType${key}`)
      if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
        validateFieldsKeys.push(`mappingPort${key}`)
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      let uid = portsKeys[portsKeys.length - 1] || 0
      uid ++
      portsKeys = portsKeys.concat(uid)
      setFieldsValue({
        portsKeys,
        [`portProtocol${uid}`]: 'TCP',
      })
    })
  },
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldValue } = form
    // must set a port
    const portsKeys = getFieldValue('portsKeys') || [ 0 ]
    return (
      <Row className="portsConfigureService">
        <Col span={formItemLayout.labelCol.span} className="label">
          映射端口
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <div className="portList">
            <Row className="portsHeader">
              <Col span={4}>
                容器端口
              </Col>
              <Col span={5}>
                协议
              </Col>
              <Col span={10}>
                映射服务端口
              </Col>
              <Col span={5}>
                操作
              </Col>
            </Row>
            <div className="portsBody">
              {portsKeys.map(this.renderPortItem)}
            </div>
            <span className="addPort" onClick={this.addPortsKey}>
              <Icon type="plus-circle-o" />
              <span>添加映射端口</span>
            </span>
          </div>
        </Col>
      </Row>
    )
  }
})

export default Ports
