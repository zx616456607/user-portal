/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* Login page
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input } from 'antd'
import './style/Login.less'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let Login = React.createClass({
  handleReset(e) {
    e.preventDefault()
    this.props.form.resetFields()
  },

  handleSubmit(e) {
    e.preventDefault()
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!')
        return
      }
      console.log('Submit!!!')
      console.log(values)
    })
  },

  userExists(rule, value, callback) {
    if (!value) {
      callback()
    } else {
      setTimeout(() => {
        if (value === 'JasonWood') {
          callback([new Error('抱歉，该用户名已被占用。')])
        } else {
          callback()
        }
      }, 800)
    }
  },

  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
    callback()
  },

  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, min: 5, message: '用户名至少为 5 个字符' },
        { validator: this.userExists },
      ],
    })
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
    })
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    }
    return (
      <div id="Login">
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="用户名/邮箱"
            hasFeedback
            help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
            >
            <Input {...nameProps} placeholder="实时校验，输入 JasonWood 看看" />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="密码"
            hasFeedback
            >
            <Input {...passwdProps} type="password" autoComplete="off"
              onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
              />
          </FormItem>

          <FormItem wrapperCol={{ span: 12, offset: 7 }}>
            <Button type="primary" onClick={this.handleSubmit}>确定</Button>
            &nbsp;&nbsp;&nbsp;
          <Button type="ghost" onClick={this.handleReset}>重置</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
})

Login = createForm()(Login)

export default Login