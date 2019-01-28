/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create user modal
 *
 * v0.1 - 2017-6-23
 * @author XuLongcheng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Input, Modal, Form, Radio, Checkbox, Tooltip, Icon, Button, Select } from 'antd'
import { USERNAME_REG_EXP_NEW, ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import {
  PHONE_REGEX, ROLE_SYS_ADMIN, ROLE_USER, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN, CREATE_PROJECTS_ROLE_ID, CREATE_TEAMS_ROLE_ID,
} from '../../../../constants'
import { serviceNameCheck } from '../../../common/naming_validation'
const Option = Select.Option
const createForm = Form.create
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

let CreateUserModal = React.createClass({
  getInitialState() {
    return {
      disabled: false
    }
  },
  componentDidMount() {
    setTimeout(function () {
      document.getElementById('newUser').focus()
    }, 500);
  },
  userExists(rule, value, callback) {
    const _this = this
    const msg = serviceNameCheck(value, '用户名')
    if (msg !== 'success') {
      return callback(msg)
    }
    const { checkUserName } = this.props.funcs
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
              callback([new Error('该名称已在成员列表中存在')])
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
    const { validateFields } = this.props.form
    if (!value) {
      callback([new Error('请填写密码')])
      return
    }
    if (value.length < 6 || value.length > 16) {
      callback([new Error('长度为6~16个字符')])
      return
    }
    if (/^[^0-9]+$/.test(value) || /^[^a-zA-Z]+$/.test(value)) {
      callback([new Error('密码必须包含数字和字母，长度为6~16个字符')])
      return
    }
    const reg = new RegExp("^([a-zA-Z0-9]|[~!@#$%^&*()_+=\\-`{}|\\[\\]\\\\;':\",./<>?]){6,16}$")
    if(!reg.test(value)){
      callback([new Error('密码只能输入数字、字母和标点符号，长度为6~16个字符')])
      return
    }
    if (value) {
      validateFields(['rePasswd'], { force: true });
    }
    callback()
  },
  checkPass2(rule, value, callback) {
    const { getFieldValue, getFieldError } = this.props.form;
    const pwdError = getFieldError('passwd');
    if (!Boolean(value)) {
      callback('请再次输入密码！')
      return
    }
    if(Boolean(pwdError)) {
      callback([new Error(pwdError[0])]);
      return
    }
    if (value && value !== getFieldValue('passwd')) {
      callback('两次输入密码不一致！')
      return
    }
    callback()
  },
  telExists(rule, value, callback) {
    if (!PHONE_REGEX.test(value)) {
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
      const { name, passwd, email, tel, check, role, authority, resetPassword } = values
      let newUser = {
        userName: name,
        password: passwd,
        email: email,
        phone: tel,
        sendEmail: check,
        role: parseInt(role)+1,
        authority,
        resetPassword,
      }
      onSubmit(newUser)
    })
  },
  handleCancel(e) {
    const { scope, form } = this.props
    if(scope.state.manageRange) {
      scope.setState({
        manageRange: false,
      })
      return
    }
    e.preventDefault()
    form.resetFields()
    scope.setState({
      visible: false,
    })
  },
  render() {
    const { form, visible, loginUser, confirmLoading } = this.props
    const { disabled } = this.state
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue, setFieldsValue } = form
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.userExists },
      ],
    })
    const telProps = getFieldProps('tel', {
      validate: [{
        rules: [
          { whitespace: true },
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
        { validator: this.checkPass },
      ],
    })
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{ whitespace: true },
        {
          validator: this.checkPass2,
        }],
    })
    const resetPasswdProps = getFieldProps('resetPassword', {
      valuePropName: 'checked',
    })
    const checkProps = getFieldProps('check', {
      valuePropName: 'checked',
    })
    const roleProps = getFieldProps('role', {
      initialValue: ROLE_USER,
      onChange: e => {
        const value = e.target.value
        let authority = []
        if (value === ROLE_PLATFORM_ADMIN || value === ROLE_BASE_ADMIN) {
          authority = [ CREATE_PROJECTS_ROLE_ID, CREATE_TEAMS_ROLE_ID ]
        }
        setFieldsValue({
          authority,
        })
      }
    })
    const authorityProps = getFieldProps('authority')
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    }
    return (
      <Modal title="创建新成员" visible={visible}
             style={{ top: 30 }}
             onOk={this.handleOk} onCancel={this.handleCancel}
             wrapClassName="NewMemberForm"
             width="500px" maskClosable={false}
             footer={[
               <Button
                 key="back"
                 type="ghost"
                 size="large"
                 onClick={this.handleCancel}>
                 取 消
               </Button>,
               <Button
                 key="submit"
                 type="primary"
                 size="large"
                 disabled={disabled}
                 onClick={this.handleOk}
                 loading={confirmLoading}
               >
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
            {/*   not browser autoComplete    */}
            <Input type="text" id="autoname" style={{visibility: 'hidden', opacity:0,position:'absolute'}} />
            <Input type="password" id="autopassword" style={{visibility: 'hidden', opacity:0,position:'absolute'}} />

            <Input {...nameProps} placeholder="新成员名称" id="newUser"/>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="类型"
          >
            <Radio.Group {...roleProps} defaultValue="0">
              <Radio key={ROLE_USER} value={ROLE_USER}>普通成员</Radio>
              {
                loginUser.role === ROLE_PLATFORM_ADMIN?
                  ""
                  :
                    <Radio key={ROLE_PLATFORM_ADMIN} value={ROLE_PLATFORM_ADMIN}>平台管理员
                      <Tooltip title="点击查看平台管理员权限">
                        <Icon type="question-circle-o" className='lbgroup_icon' style={{ color:'rgb(45,183,245)', marginLeft: 5, cursor: 'pointer' }} onClick={e => {
                          e.preventDefault()
                          this.props.scope.showManageRange(ROLE_PLATFORM_ADMIN)}}/>
                      </Tooltip>
                    </Radio>
              }
              {
                loginUser.role === ROLE_PLATFORM_ADMIN?
                  ""
                  :

                    <Radio key={ROLE_BASE_ADMIN} value={ROLE_BASE_ADMIN}>
                      基础设施管理员
                      <Tooltip title="点击查看基础设施管理员权限">
                        <Icon type="question-circle-o" className='lbgroup_icon' style={{ color:'rgb(45,183,245)', marginLeft: 5, cursor: 'pointer' }} onClick={e  => {
                          e.preventDefault()
                          this.props.scope.showManageRange(ROLE_BASE_ADMIN)}
                        }/>
                      </Tooltip>

                    </Radio>
              }
            </Radio.Group>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="权限管理"
          >
            <CheckboxGroup
              {...authorityProps}
              disabled={getFieldValue('role') === ROLE_PLATFORM_ADMIN || getFieldValue('role') === ROLE_BASE_ADMIN}
              options={[
                { label: '可创建项目', value: CREATE_PROJECTS_ROLE_ID },
                { label: '可创建团队', value: CREATE_TEAMS_ROLE_ID },
              ]}
            />
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
            label="需要重置密码"
          >
            <Checkbox {...resetPasswdProps}>用户必须在首次登录时创建新密码</Checkbox>
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

          {
            loginUser.emailConfiged && (
              <FormItem
                {...formItemLayout}
                label="需要发送密码"
              >
                <Checkbox  {...checkProps}>
                  创建完成后，密码帐户名发送至该邮箱
                </Checkbox>
              </FormItem>
            )
          }
        </Form>
      </Modal>
    )
  }
})

CreateUserModal = createForm()(CreateUserModal)

function mapStateToProps(state, props) {
  return {
    loginUser: state.entities.loginUser.info,
  }
}
export default connect(mapStateToProps, {
  //
})(CreateUserModal)
