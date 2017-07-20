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
import { isDomain } from '../../../../../common/tools'
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
      const port = getFieldValue(`port${_key.value}`)
      if (_key.value !== key && value === port) {
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
  removePortsKey(keyValue) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    const portsKeys = getFieldValue('portsKeys') || []
    setFieldsValue({
      portsKeys: portsKeys.map(_key => {
        if (_key.value === keyValue) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
        }
        return _key
      })
    })
  },
  portTypeChange(keyValue, value){
    if(value == MAPPING_PORT_SPECIAL){
      setTimeout(() => {
        let id = `mappingPort${keyValue}`
        document.getElementById(id).focus()
      },500)
    }
  },
  renderPortItem(key, index) {
    // 根据 `deleted` 字段来决定是否渲染
    if (key.deleted) {
      return
    }
    const keyValue = key.value
    const { form, currentCluster } = this.props
    const { getFieldProps, getFieldValue } = form
    const { bindingDomains } = currentCluster
    const accessMethod = getFieldValue('accessMethod')
    const httpOptionDisabled = !isDomain(bindingDomains)
    const portKey = `port${keyValue}`
    const portProtocolKey = `portProtocol${keyValue}`
    const mappingPportTypeKey = `mappingPortType${keyValue}`
    const mappingPortKey = `mappingPort${keyValue}`
    const portProps = getFieldProps(portKey, {
      rules: [
        { required: true, message: '请输入容器端口' },
        { validator: this.checkContainerPort.bind(this, keyValue) }
      ],
    })
    const portProtocolProps = getFieldProps(portProtocolKey, {
      rules: [
        { required: true, message: '请选择端口协议' },
      ],
    })
    const portProtocolValue = getFieldValue(portProtocolKey)
    let mappingPortTypeProps
    let mappingPortProps
    if (portProtocolValue === 'TCP' && accessMethod !== 'accessMethod') {
      mappingPortTypeProps = getFieldProps(mappingPportTypeKey, {
        rules: [
          { required: true, message: '请选择映射服务端口类型' },
        ],
        initialValue: MAPPING_PORT_AUTO,
        onChange: this.portTypeChange.bind(this, keyValue)
      })
      const mappingPortTypeValue = getFieldValue(mappingPportTypeKey)
      if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
        mappingPortProps = getFieldProps(mappingPortKey, {
          rules: [
            { required: true, message: '请输入指定端口' },
            { validator: this.checkMappingPort.bind(this, keyValue) }
          ],
        })
      }
    }
    return (
      <Row className="portItem" key={`portItem${keyValue}`}>
        <Col span={5}>
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
              {
                accessMethod == 'Cluster'
                ? <Option key="TCP" value="TCP">TCP</Option>
                : [<Option key="HTTP" value="HTTP" disabled={httpOptionDisabled}>HTTP</Option>,
                  <Option key="TCP" value="TCP">TCP</Option>]
              }
            </Select>
          </FormItem>
        </Col>
        <Col span={9}>
          {
            accessMethod == 'Cluster'
            ? <div className='clusterPorts'>N/A</div>
            : <Row gutter={16}>
              <Col span={12}>
                {
                  mappingPortTypeProps
                    ? (
                    <FormItem>
                      <Select size="default" {...mappingPortTypeProps}>
                        <Option value={MAPPING_PORT_AUTO}>动态生成</Option>
                        <Option value={MAPPING_PORT_SPECIAL}>指定端口</Option>
                      </Select>
                    </FormItem>
                  )
                    : (
                    <div className="httpMappingPort">80</div>
                  )
                }
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
          }
        </Col>
        <Col span={5}>
          <Tooltip title="删除">
            <Button
              className="deleteBtn"
              type="dashed"
              size="small"
              disabled={index === 0}
              onClick={this.removePortsKey.bind(this, keyValue)}
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
    const accessMethod = getFieldValue('accessMethod')
    const validateFieldsKeys = []
    portsKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      validateFieldsKeys.push(`port${keyValue}`)
      validateFieldsKeys.push(`portProtocol${keyValue}`)
      const portProtocolValue = getFieldValue(`portProtocol${keyValue}`)
      if (portProtocolValue === 'TCP' && accessMethod !== 'Cluster') {
        validateFieldsKeys.push(`mappingPortType${keyValue}`)
        const mappingPortTypeValue = getFieldValue(`mappingPortType${keyValue}`)
        if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
          validateFieldsKeys.push(`mappingPort${keyValue}`)
        }
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      let uid = portsKeys[portsKeys.length - 1].value || 0
      uid ++
      portsKeys = portsKeys.concat({ value: uid })
      setFieldsValue({
        portsKeys,
        [`portProtocol${uid}`]: 'TCP',
      })
      setTimeout(()=>{
        let input = document.getElementById(`port${uid}`);
        input && input.focus()
      },0)

    })
  },
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldValue } = form
    // must set a port
    const portsKeys = getFieldValue('portsKeys') || []
    return (
      <Row className="portsConfigureService">
        <Col span={formItemLayout.labelCol.span} className="formItemLabel">
          映射端口
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <div className="portList">
            <Row className="portsHeader">
              <Col span={5}>
                容器端口
              </Col>
              <Col span={5}>
                协议
              </Col>
              <Col span={9}>
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
