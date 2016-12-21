/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/20
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Tabs, Button, Form, Input, Card, Tooltip, message, Alert, Col, Row  } from 'antd'
import './style/Person.less'
import { USERNAME_REG_EXP, EMAIL_REG_EXP } from '../../constants'
import { connect } from 'react-redux'
import { registerUser } from '../../actions/user'
import { browserHistory } from 'react-router'

const TabPane = Tabs.TabPane
const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let Person = React.createClass({
  getInitialState() {
    return {
      submitting: false,//注册中
      loginResult: {},
      submitProps: {},
      intPassFocus: false,//密码焦点
      intCheckFocus: false,//验证码焦点
      passWord: false,//密码显示星号
      rePassWord: false,//重复密码显示星号
      intEmailFocus: false,//重复密码焦点
      intTelFocus: false,//手机号焦点
      intUserNameFocus: false,//用户名焦点
      captchaLoading: false,//验证码验证中
      countDownTimeText: '发送验证码',//验证码计时文本
    }
  },
  //注册
  handleSubmit (e) {
    const { form, registerUser } = this.props
    const { validateFields, resetFields } = form
    const self = this
    e.preventDefault()
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
        email: values.email,
      }
      registerUser(body, {
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              submitProps: {},
            })
            message.success(`注册成功`)
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
/*
  start---验证---start
*/
  //用户名验证
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
  //邮箱验证
  checkEmail(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    if (!EMAIL_REG_EXP.test(value)) {
      callback([new Error('邮箱格式错误')])
      return
    }
    callback()
  },
  //密码验证
  checkPass(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    callback()
  },
  //验证码
  checkCaptcha(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
  },
  //手机号
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
/*
  end---验证---end
*/
  //发送验证码
  changeCaptcha() {
    this.setState({
      captchaLoading: true,
      countDownTimeText: '60s 后重新发送',
    })
    let wait = 59
    //重新发送定时器
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
  },
  //获取输入框焦点
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
    if (current === 'email') {
      let email = getFieldProps('email').value
      if (email === '' || !email) {
        this.setState({
          intEmailFocus: false
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
  //失去输入框焦点
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
    if (current === 'email') {
      this.refs.intEmail.refs.input.focus()
      this.setState({
        intEmailFocus: true
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
/*
  start---组件生命周期---start
*/
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },
/*
  end---组件生命周期---end
*/
  render() {
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { random, submitting, loginResult, submitProps } = this.state
    const { email } = this.props
  /*
  ---start---
    验证规则
  ---start---
  */
    //用户名规则
    const userNameProps = getFieldProps('userName', {
      rules: [
        { required: true, min: 3, message: '用户名至少为 3 个字符' },
        { validator: this.checkUserName },
      ],
    })
    //邮箱规则
    const emailProps = getFieldProps('email', {
      rules: [
        { required: true, message: '请填写邮箱' },
        { validator: this.checkEmail },
      ],
    })
    //密码规则
    const passwdProps = getFieldProps('password', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
        { validator: this.checkPass },
      ],
    })
    //重复密码
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true,
        whitespace: true,
        message: '请再次输入密码',
      }, {
        validator: this.checkPass2,
      }],
    })
    //手机号
    const telProps = getFieldProps('tel', {
      rules: [
        { required: true, message: '请填写手机号' },
        { validator: this.checkTel },
      ],
    })
    //验证码
    const captchaProps = getFieldProps('captcha', {
      /*rules: [
        { required: true, message: '请填写验证码' },
        { validator: this.checkCaptcha },
      ],*/
    })
  /*
  ---end---
    验证规则
  ---end---
  */
    //表单项样式
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    return (
      <div id='Person'>
        <Tabs defaultActiveKey="1">
          <TabPane tab="邮箱注册" key="1">
            {/*
              表单---start
            */}
            <Form onSubmit={this.handleSubmit}>
              <input style={{ display: 'none' }} />
              {/*用户名*/}
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
              {/*邮箱*/}
              <FormItem
                {...formItemLayout}
                hasFeedback
                className="formItemName"
                >
                <div className={this.state.intEmailFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'email')}>邮箱</div>

                <Input {...emailProps} autoComplete="off" onBlur={this.intOnBlur.bind(this, 'email')}
                  onFocus={this.intOnFocus.bind(this, 'email')}
                  ref="intEmail"
                  style={{ height: 35 }} />
              </FormItem>
              {/*密码*/}
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
              {/*手机号*/}
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
              {/*验证码*/}
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
              {/*验证码按钮*/}
              <Tooltip placement="top" title="点击重新发送">
                <Button className="captchaBtn"
                        onClick={this.changeCaptcha}
                        type="primary"
                        loading={this.state.captchaLoading}
                >
                  {this.state.countDownTimeText}
                </Button>
              </Tooltip>
              {/*注册按钮*/}
              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleSubmit}
                  loading={submitting}
                  {...submitProps}
                  className="subBtn">
                  {submitting ? '注册中...' : '注册'}
                </Button>
              </FormItem>
            </Form>
            {/*
              表单---end
            */}
            <div className="formTip">*&nbsp;注册表示您同意遵守&nbsp;
              <a href="https://www.tenxcloud.com/terms" target="_blank" style={{color:'#4691d2'}}>
                时速云&nbsp;TenxCloud&nbsp;服务条款
              </a>
            </div>
          </TabPane>
          <TabPane tab="微信注册" key="2">
          </TabPane>
        </Tabs>
      </div>
    )
  }
})
Person = createForm()(Person)
function mapStateToProps(state,props) {
  return {
    
  }
}

Person = connect(mapStateToProps,{
  registerUser,
})(Person)

export default Person
