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
import { injectIntl } from 'react-intl'
import IntlMessage from '../../../../../containers/Application/ServiceConfigIntl'
import NotificationHandler from '../../../../../components/Notification'

const FormItem = Form.Item
const Option = Select.Option
const MIN = 1
const SPECIAL_MIN = 10000
const MAX = 65535
const MAPPING_PORT_AUTO = 'auto'
const MAPPING_PORT_SPECIAL = 'special'
const notify = new NotificationHandler()

const Ports = React.createClass({
  checkContainerPort(key, rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      return callback()
    }
    if (value < MIN || value > MAX) {
      return callback(intl.formatMessage(IntlMessage.containerPortRange, {
        min: MIN, max: MAX,
      }))
    }
    const { getFieldValue } = this.props.form
    const portsKeys = getFieldValue('portsKeys') || []
    let error
    portsKeys.forEach((item, index) => {
      if(item.deleted){
        portsKeys.splice(index, 1)
      }
    })
    portsKeys.every(_key => {
      const port = getFieldValue(`port${_key.value}`)
      const protocol = this.formatProtocol(getFieldValue(`portProtocol${_key.value}`))
      const currentProtocol = this.formatProtocol(getFieldValue(`portProtocol${key}`))
      if (_key.value !== key && value === port && currentProtocol === protocol) {
        error = intl.formatMessage(IntlMessage.portExist)
        return false
      }
      return true
    })
    callback(error)
  },
  formatProtocol(protocol) {
    return protocol === 'UDP' ? 'UDP' : 'TCP'
  },
  forceCheckPorts() {
    const { getFieldValue, validateFields } = this.props.form
    const portsKeys = getFieldValue('portsKeys') || []
    setTimeout(() => {
      validateFields(portsKeys.filter(key => !key.deleted).map(key => `port${key.value}`), { force: true })
    }, 50);
  },
  checkContainerProtocol(rule, value, callback) {
    callback()
    this.forceCheckPorts()
  },
  checkMappingPort(key, rule, value, callback) {
    const { intl } = this.props
    if (!value) {
      return callback()
    }
    if (value < SPECIAL_MIN || value > MAX) {
      return callback(intl.formatMessage(IntlMessage.containerPortRange, {
        min: SPECIAL_MIN, max: MAX,
      }))
    }
    const { getFieldValue } = this.props.form
    const portsKeys = getFieldValue('portsKeys') || []
    let error
    portsKeys.every(_key => {
      const mappingPort = getFieldValue(`mappingPort${_key}`)
      if (_key !== key && value === mappingPort) {
        error = intl.formatMessage(IntlMessage.portExist)
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
    if (portsKeys.length <= 1) {
      notify.warn(intl.formatMessage(IntlMessage.portRequired))
      return
    }
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
    this.forceCheckPorts()
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
    const { form, currentCluster, isTemplate, disabled, intl } = this.props
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
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseEnter, {
            item: intl.formatMessage(IntlMessage.containerPort),
            end: '',
          })
        },
        { validator: this.checkContainerPort.bind(this, keyValue) }
      ],
    })
    const portProtocolProps = getFieldProps(portProtocolKey, {
      rules: [
        {
          required: true,
          message: intl.formatMessage(IntlMessage.pleaseEnter, {
            item: intl.formatMessage(IntlMessage.portProtocol),
            end: '',
          })
        },
        { validator: this.checkContainerProtocol }
      ],
    })
    const portProtocolValue = getFieldValue(portProtocolKey)
    let mappingPortTypeProps
    let mappingPortProps
    if ((portProtocolValue === 'TCP' || portProtocolValue === 'UDP') && accessMethod !== 'accessMethod') {
      mappingPortTypeProps = getFieldProps(mappingPportTypeKey, {
        rules: [
          {
            required: true,
            message: intl.formatMessage(IntlMessage.pleaseSelect, {
              item: intl.formatMessage(IntlMessage.mapServicePortType),
            })
          },
        ],
        initialValue: MAPPING_PORT_AUTO,
        onChange: this.portTypeChange.bind(this, keyValue)
      })
      const mappingPortTypeValue = getFieldValue(mappingPportTypeKey)
      if (mappingPortTypeValue === MAPPING_PORT_SPECIAL) {
        mappingPortProps = getFieldProps(mappingPortKey, {
          rules: [
            {
              required: true,
              message: intl.formatMessage(IntlMessage.pleaseEnter, {
                item: intl.formatMessage(IntlMessage.designatedPort),
                end: '',
              })
            },
            { validator: this.checkMappingPort.bind(this, keyValue) }
          ],
        })
      }
    }
    return (
      <Row className="portItem" key={`portItem${keyValue}`}>
        <Col span={this.props.meshFlag ? 8 : 5}>
          <FormItem>
            <InputNumber
              size="default"
              min={MIN}
              max={MAX}
              disabled={disabled}
              {...portProps} />
          </FormItem>
        </Col>
        <Col span={this.props.meshFlag ? 8 : 5}>
          <FormItem>
            <Select disabled={disabled} size="default" {...portProtocolProps}>
              {
                (accessMethod == 'Cluster' && !this.props.meshFlag) ?
                 [<Option key="TCP" value="TCP">TCP</Option>, <Option key="UDP" value="UDP">UDP</Option>] : []
              }{
                (accessMethod !== 'Cluster' && !this.props.meshFlag) ?
                 [<Option key="TCP" value="TCP">TCP</Option>, <Option key="UDP" value="UDP">UDP</Option>,
                <Option key="HTTP" value="HTTP" disabled={httpOptionDisabled}>HTTP</Option>] : []
              }{ this.props.meshFlag ?
                [<Option key="TCP" value="TCP">TCP</Option>,
                <Option key="HTTP" value="HTTP">HTTP</Option>,
                <Option key="HTTP2" value="HTTP2">HTTP2</Option>,
                <Option key="GRPC" value="GRPC">GRPC</Option>,
                <Option key="Mongo" value="Mongo">Mongo</Option>,
                <Option key="Redis" value="Redis">Redis</Option>,] : []
              }
            </Select>
          </FormItem>
        </Col>
        <Col span={this.props.meshFlag ? 0 : 9}>
          {
            accessMethod == 'Cluster'
            ? <div className='clusterPorts'>N/A</div>
            : <Row gutter={16}>
              <Col span={12}>
                {
                  mappingPortTypeProps
                    ? (
                    <FormItem>
                      <Select size="default" {...mappingPortTypeProps} disabled={isTemplate || disabled}>
                        <Option value={MAPPING_PORT_AUTO}>{intl.formatMessage(IntlMessage.dynamicGeneration)}</Option>
                        <Option value={MAPPING_PORT_SPECIAL}>{intl.formatMessage(IntlMessage.designatedPort)}</Option>
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
                        disabled={disabled}
                        max={MAX} />
                    </FormItem>
                  </Col>
                )
              }
            </Row>
          }
        </Col>
        <Col span={this.props.meshFlag ? 8 : 5}>
          <Tooltip title={intl.formatMessage(IntlMessage.delete)}>
            <Button
              className="deleteBtn"
              type="dashed"
              size="small"
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
      if ((portProtocolValue === 'TCP' || portProtocolValue === ' UDP') && accessMethod !== 'Cluster') {
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
      let uid = portsKeys.length && portsKeys[portsKeys.length - 1].value || 0
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
    const { formItemLayout, form, forDetail, disabled, intl } = this.props
    const { getFieldValue } = form
    // must set a port
    const portsKeys = getFieldValue('portsKeys') || []
    return (
      <Row className="portsConfigureService">
        <Col offset={forDetail ? 0 : formItemLayout.labelCol.span} className="formItemLabel">
          { !this.props.meshFlag && intl.formatMessage(IntlMessage.mapPort)}
          { this.props.meshFlag && intl.formatMessage(IntlMessage.exposeProtocol)}
        </Col>
        <Col offset={forDetail ? 0 : formItemLayout.labelCol.span}>
          <div className="portList">
            <Row className="portsHeader">
              <Col span={this.props.meshFlag ? 8 : 5}>
                {intl.formatMessage(IntlMessage.containerPort)}
              </Col>
              <Col span={this.props.meshFlag ? 8 : 5}>
                {intl.formatMessage(IntlMessage.protocol)}
              </Col>
              <Col span={this.props.meshFlag ? 0 : 9}>
                {intl.formatMessage(IntlMessage.mapServicePort)}
              </Col>
              <Col span={this.props.meshFlag ? 8 : 5}>
                {intl.formatMessage(IntlMessage.operate)}
              </Col>
            </Row>
            <div className="portsBody">
              {portsKeys.map(this.renderPortItem)}
            </div>
            {
              !disabled &&
              <span className="addPort" onClick={this.addPortsKey}>
                <Icon type="plus-circle-o" />
                <span>{intl.formatMessage(IntlMessage.addMapPort)}</span>
              </span>
            }
          </div>
        </Col>
      </Row>
    )
  }
})

export default injectIntl(Ports, {
  withRef: true,
})
