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
import { Form, Row, Col, Input, InputNumber, Select, Button, Icon } from 'antd'
import './style/Ports.less'

const FormItem = Form.Item
const Option = Select.Option
const MIN = 1
const SPECIAL_MIN = 10000
const MAX = 65535

const Ports = React.createClass({
  renderPortItem(key) {
    const { getFieldProps  } = this.props.form
    const portKey = `port${key}`
    const portProtocolKey = `portProtocol${key}`
    const portProps = getFieldProps(portKey, {
      rules: [
        { required: true, message: '请输入容器端口' },
        // { validator: this.checkMountPath.bind(this, key) }
      ],
    })
    const portProtocolProps = getFieldProps(portProtocolKey, {
      rules: [
        { required: true },
        // { validator: this.checkMountPath.bind(this, key) }
      ],
    })
    return [
      <Col span={4}>
        <FormItem>
          <InputNumber
            size="default"
            min={MIN}
            max={MAX}
            {...portProps} />
        </FormItem>
      </Col>,
      <Col span={5}>
        <FormItem>
          <Select size="default" {...portProtocolProps}>
            <Option value="HTTP">HTTP</Option>
            <Option value="TCP">TCP</Option>
          </Select>
        </FormItem>
      </Col>,
      <Col span={10}>
        <FormItem>
          <Row gutter={16}>
            <Col span={12}>
              <Select size="default">
                <Option value="auto">动态生成</Option>
                <Option value="special">指定端口</Option>
              </Select>
            </Col>
            <Col span={12}>
              <InputNumber
                size="default"
                min={SPECIAL_MIN}
                max={MAX} />
            </Col>
          </Row>
        </FormItem>
      </Col>,
      <Col span={5}>
        <Button className="deleteBtn" type="dashed" disabled={key === 0} size="default">
          <Icon type="delete" />
        </Button>
      </Col>
    ]
  },
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldValue } = form
    // must set a port
    const portKeys = getFieldValue('portKeys') || [ 0 ]
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
              <Row className="portItem">
                {portKeys.map(this.renderPortItem)}
              </Row>
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
