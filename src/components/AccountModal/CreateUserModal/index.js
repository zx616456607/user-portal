/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Create user modal
 *
 * v0.1 - 2016-12-01
 * @author Zhangpc
 */

import React from 'react'
import { Input, Modal, Form, Checkbox, Tooltip, Icon, Button, } from 'antd'
import { USERNAME_REG_EXP, ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'

const createForm = Form.create
const FormItem = Form.Item

let CreateUserModal = React.createClass({
  getInitialState() {
    return {
      disabled: false
    }
  },
  userExists(rule, value, callback) {
    const _this = this
    if (!value) {
      callback([new Error('请输入用户名')])
      return
    }
    const { checkUserName } = this.props.funcs
    if (!USERNAME_REG_EXP.test(value)) {
      callback([new Error('抱歉，用户名不合法。')])
      return
    }
    // Disabled submit button when checkUserName
    this.setState({
      disabled: true
    })
    clearTimeout(this.userExistsTimeout)
    this.userExistsTimeout = setTimeout(() => {
      checkUserName(value, {
        success: {
          func: (result) => {
            _this.setState({
              disabled: false
            })
            if (result.data) {
              callback([new Error('用户名已经存在')])
              return
            }
            callback()
          }
        },
        failed: {
          func: (err) => {
            _this.setState({
              disabled: false
            })
            callback([new Error('用户名校验失败')])
          }
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT);
  },
  checkPass(rule, value, callback) {
    if (value.length < 3 || value.length > 45) {
      callback([new Error('密码长度为3 ~ 45')])
      return
    }
    const { validateFields } = this.props.form;
    if (value) {
      validateFields(['rePasswd'], { force: true });
    }
    callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！')
      return
    }
    callback()
  },
  telExists(rule, value, callback) {
    if (!/^[0-9][-0-9()]{5,12}[0-9]$/.test(value)) {
      callback([new Error('请输入正确的手机号')])
      return
    }
    callback()
  },
  handleOk() {
    const { form, onSubmit, scope } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { name, passwd, email, tel, check } = values
      let newUser = {
        userName: name,
        password: passwd,
        email: email,
        phone: tel,
        sendEmail: check,
      }
      onSubmit(newUser)
      form.resetFields()
      scope.setState({
        visible: false,
      })
    })
  },
  handleCancel(e) {
    const { scope, form } = this.props
    e.preventDefault()
    form.resetFields()
    scope.setState({
      visible: false,
    })
  },
  render() {
    const { form, visible } = this.props
    const { disabled } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const text = <span>前台只能添加普通成员</span>
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.userExists },
      ],
    })
    const telProps = getFieldProps('tel', {
      validate: [{
        rules: [
          { required: true, message: '请输入手机号' },
        ],
        trigger: 'onBlur',
      }, {
        rules: [
          { validator: this.telExists },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    })
    const emailProps = getFieldProps('email', {
      validate: [{
        rules: [
          { required: true, message: '请输入邮箱地址' },
        ],
        trigger: 'onBlur',
      }, {
        rules: [
          { type: 'email', message: '请输入正确的邮箱地址' },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    })
    const passwdProps = getFieldProps('passwd', {
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
    const checkProps = getFieldProps('check', {})
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    }
    return (
      <Modal title="添加新成员" visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
        wrapClassName="NewMemberForm"
        width="463px"
        footer={[
          <Button
            key="back"
            type="ghost"
            size="large"
            onClick={this.handleCancel}>
            返 回
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            disabled={disabled}
            onClick={this.handleOk}>
            提 交
          </Button>,
        ]}>
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="名称"
            hasFeedback
            help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
            >
            <Input {...nameProps} placeholder="新成员名称" />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="类型"
            hasFeedback
            >
            <div>
              普通成员
              <Tooltip placement="right" title={text}>
                <Icon type="question-circle-o" style={{ marginLeft: 10 }} />
              </Tooltip>
            </div>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="密码"
            hasFeedback
            >
            <Input {...passwdProps} type="password" autoComplete="off"
              placeholder="新成员名称登录密码"
              />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="确认密码"
            hasFeedback
            >
            <Input {...rePasswdProps} type="password" autoComplete="off" placeholder="请再次输入密码确认" />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="手机"
            hasFeedback
            >
            <Input {...telProps} type="text" placeholder="新成员手机" />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="邮箱"
            hasFeedback
            >
            <Input {...emailProps} type="email" placeholder="新成员邮箱帐号" />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label=""
            >
            <Checkbox className="ant-checkbox-vertical" {...checkProps}>
              创建完成后, 密码帐户名发送至该邮箱
            </Checkbox>
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

CreateUserModal = createForm()(CreateUserModal)

export default CreateUserModal