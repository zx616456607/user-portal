/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/14
 * @author ZhaoXueYu
 */
import '../style/Invite.less'
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, Tooltip, message, Alert, Col, Row } from 'antd'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP, EMAIL_REG_EXP } from '../../../constants'
import { browserHistory } from 'react-router'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}
let NotLogUser = React.createClass({
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
      intUserNameFocus: false,
      captchaLoading: false,
      countDownTimeText: '发送验证码',
    }
  },
  
  handleSubmit(e) {
    e.preventDefault()
    const { form, redirect, registerUserAndJoinTeam, code } = this.props
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
        captcha: values.captcha,
        userName: values.userName,
        phone: values.tel,
        email: this.props.email,
        code
      }
      //注册req:
      registerUserAndJoinTeam(body, {
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              submitProps: {},
            })
            message.success(`注册并加入团队成功`)
            browserHistory.push('/login')
            resetFields()
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            let msg = err.message.message || err.message
            self.setState({
              submitting: false,
              loginResult: {
                error: msg
              },
              submitProps: {},
            })
          },
          isAsync: true
        },
      })
    })
  },

  checkUserName(rule, value, callback) {
    if (!value || value.length < 3) {
      callback()
      return
    }
    if (!USERNAME_REG_EXP.test(value)) {
      callback([new Error('用户名填写错误')])
      return
    }
    callback()
  },

  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form
    callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('password')) {
      callback('两次输入密码不一致！');
    } else {
      callback()
    }
  },
  checkCaptcha(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
  },
  checkTel(rule, value, callback){
    if(!value){
      callback()
      return
    }
    if(value.length !== 11){
      callback([new Error('请输入11位的手机号')])
      return
    }
    callback()
  },
  //发送验证码
  changeCaptcha() {
    this.setState({
      captchaLoading: true,
      countDownTimeText: '60s 后重新发送',
    })
    //重新发送定时器
    let wait = 59
    let time = setInterval(() => {
      let text = wait + 's 后重新发送'
      wait--
      if(wait >= -1){
        this.setState({
          countDownTimeText: text
        })
        return
      }
      this.setState({
        captchaLoading: false,
        countDownTimeText: '发送验证码',
      })
      clearInterval(time)
    },1000)

    // send captcha
    const { validateFields } = this.props.form
    validateFields((err, values) => {
      if (err) {
        return
      }
      const phone = values.tel
      if (!phone) {
        return
      }
      this.props.sendRegisterPhoneCaptcha(phone)
    })
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
    if (current === 'userName') {
      let password = getFieldProps('userName').value
      if (password === '' || !password) {
        this.setState({
          intUserNameFocus: false,
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
    if (current === 'userName') {
      this.refs.intUserName.refs.input.focus()
      this.setState({
        intUserNameFocus: true,
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
    const userNameProps = getFieldProps('userName', {
      rules: [
        { required: true, min: 3, message: '用户名至少为 3 个字符' },
        { validator: this.checkUserName },
      ],
    })
    const passwdProps = getFieldProps('password', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
    })
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: this.checkPass2,
      }],
    })
    const telProps = getFieldProps('tel', {
      rules: [
        { required: true, message: '请填写手机号' },
        { validator: this.checkTel },
      ],
    })
    const captchaProps = getFieldProps('captcha', {
      /*rules: [
        { required: true, message: '请填写验证码' },
        { validator: this.checkCaptcha },
      ],*/
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
          <div className={"intName intOnFocus"}>邮箱</div>
          <Input placeholder={email} disabled />
        </FormItem>
        
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intUserNameFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'userName')}>用户名</div>
          <Input {...userNameProps} autoComplete="off"
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'userName')}
                 onFocus={this.intOnFocus.bind(this, 'userName')}
                 ref="intUserName"
                 style={{ height: 35 }}
          />
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
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intRePassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>确认密码</div>
          <Input {...rePasswdProps} autoComplete="off" type={this.state.rePassWord ? 'password' : 'text'}
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'rePasswd')}
                 onFocus={this.intOnFocus.bind(this, 'rePasswd')}
                 ref="intRePass"
                 style={{ height: 35 }}
          />
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
        >
          <div className={this.state.intTelFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>手机号</div>
          <Input {...telProps} autoComplete="off"
                 onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                 onBlur={this.intOnBlur.bind(this, 'tel')}
                 onFocus={this.intOnFocus.bind(this, 'tel')}
                 ref="intTel"
                 style={{ height: 35 }}
          />
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback
          className="formItemName"
          style={{width:'60%'}}
          help={isFieldValidating('captcha') ? '校验中...' : (getFieldError('captcha') || []).join(', ')}
        >
          <div className={this.state.intCheckFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'check')}>验证码</div>
          <Input {...captchaProps} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'check')}
                 onFocus={this.intOnFocus.bind(this, 'check')}
                 ref="intCheck"
                 style={{ height: 35 }} />
        </FormItem>
        <Tooltip placement="top" title="点击重新发送">
          <Button className="captchaBtn"
                  onClick={this.changeCaptcha}
                  type="primary"
                  loading={this.state.captchaLoading}
          >
            {this.state.countDownTimeText}
          </Button>
        </Tooltip>
        <FormItem wrapperCol={{ span: 24, }}>
          <Button
            htmlType="submit"
            type="primary"
            onClick={this.handleSubmit}
            loading={submitting}
            {...submitProps}
            className="subBtn">
            {submitting ? '注册中...' : '注册并加入团队'}
          </Button>
        </FormItem>
      </Form>
    )
  }
})
NotLogUser = createForm()(NotLogUser)
export default NotLogUser