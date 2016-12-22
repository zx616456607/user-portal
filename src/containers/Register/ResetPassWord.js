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

let ResetPassWord = React.createClass({
  getInitialState(){
    return {
      submitting: false,//注册中
      intEmailFocus: false,//邮箱焦点
      spendEmail: false,//发送邮件
      toEmail: '',//邮件地址
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
  },
  //发送邮箱
  handleSpendEmail(){
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
        submitProps: {
          disabled: 'disabled'
        }
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
  renderResetForm () {
    const { spendEmail } = this.state
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form
    const { submitting } = this.state
    //邮箱验证规则
    const emailProps = getFieldProps('email', {
      rules: [
        { required: true, message: '请填写邮箱' },
        { validator: this.checkEmail },
      ],
    })
    console.log('getFieldValue',getFieldValue('email'))
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
                  <Button>
                    <a href={this.state.toEmail} target='_blank'>
                      登录邮箱
                    </a>
                  </Button>
                </li>
                <li>重置密码 , 该邮件的有效期为24小时</li>
                <li className='rePass'>
                  没有收到邮件 ? 点此 
                  <Button>
                    重新发送
                  </Button>
                </li>
              </ul>
            </div> :
            <div className='registerForm' style={{marginTop:20}}>
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
                    className="subBtn">
                    {submitting ? '发送中...' : '发送邮箱'}
                  </Button>
                </FormItem>
              </Form>
            </div>
        }
      </div>
    )
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

function mapStateToProps(state, props) {
  return {

  }
}

ResetPassWord = createForm()(ResetPassWord)

ResetPassWord = connect(mapStateToProps, {

})(ResetPassWord)

export default ResetPassWord