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
import { Button, Tabs, Input, Icon, Modal, Upload, Dropdown, Form} from 'antd'
const createForm = Form.create;
const FormItem = Form.Item;

let EmallRow = React.createClass({
  oldEmallExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入当前密码')]);
      return;
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
  newEmallExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入新邮箱')]);
      return
    }
    if (values.indexOf('@') < 0) {
      callback([new Error('请输入正确的邮箱')])
      return
    }
    callback()
    return
  },
  handEmall(e) {
    e.preventDefault();
    const {form } = this.props
    form.validateFields(['emalPassword', 'newEmall'],(errors, values) => {
      if (!!errors) {
        return errors;
      }
      console.log('Submit!!!');
      console.log(values);
    });
  },
  render () {
    const {getFieldProps} = this.props.form
    const parentScope = this.props.scope
    const emalPassword = getFieldProps('emalPassword', {
      rules: [
        { whitespace: true ,message:'请输入当前账户密码'},
        { validator: this.oldEmallExists }
      ]
    });
    const newEmallProps = getFieldProps('newEmall', {
      rules: [
        { whitespace: true, message:"请输入新邮箱"},
        { validator: this.newEmallExists }
      ]
    });
    return (
      <Form horizontal form={this.props.form}>
        <span className="key">邮箱</span>
        <div className="editList">
          <FormItem>
            <Input size="large" {...emalPassword} placeholder="当前账户密码" />
          </FormItem>
          <FormItem >
            <Input size="large" {...newEmallProps} placeholder="输入新邮箱" />
          </FormItem>
          <Button size="large" onClick={() => parentScope.closeEdit('editEmall')}>取消</Button>
          <Button size="large" type="primary" onClick={(e) => this.handEmall(e)} style={{ marginLeft: '10px' }}>确定</Button>
        </div>
      </Form>

    )
  }
})

EmallRow = createForm()(EmallRow)

export default EmallRow