/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User info - Standard
 *
 * v0.1 - 2016-12-13
 * @author Bai Yu
 */
import React, { Component, PropTypes } from 'react'
import { Button, Tabs, Input, Icon, Modal, Upload, Dropdown, Form } from 'antd'
import { connect } from 'react-redux'
import { sendRegisterPhoneCaptcha, changeUserInfo } from '../../../../../actions/user.js'
import NotificationHandler from '../../../../../common/notification_handler.js'
const createForm = Form.create
const FormItem = Form.Item


let PhoneRow = React.createClass({
  getInitialState() {
    return {
      captchaLoading: false, //验证码验证中
      countDownTimeText: '发送验证码'//验证码计时文本
    }
  },
  phoneExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入手机号码')])
      return
    }
    if (!/\d{11}/.test(values)) {
      callback([new Error('请输入正确的号码')])
      return
    }
    callback()
    return
  },
   phonePasswordExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入帐户密码')])
      return
    }
    if (values.length < 3) {
      callback([new Error('账户密码不少于3个字符')])
      return
    }
    if (values.length > 63) {
      callback([new Error('账户密码字符不超过63个字符')])
      return
    }
    callback()
    return
  },
  testCode(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入验证码')])
      return
    }
    if (values.length < 6) {
      callback([new Error('请输入6位验证码')])
      return
    }
    callback()
    return
  },
  sendCode() {
    const { getFieldProps } = this.props.form
    const phone = getFieldProps('phone').value
    if(!phone || !/\d{11}/.test(phone)) {
      return
    }
    this.setState({
      captchaLoading: true,
      countDownTimeText: '60s 后重新发送'
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
        countDownTimeText: '发送验证码'
      })
      clearInterval(time)
    }, 1000)
    this.props.sendRegisterPhoneCaptcha(phone)
  },
  handPhone(e) {
    e.preventDefault()
    const self = this
    const scope = this.props.scope
    console.log(this.props.form)
    this.props.form.validateFields(['phonePassword', 'phone', 'code'], (errors, values) => {
      if (errors) {
        return
      }
      const noti = new NotificationHandler()
      noti.spin('修改手机中')
      self.props.changeUserInfo({
        captcha: values.code,
        phone: values.phone,
        password: values.phonePassword
      }, {
        success: {
          func: () => {
            noti.close()
            noti.success('修改手机成功')
            scope.setState({ editPhone: false })
          }
        },
        failed: {
          func: (result) => {
            noti.close()
            noti.error(result.message.message)
          }
        }
      })
    })
  },
  render() {
    const {getFieldProps} = this.props.form
    const phonePasswordProps = getFieldProps('phonePassword', {
      rules: [
        { whitespace: true, message: '请输入当前账户密码', require: true },
        { validator: this.phonePasswordExists }
      ]
    })
    const newPhone = getFieldProps('phone', {
      rules: [
        { whitespace: true, message: '请输入号码', require: true },
        { validator: this.phoneExists }
      ]
    })
    const testingCode = getFieldProps('code', {
      rules: [
        { whitespace: true, message: '请输入6位验证码', require: true },
        { validator: this.testCode }
      ]
    })
    const parentScope = this.props.scope
    return (
      <Form horizontal form={this.props.form}>
        <span className="key">手机</span>
        <div className="editPhoneList">
          <FormItem>
            <Input type="password" size="large" {...phonePasswordProps} placeholder="当前账户密码" style={{ width: '73%' }} />
          </FormItem>
          <div className="editPhone">
            <FormItem>
              <Dropdown overlay={{}}>
                <Button type="ghost" size="large" style={{ float: 'left' }}>
                  中国 （+86） <Icon type="down" />
                </Button>
              </Dropdown>
              <Input size="large" {...newPhone} className="phoneNumber" placeholder="新手机号" style={{ width: '50%' }} />
            </FormItem>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <FormItem>
            <Input size="large" {...testingCode} placeholder="6位验证码" style={{ width: '46%' }} />
            <Button size="large" style={{ marginLeft: '10px' }} onClick={()=> this.sendCode()} disabled={this.state.captchaLoading}>{this.state.countDownTimeText}</Button>
            </FormItem>
          </div>
          <Button size="large" onClick={() => parentScope.closeEdit('editPhone')}>取消</Button>
          <Button size="large" type="primary" onClick={(e)=>this.handPhone(e)} style={{ marginLeft: '10px' }} >确定</Button>
        </div>
      </Form>
    )
  }
})

PhoneRow = createForm()(PhoneRow)

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  sendRegisterPhoneCaptcha,
  changeUserInfo
})(PhoneRow)
