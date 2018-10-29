/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Snapshot modal component
 *
 * v0.1 - 2017-7-17
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Modal, Form, Select, Row,Col,Icon } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link } from 'react-router'
import Title from '../../Title'
const Option = Select.Option

class SnapshotModal extends Component {
  constructor(props) {
    super()
  }
  NameExists(rule, value, callback) {
    if (!value) {
      return callback('请输入快照名称')
    }
    if (value.length <3) {
      return callback('快照名称三个字符以上')
    }
    callback()
  }
  selectConfig() {
    return <Option value="2G2C500G">2G2C500G</Option>
  }
  closeModal() {
    const { func, form } = this.props
    func.Modalfunc(false)
    form.resetFields()
  }
  handModalOk() {
    if(!this.props.project) {
      return
    }
    const {form, func} = this.props
    form.validateFieldsAndScroll((errors,values) => {
      if (errors) {
        return
      }
    })
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
    }
    const { getFieldProps } = this.props.form
    const configProps =  getFieldProps('configProps', {
      rules: [
        { required: true, message: '请选择云硬盘' },
      ]
    })
    const nameProps = getFieldProps('nameProps', {
      rules: [
        { validator: this.NameExists },
      ]
    })

    const { visible } = this.props
    return (
      <Modal title="创建快照" visible={visible}
        className="hostModalForm"
        onCancel={()=> this.closeModal()}
        onOk={()=> this.handModalOk()}
      >
        <Form>
          <Form.Item label="云硬盘ID" {...formItemLayout}>
            <Select {...configProps} placeholder="请选择云硬盘">
              {this.selectConfig()}
            </Select>
          </Form.Item>
          <Form.Item label="快照名称" {...formItemLayout}>
            <Input placeholder="请输入名称" {...nameProps} />
          </Form.Item>

        </Form>
      </Modal>
    )

  }
}

export default Form.create()(SnapshotModal)