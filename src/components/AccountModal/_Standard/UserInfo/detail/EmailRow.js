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
import { connect } from 'react-redux'
import { Button, Tabs, Input, Icon, Modal, Upload, Dropdown, Form, Spin} from 'antd'
import { changeUserInfo } from '../../../../../actions/user.js'


const createForm = Form.create;
const FormItem = Form.Item;

let EmailRow = React.createClass({
  oldEmailExists(rule, values, callback) {
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
  newEmailExists(rule, values, callback) {
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
  handEmail(e) {
    e.preventDefault();
    const {form } = this.props
    const { changeUserInfo } = this.props
    form.validateFields(['emailPassword', 'newEmail'],(errors, values) => {
      if (!!errors) {
        return errors;
      }
      changeUserInfo({
        password: values.emailPassword,
        email: values.newEmail
      })
    });
  },
  render () {
    const {getFieldProps} = this.props.form
    const parentScope = this.props.scope
    const { isFetching } = this.props
    if(isFetching) {
      return (<div className="loadingBox">
          <Spin size="large"></Spin>
        </div>)
    }
    const emailPassword = getFieldProps('emailPassword', {
      rules: [
        { whitespace: true ,message:'请输入当前账户密码'},
        { validator: this.oldEmailExists }
      ]
    });
    const newEmailProps = getFieldProps('newEmail', {
      rules: [
        { whitespace: true, message:"请输入新邮箱"},
        { validator: this.newEmailExists }
      ]
    });
    return (
      <Form horizontal form={this.props.form}>
        <span className="key">邮箱</span>
        <div className="editList">
          <FormItem>
            <Input size="large" {...emailPassword} placeholder="当前账户密码" />
          </FormItem>
          <FormItem >
            <Input size="large" {...newEmailProps} placeholder="输入新邮箱" />
          </FormItem>
          <Button size="large" onClick={() => parentScope.closeEdit('editEmail')}>取消</Button>
          <Button size="large" type="primary" onClick={(e) => this.handEmail(e)} style={{ marginLeft: '10px' }}>确定</Button>
        </div>
      </Form>

    )
  }
})

function mapStateToProps(state) {
  return {
    isFetching: state.user.changeUserInfo.isFetching
  }
}
EmailRow = createForm()(EmailRow)

export default connect(mapStateToProps, {
  changeUserInfo
})(EmailRow)
