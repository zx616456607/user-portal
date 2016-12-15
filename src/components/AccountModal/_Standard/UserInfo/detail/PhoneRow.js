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
const createForm = Form.create;
const FormItem = Form.Item;


let PhoneRow = React.createClass({
  phoneExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入手机号码')])
      return
    }
    let phone = new RegExp(values)
    if (!phone.test('/\d/')) {
      callback([new Error('请输入正确的号码')])
      return
    }
  },
   phonePasswordExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入帐户密码')]);
      return
    }
    if (values.length < 6) {
      callback([new Error('账户密码不少于6个字符')])
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
      callback([new Error('请输入验证码')]);
      return
    }
    if (values.length < 6) {
      callback([new Error('请输入6位验证码')])
      return
    }
    callback()
    return
  },
  handPhone(e) {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form on phone !!!');
        return;
      }
      console.log('new phone !!!');
      console.log(values);
    });
  },
  render() {
    const {getFieldProps} = this.props.form
    const phonePasswordProps = getFieldProps('phonePassword', {
      rules: [
        { whitespace: true, message: '请输入当前账户密码' },
        { validator: this.phonePasswordExists }
      ]
    });

    const newPhone = getFieldProps('phone', {
      rules: [
        { whitespace: true, message: '请输入号码' },
        { validator: this.phoneExists }
      ]
    });
    const testingCode = getFieldProps('phone', {
      rules: [
        { whitespace: true, },
        { validator: this.testCode }
      ]
    });
    const parentScope = this.props.scope
    return (
      <Form horizontal form={this.props.form}>
        <span className="key">手机</span>
        <div className="editPhoneList">
          <FormItem>
            <Input size="large" {...phonePasswordProps} placeholder="当前账户密码" style={{ width: '73%' }} />
          </FormItem>
          <p className="editPhone">
            <FormItem>
              <Dropdown overlay=''>
                <Button type="ghost" size="large" style={{ float: 'left' }}>
                  中国 （+86） <Icon type="down" />
                </Button>
              </Dropdown>
              <Input size="large" {...newPhone} className="phoneNumber" placeholder="新手机号" style={{ width: '50%' }} />
            </FormItem>
          </p>
          <p style={{ marginBottom: '10px' }}>
            <FormItem>
            <Input size="large" {...testingCode} placeholder="6位验证码" style={{ width: '46%' }} />
            <Button size="large" style={{ marginLeft: '10px' }}>发送验证码</Button>
            </FormItem>
          </p>
          <Button size="large" onClick={() => parentScope.closeEdit('editPhone')}>取消</Button>
          <Button size="large" type="primary" onClick={(e) => this.handPhone(e)} style={{ marginLeft: '10px' }}>确定</Button>
        </div>
      </Form>

    )
  }
})

PhoneRow = createForm()(PhoneRow)

export default PhoneRow
