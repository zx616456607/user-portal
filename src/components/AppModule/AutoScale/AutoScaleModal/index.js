/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoScale Modal
 *
 * v0.1 - 2017-09-19
 * @author zhangxuan
 */

import React from 'react'
import { Modal, Form, Input, Select, Row, Col, InputNumber } from 'antd'
import { connect } from 'react-redux'
const FormItem = Form.Item
const Option = Select.Option;

class AutoScaleModal extends React.Component {
  constructor() {
    super()
  }
  componentWillReceiveProps(nextProps) {
    const { visible: newVisible, scope } = nextProps
    const { visible: oldVisible } = this.props
    if (!oldVisible && newVisible) {
      scope.setState({
        scaleModal: true
      })
    } else if (oldVisible && !newVisible) {
      scope.setState({
        scaleModal: false
      })
    }
  }
  cancelModal = () => {
    const { scope } = this.props
    scope.setState({
      scaleModal: false
    })
  }
  confirmModal = () => {
    const { scope, form } = this.props
    const { validateFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      scope.setState({
        scaleModal: false
      })
    })
  }
  checkScaleName = (rule, value, callback) => {
    if (!value) {
      callback('请输入策略名称1')
    }
    callback()
  }
  render() {
    const { visible, form } = this.props
    const { getFieldProps } = form
    const formItemLargeLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 16}
    }
    const formItemMiddleLayout = {
      labelCol: { span: 9},
      wrapperCol: { span: 15}
    }
    const formItemSmallLayout = {
      labelCol: { span: 4},
      wrapperCol: { span: 10}
    }
    const scaleName = getFieldProps('scaleName', {
      rules: [{
        required: true,
        message: '请输入策略名称'
      }],
      validator: this.checkScaleName.bind(this)
    })
    const selectApp = getFieldProps('selectApp', {
      rules: [{
        required: true,
        message: '请选择应用'
      }]
    })
    const selectService = getFieldProps('selectService', {
      rules: [{
        required: true,
        message: '请选择服务'
      }]
    })
    const minReplicas = getFieldProps('minReplicas', {
      rules: [{
        required: true,
        message: '请输入最小实例数'
      }]
    })
    return(
      <Modal
      title="创建自动伸缩策略"
      visible={visible}
      onCancel={this.cancelModal}
      onOk={this.confirmModal}>
        <Form form={form}>
          <FormItem
            {...formItemLargeLayout}
            label="策略名称"
          >
            <Input type="text" {...scaleName} placeholder="请输入策略名称"/>
          </FormItem>
          <Row>
            <Col span={11}>
              <FormItem
                {...formItemMiddleLayout}
                label="选择应用"
              >
                <Select {...selectApp} placeholder="请选择应用">
                  <Option value="china">中国</Option>
                  <Option value="use">美国</Option>
                  <Option value="japan">日本</Option>
                  <Option value="korean">韩国</Option>
                  <Option value="Thailand">泰国</Option>
                </Select>
              </FormItem>
            </Col>
            <Col offset={1} span={11}>
              <FormItem
                labelCol={{span: 0}}
                wrapperCol={{span: 15, offset: 2}}
              >
                <Select {...selectService} placeholder="请选择服务">
                  <Option value="china">中国</Option>
                  <Option value="use">美国</Option>
                  <Option value="japan">日本</Option>
                  <Option value="korean">韩国</Option>
                  <Option value="Thailand">泰国</Option>
                </Select>
              </FormItem>
            </Col>
            <FormItem
              {...formItemSmallLayout}
              label="最小实例数"
            >
              <InputNumber {...minReplicas}/> 个
            </FormItem>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(AutoScaleModal)