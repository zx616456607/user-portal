/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  SuccessRegister
 *
 * v0.1 - 2016/12/23
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Button, Form, Input } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'

const createForm = Form.create
const FormItem = Form.Item

function noop() {
  return false
}

let CommitReset = React.createClass({
  getInitialState(){
    return {
      submitting: false,//注册中
      intPassFocus: false,
      passWord: false,
      rePassWord: false,
      intRePassFocus: false,
      resetSuccess: false,
    }
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
        resetSuccess: true,
      })
      //重置密码
    })
  },
  componentWillMount() {
    const { resetFields } = this.props.form
    resetFields()
  },

  render(){
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    const { submitting, spendEmail } = this.state
    const { email } = this.props
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
    return (
      this.state.resetSuccess ?
        <div className='resetSuccess'>
          <div className='resetSucImg'>
            <img src='/img/homeNoWarn.png' />
          </div>
          <div className='resetSucInf'>
            <div className='resetSucText'>重置密码成功 ! </div>
            <Button
              className='subBtn'
            >
              <Link to='/login'>
                去登录
              </Link>
            </Button>
          </div>
        </div> :
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
})

CommitReset = createForm()(CommitReset)

export default CommitReset