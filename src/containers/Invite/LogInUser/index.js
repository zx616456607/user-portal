/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/15
 * @author ZhaoXueYu
 */
import '../style/Invite.less'
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, Row } from 'antd'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP, EMAIL_REG_EXP } from '../../../../constants'
import { browserHistory } from 'react-router'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}
let LogInUser = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      submitProps: {},
      intPassFocus: false,
      intCheckFocus: false,
      passWord: false,
      rePassWord: false,
      intRePassFocus: false,
      intTelFocus: false,
      captchaLoading: false,
      countDownTimeText: '发送验证码',
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const { form, redirect, email, login, joinTeam, code } = this.props
    const { validateFields, resetFields } = form
    const self = this
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        submitting: true,
        submitProps: {
          disabled: 'disabled'
        }
      })
      const body = {
        password: values.password,
        email: email,
      }
      if (values.name.indexOf('@') > -1) {
        body.email = values.name
      } else {
        body.username = values.name
      }
      //登录req:
      login(body, {
        success: {
          func: (result) => {
            joinTeam(code)
            self.setState({
              submitting: false,
              submitProps: {},
            })
            message.success(`登录成功`)
            browserHistory.push('/')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            console.log('login failed')
            let msg = err.message.message || err.message
            if (err.statusCode == 401) {
              msg = "用户名或者密码错误"
            }
            self.setState({
              submitting: false,
              loginResult: {
                error: msg
              },
              submitProps: {},
            })
            resetFields(['password'])
          },
          isAsync: true
        },
      })
    })
  },
  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
    callback()
  },
  intOnBlur(current) {
    const { getFieldProps } = this.props.form
    if (current === 'pass') {
      let password = getFieldProps('password').value
      if (password === '' || !password) {
        this.setState({
          intPassFocus: false,
          passWord: true,
        })
      }
      return
    }
    if (current === 'check') {
      let captcha = getFieldProps('captcha').value
      if (captcha === '' || !captcha) {
        this.setState({
          intCheckFocus: false
        })
      }
      return
    }
    if (current === 'rePasswd') {
      let rePasswd = getFieldProps('rePasswd').value
      if (rePasswd === '' || !rePasswd) {
        this.setState({
          intRePassFocus: false,
          rePassWord: true,
        })
      }
      return
    }
    if (current === 'tel') {
      let tel = getFieldProps('tel').value
      if (tel === '' || !tel) {
        this.setState({
          intTelFocus: false,
        })
      }
    }
  },
  intOnFocus(current) {
    if (current === 'pass') {
      this.refs.intPass.refs.input.focus()
      this.setState({
        intPassFocus: true,
        passWord: true,
      })
      return
    }
    if (current === 'check') {
      this.refs.intCheck.refs.input.focus()
      this.setState({
        intCheckFocus: true
      })
      return
    }
    if (current === 'rePasswd') {
      this.refs.intRePass.refs.input.focus()
      this.setState({
        intRePassFocus: true,
        rePassWord: true,
      })
      return
    }
    if (current === 'tel') {
      console.log('tel');
      this.refs.intTel.refs.input.focus()
      this.setState({
        intTelFocus: true,
      })
    }
  },
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },
  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps } = this.state
    const { email } = this.props
    const passwdProps = getFieldProps('password', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
    })
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    return (
      <Form onSubmit={this.handleSubmit}>
        <input style={{ display: 'none' }} />
        <FormItem
          {...formItemLayout}
          className="formItemName nameIntPlace"
        >
          <div className={"intName intOnFocus"}>用户名 / 邮箱</div>
          <Input placeholder={email} disabled />
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intPassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>密码</div>
          <Input {...passwdProps} autoComplete="off" type={this.state.passWord ? 'password' : 'text'}
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'pass')}
                 onFocus={this.intOnFocus.bind(this, 'pass')}
                 ref="intPass"
                 style={{ height: 35 }}
          />
        </FormItem>
        <FormItem wrapperCol={{ span: 24, }}>
          <Button
            htmlType="submit"
            type="primary"
            onClick={this.handleSubmit}
            loading={submitting}
            {...submitProps}
            className="subBtn">
            {submitting ? '登录中...' : '登录并加入团队'}
          </Button>
        </FormItem>
      </Form>
    )
  }
})
LogInUser = createForm()(LogInUser)
export default LogInUser