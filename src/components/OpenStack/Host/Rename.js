/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * host rename component
 *
 * v0.1 - 2018-5-30
 * @author Baiyu
 */

import React from 'react'
import { Form, Input, Modal,Button } from 'antd'

class Rename extends React.Component {
  constructor(props) {
    super()
  }
  getFormname() {
    this.props.form.validateFieldsAndScroll((errors,values) => {
      if (errors) {
        return
      }
      this.props.handleEdit(values.hostname)
    })
  }
  checkVmName(rule,value,callback) {
    if (!value) {
      return callback('请输入云主机名称')
    }
    if (!/^[0-9a-zA-Z_\-.]+$/.test(value)) {
      callback('名称支持字母数字、下划线、中划线和点')
      return
    }
    if (value.length >64) {
      callback('名称最多可输入64位字符')
      return
    }
    const { servers } = this.props
    const result = servers.some(item => item.name == value)
    if(result) {
      return callback('主机名称已经存在')
    }
    callback()
  }
  render() {
    const { form } = this.props
    const hostName = form.getFieldProps('hostname',{
      rules:[{validator: this.checkVmName.bind(this)}],
      initialValue: this.props.value
    })
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    }
    return (
      <div>
        <Form>
          <Form.Item {...formItemLayout} label="云主机名称" required>
            <Input {...hostName} size="large" placeholder="请输入新名称" />
          </Form.Item>
        </Form>
        <div className="ant-modal-footer">
          <button onClick={()=> this.props.onCancel()} type="button" className="ant-btn ant-btn-ghost ant-btn-lg"><span>取 消</span></button>
          <Button loading={this.props.loading} size="large" onClick={()=> this.getFormname()} type="primary" >确 定</Button>
        </div>
      </div>
    )
  }
}
export default Form.create()(Rename)