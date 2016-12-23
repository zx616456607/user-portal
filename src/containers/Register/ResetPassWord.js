/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  SuccessRegister
 *
 * v0.1 - 2016/12/22
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Button, Form, Input } from 'antd'
import { connect } from 'react-redux'
import { USERNAME_REG_EXP, EMAIL_REG_EXP, EMAIL_HASH } from '../../constants'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let ResetPassWord = React.createClass({
  getInitialState(){
    return {
      submitting: false,//注册中
      intEmailFocus: false,//邮箱焦点
      spendEmail: false,//发送邮件
      toEmail: '',//邮件地址
      intPassFocus: false,
      passWord: false,
      rePassWord: false,
      intRePassFocus: false,
    }
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
  //失去输入框焦点
  intOnBlur(current) {
    const { getFieldProps } = this.props.form
    if (current === 'email') {
      let email = getFieldProps('email').value
      if (email === '' || !email) {
        this.setState({
          intEmailFocus: false
        })
      }
      return
    }
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
  },
  //获取输入框焦点
  intOnFocus(current) {
    if (current === 'email') {
      this.refs.intEmail.refs.input.focus()
      this.setState({
        intEmailFocus: true
      })
      return
    }
    if (current === 'pass') {
      this.refs.intPass.refs.input.focus()
      this.setState({
        intPassFocus: true,
        passWord: true,
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
  },
  //发送邮箱
  handleSpendEmail(e){
    const { form, registerUser } = this.props
    const { validateFields, resetFields } = form
    const self = this
    e.preventDefault()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        spendEmail: true,
        submitting: true,
      })
      //发送邀请邮件
    })
  },
  //邮箱识别
  getEmail (url) {
    if (url.match('@')) {
      let addr = url.split('@')[1]
      for (let j in EMAIL_HASH) {
        this.setState({
          toEmail: EMAIL_HASH[addr]
        })
        return
      }
    }
    return false
  },
  //重置密码
  handleResetPass (e) {
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
      })
      //重置密码
    })
  },
  renderResetForm () {
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    const { submitting, spendEmail } = this.state
    const { rpw } = this.props
    //邮箱验证规则
    const emailProps = getFieldProps('email', {
      rules: [
        { required: true, message: '请填写邮箱' },
        { validator: this.checkEmail },
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
    let email = getFieldValue('email') || this.props.email
    if (rpw === '2') {
      return (
        <div>
          <div className='successTitle'>
            重置密码
          </div>
          <div className='registerForm' style={{marginTop:20, minWidth: 300}}>
              <Form>
                <FormItem
                  {...formItemLayout}
                  className="formItemName"
                >
                  <div className={"intName intOnFocus"}>邮箱</div>
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

                <FormItem wrapperCol={{ span: 24, }}>
                  <Button
                    type="primary"
                    onClick={this.handleResetPass}
                    loading={submitting}
                    className="subBtn"
                    style={{marginBottom: 20}}
                  >
                    {submitting ? '重置中...' : '重置密码'}
                  </Button>
                </FormItem>

              </Form>
            </div>
        </div>
      )
    }
    return (
      <div>
        <div className='successTitle'>
          重置密码
        </div>
        {
          spendEmail ?
            <div>
              <ul className='successInf' style={{marginBottom: 24}}>
                <li>
                  已发送到 { getFieldValue('email') } ,请
                  <Button className='passBtn' onClick={() => this.getEmail(email)}>
                    <a href={this.state.toEmail} target='_blank'>
                      登录邮箱
                    </a>
                  </Button>
                </li>
                <li>重置密码 , 该邮件的有效期为24小时</li>
                <li className='rePass'>
                  没有收到邮件 ? 点此 
                  <Button className='passBtn'>
                    重新发送
                  </Button>
                </li>
              </ul>
            </div> :
            <div className='registerForm' style={{marginTop:20, minWidth: 300}}>
              <Form>
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
                <FormItem wrapperCol={{ span: 24, }}>
                  <Button
                    type="primary"
                    onClick={this.handleSpendEmail}
                    loading={submitting}
                    className="subBtn"
                    style={{marginBottom: 20}}
                  >
                    {submitting ? '发送中...' : '发送邮箱'}
                  </Button>
                </FormItem>
              </Form>
            </div>
        }
      </div>
    )
  },
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },
  render(){
    return (
      <div id='RegisterPage'>
        <div className='register'>
          <div id='SuccessRegister'>
          {
            this.state.resetSuccess ?
              <div>success</div> :
              this.renderResetForm()
          }
          </div>
        </div>
      </div>
    )
  }
})

ResetPassWord = createForm()(ResetPassWord)

export default ResetPassWord