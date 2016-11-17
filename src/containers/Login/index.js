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
import { Button, Form, Input, Card, Tooltip, } from 'antd'
import './style/Login.less'
import { verifyCaptcha } from '../../actions'
import { connect } from 'react-redux'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let Login = React.createClass({
  getInitialState() {
    return {
      random: '0',
    }
  },

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

  checkCaptcha(rule, value, callback) {
    if (!value) {
      callback()
    } else {
      const { verifyCaptcha } = this.props
      setTimeout(() => {
        if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
          callback([new Error('验证码错误')])
          return
        }
        verifyCaptcha(value, {
          success: {
            func: (result) => {
              console.log(result)
              callback()
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              console.log(err)
              callback([new Error('校验错误')])
            },
            isAsync: true
          },
        })
      }, 800)
    }
  },

  changeCaptcha() {
    this.setState({
      random: (Math.random() * 100000).toFixed()
    })
  },

  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random } = this.state
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
    const captchaProps = getFieldProps('captcha', {
      rules: [
        { required: true, message: '请填写验证码' },
        { validator: this.checkCaptcha },
      ],
    })
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    }
    return (
      <div id="Login">
        <Card className="loginForm">
          <Form horizontal>
            <FormItem
              {...formItemLayout}
              label="用户名 / 邮箱"
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

            <FormItem
              {...formItemLayout}
              label="验证码"
              hasFeedback
              >
              <Input {...captchaProps} autoComplete="off" />
              <Tooltip placement="top" title="点击更换">
                <img className="captchaImg" src={`/captcha/gen?_=${random}`} onClick={this.changeCaptcha} />
              </Tooltip>
            </FormItem>

            <FormItem wrapperCol={{ span: 12, offset: 7 }}>
              <Button type="primary" onClick={this.handleSubmit}>确定</Button>
              &nbsp;&nbsp;&nbsp;
              <Button type="ghost" onClick={this.handleReset}>重置</Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  return {}
}

Login = createForm()(Login)

Login = connect(mapStateToProps, {
  verifyCaptcha,
})(Login)

export default Login