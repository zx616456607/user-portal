/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *
 *
 * v0.1 - 2016/12/23
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Button, Form, Input, message, notification, Alert } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { resetPassword } from '../../actions/user'
import homeNoWarnPNG from '../../assets/img/homeNoWarn.png'
import './style/CommitReset.less'
import Top from '../../components/Top'
import { getDeepValue } from '../../../client/util/util'

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
      btnState: false,
    }
  },

  checkPass(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母,长度为6~16个字符')])
      return
    }
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
    const { form, registerUser, resetPassword, email, code } = this.props
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
      const body = {
        email,
        code,
        password: values.password,
      }
      //重置密码
      resetPassword(body,{
        success: {
          func: (result) => {
            self.setState({
              submitting: false,
              resetSuccess: true,
              btnState: false,
            })
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            self.setState({
              submitting: false,
              resetSuccess: false,
              btnState: false,
            })
            message.error('重置失败')
          }
        }
      })
    })
  },
  renderBtnText (submitting) {
    if (submitting) {
      return (
        <span>重置中. . .</span>
      )
    }
    return (
        <span>重置</span>
    )
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
    const { submitting, spendEmail, btnState } = this.state
    const { email, from } = this.props
    const passwdProps = getFieldProps('password', {
      rules: [
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
      <div className="CommitReset">
      {
      this.state.resetSuccess ?
        <div className='resetSuccess'>
          <div className='resetSucImg'>
            <img src={homeNoWarnPNG} />
          </div>
          <div className='resetSucInf'>
            <div className='resetSucText'>重置密码成功 ! </div>
            <Link to='/login'>
              <Button className='subBtn'>
                去登录
              </Button>
            </Link>
          </div>
        </div> :
        <div>
          {
            from === 'login'
            ? (
              <Alert
                message="由于安全管理需要，首次登录需设置新密码"
                type="warning"
                showIcon
              />
            )
            : <div className='resetTitle'>重置密码</div>
          }
          {/* <div className="TopWrap">
          <Top loginLogo={this.props.info.loginLogo} />
          </div> */}
          <div className='resetForm' style={{marginTop: 35, minWidth: 200}}>
            <Form>
              <FormItem
                {...formItemLayout}
                className="formItemName"
              >
                {/* <div className={"intName intOnFocus"}>邮箱</div> */}
                <Input
                  className="usernameDisable"
                  value={email}
                  disabled
                  placeholder="邮箱"
                />
              </FormItem>

              <FormItem
                {...formItemLayout}
                hasFeedback
                className="formItemName"
              >
                {/* <div className={this.state.intPassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'pass')}>密码</div> */}
                <Input {...passwdProps} autoComplete="off" type={this.state.passWord ? 'password' : 'text'}
                       onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                       onBlur={this.intOnBlur.bind(this, 'pass')}
                       onFocus={this.intOnFocus.bind(this, 'pass')}
                       ref="intPass"
                       style={{ height: 35 }}
                       placeholder="首次登录, 请设置密码"
                />
              </FormItem>
              <FormItem
                {...formItemLayout}
                hasFeedback
                className="formItemName"
              >
                {/* <div className={this.state.intRePassFocus ? "intName intOnFocus" : "intName"} onClick={this.intOnFocus.bind(this, 'rePasswd')}>确认密码</div> */}
                <Input {...rePasswdProps} autoComplete="off" type={this.state.rePassWord ? 'password' : 'text'}
                       onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}
                       onBlur={this.intOnBlur.bind(this, 'rePasswd')}
                       onFocus={this.intOnFocus.bind(this, 'rePasswd')}
                       ref="intRePass"
                       style={{ height: 35 }}
                       placeholder="确认密码"
                />
              </FormItem>

              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  type="primary"
                  onClick={this.handleResetPass}
                  loading={submitting}
                  className="subBtn"
                  style={{marginBottom: 20}}
                  disabled={btnState}
                >
                  {
                    this.renderBtnText(submitting)
                  }
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
      }
        </div>
    )
  }
})

CommitReset = createForm()(CommitReset)

function mapStateToProps (state,props) {
  const info = getDeepValue(state, ['personalized', 'info', 'result'])
  return {
    info
  }
}

CommitReset = connect(mapStateToProps,{
  resetPassword
})(CommitReset)

export default CommitReset