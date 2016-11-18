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
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, } from 'antd'
import './style/Login.less'
import { verifyCaptcha, login } from '../../actions'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP, EMAIL_REG_EXP } from '../../constants'
import { browserHistory } from 'react-router'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let Login = React.createClass({
  getInitialState() {
    return {
      random: '0',
      submitting: false,
      loginResult: {},
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const { login, form, redirect } = this.props
    const { validateFields, resetFields } = form
    const self = this
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        submitting: true,
      })
      const body = {
        password: values.password,
        captcha: values.captcha
      }
      if (values.name.indexOf('@') > -1) {
        body.email = values.name
      } else {
        body.username = values.name
      }
      login(body, {
        success: {
          func: (result) => {
            self.setState({
              submitting: false
            })
            message.success(`用户 ${values.name} 登录成功`)
            browserHistory.push(redirect || '/')
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            self.setState({
              submitting: false,
              loginResult: {
                error: err.message.message
              }
            })
            self.changeCaptcha()
            resetFields(['password'])
          },
          isAsync: true
        },
      })
    })
  },

  checkName(rule, value, callback) {
    if (!value || value.length < 3) {
      callback()
      return
    }
    setTimeout(() => {
      if (value.indexOf('@') > -1) {
        if (!EMAIL_REG_EXP.test(value)) {
          callback([new Error('邮箱地址填写错误')])
          return
        }
        callback()
        return
      }
      if (!USERNAME_REG_EXP.test(value)) {
        callback([new Error('用户名填写错误')])
        return
      }
      callback()
    }, 100)
  },

  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
    callback()
  },

  checkCaptcha(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    const { verifyCaptcha } = this.props
    setTimeout(() => {
      if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
        callback([new Error('验证码输入错误')])
        return
      }
      verifyCaptcha(value, {
        success: {
          func: (result) => {
            if (!result.correct) {
              callback([new Error('验证码输入错误')])
              return
            }
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            callback([new Error('校验错误')])
          },
          isAsync: true
        },
      })
    }, 400)
  },

  changeCaptcha() {
    const { resetFields, getFieldProps } = this.props.form
    const captcha = getFieldProps('captcha').value
    if (captcha) {
      resetFields(['captcha'])
    }
    this.setState({
      random: (Math.random() * 100000).toFixed()
    })
  },

  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, min: 3, message: '用户名至少为 3 个字符' },
        { validator: this.checkName },
      ],
    })
    const passwdProps = getFieldProps('password', {
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
          <div>
            {
              loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
            }
          </div>
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label="用户名 / 邮箱"
              hasFeedback
              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
              >
              <Input {...nameProps} />
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
              help={isFieldValidating('captcha') ? '校验中...' : (getFieldError('captcha') || []).join(', ')}
              >
              <Input {...captchaProps} autoComplete="off" />
              <Tooltip placement="top" title="点击更换">
                <img className="captchaImg" src={`/captcha/gen?_=${random}`} onClick={this.changeCaptcha} />
              </Tooltip>
              {/*<Col span="12">
                <Input {...captchaProps} autoComplete="off" />
              </Col>
              <Col span="12">
                <Tooltip placement="top" title="点击更换">
                  <img className="captchaImg" src={`/captcha/gen?_=${random}`} onClick={this.changeCaptcha} />
                </Tooltip>
              </Col>*/}
            </FormItem>

            <FormItem wrapperCol={{ span: 12, offset: 7 }}>
              <Button type="primary" onClick={this.handleSubmit} loading={submitting}>
                {submitting ? '登录中...' : '登录'}
              </Button>
            </FormItem>
            <input type="submit" style={{ display: 'none' }} />
          </Form>
        </Card>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { redirect } = props.location.query
  return {
    redirect
  }
}

Login = createForm()(Login)

Login = connect(mapStateToProps, {
  verifyCaptcha,
  login,
})(Login)

export default Login