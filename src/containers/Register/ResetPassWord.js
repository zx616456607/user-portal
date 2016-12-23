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
import { USERNAME_REG_EXP, EMAIL_REG_EXP } from '../../constants'

const createForm = Form.create
const FormItem = Form.Item

let ResetPassWord = React.createClass({
  getInitialState(){
    return {
      submitting: false,//注册中
      intEmailFocus: false,//邮箱焦点
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
  handleSubmit(){

  },
  renderResetForm () {
    return (
      <div></div>
    )
  },
  render(){
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form
    const { submitting, submitProps } = this.state
    const formItemLayout = {
      wrapperCol: { span: 24 },
    }
    //邮箱验证规则
    const emailProps = getFieldProps('email', {
      rules: [
        { required: true, message: '请填写邮箱' },
        { validator: this.checkEmail },
      ],
    })
    return (
      <div id='RegisterPage'>
        <div className='register' style={{width:'40%'}}>
          <div id='SuccessRegister'>
          {
            this.state.resetSuccess ?
              <div>success</div> :
              this.renderResetForm()
          }
            <div className='successTitle'>
              重置密码
            </div>
            <div className='registerForm' style={{marginTop:20}}>
              <Form onSubmit={this.handleSubmit}>
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
                    htmlType="submit"
                    type="primary"
                    onClick={this.handleSubmit}
                    loading={submitting}
                    {...submitProps}
                    className="subBtn">
                    {submitting ? '发送中...' : '发送邮箱'}
                  </Button>
                </FormItem>
              </Form>
            </div>
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