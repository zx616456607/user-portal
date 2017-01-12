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
import { Form, Input, Button, Row, Col } from 'antd'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { changeUserInfo } from '../../../../../actions/user.js'
import NotificationHandler from '../../../../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let PasswordRow = React.createClass({
  getInitialState() {
    return {
      passBarShow: false, // 是否显示密码强度提示条
      rePassBarShow: false,
      passStrength: 'L', // 密码强度
      rePassStrength: 'L',
      oldPassword: ''
    }
  },
  renderPassStrengthBar(type) {
    const strength = type === 'pass' ? this.state.passStrength : this.state.rePassStrength
    const classSet = classNames({
      'ant-pwd-strength': true,
      'ant-pwd-strength-low': strength === 'L',
      'ant-pwd-strength-medium': strength === 'M',
      'ant-pwd-strength-high': strength === 'H'
    })
    const level = {
      L: '低',
      M: '中',
      H: '高'
    }

    return (
      <div>
        <ul className={classSet}>
          <li className="ant-pwd-strength-item ant-pwd-strength-item-1"></li>
          <li className="ant-pwd-strength-item ant-pwd-strength-item-2"></li>
          <li className="ant-pwd-strength-item ant-pwd-strength-item-3"></li>
          <span className="ant-form-text">
            {level[strength]}
          </span>
        </ul>
      </div>
    )
  },
  getPassStrenth(value, type) {
    if (value) {
      let strength
      // 密码强度的校验规则自定义，这里只是做个简单的示例
      if (value.length < 6) {
        strength = 'L'
      } else if (value.length <= 9) {
        strength = 'M'
      } else {
        strength = 'H'
      }
      if (type === 'pass') {
        this.setState({ passBarShow: true, passStrength: strength })
      } else {
        this.setState({ rePassBarShow: true, rePassStrength: strength })
      }
    } else {
      if (type === 'pass') {
        this.setState({ passBarShow: false })
      } else {
        this.setState({ rePassBarShow: false })
      }
    }
  },
  passwordExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入当前密码')])
      return
    }
    if (values.length < 3) {
      callback([new Error('帐户密码不少于3个字符')])
      return
    }
    if (values.length > 63) {
      callback([new Error('帐户密码字符不超过63个字符')])
      return
    }
    this.setState({
      oldPassword: values
    })
    callback()
    return
  },
  newPassword(rule, values, callback) {
    this.getPassStrenth(values, 'pass')
    if (!Boolean(values)) {
      callback([new Error('请输入新密码')])
      return
    }
    if (/^\d+$/.test(values)) {
        callback(new Error('密码不能为纯数字'))
        return
    }
    if (values.length < 3) {
      callback([new Error('帐户密码不少于3个字符')])
      return
    }
    if (values.length > 63) {
      callback([new Error('帐户密码字符不超过63个字符')])
      return
    }
    if(values === this.state.oldPassword) {
      callback([new Error('新密码不能和旧密码相同')])
      return
    }
    callback()
    return
  },
  againPasswordExists(rule, values, callback) {
    const form = this.props.form
    this.getPassStrenth(values, 'newPass')

    if (!Boolean(values)) {
      callback([new Error('请再次输入新密码')])
      return
    }

    if (values && values !== form.getFieldValue('newpassword')) {
      callback('两次输入密码不一致！')
      return
    } else {
      callback()
      return
    }
  },
  handPsd(e) {
    e.preventDefault()
    const {form, changeUserInfo } = this.props
		const scope = this.props.scope
    form.validateFields(['password', 'newpassword', 'againpassword'], (errors, values) => {
      if (errors) {
        return errors
      }
      const notification = new NotificationHandler()
      notification.spin('修改密码中')
      changeUserInfo({
        password: values.password,
        newPassword: values.newpassword
      }, {
        success: {
          func: () => {
            notification.close()
            notification.success('修改密码成功')
            scope.setState({
              editPsd: false
            })
          }
        },
        failed: {
          func: (result) => {
            notification.close()
            if(result.message.message == 'not authorized'){
              notification.error('密码输入不正确')
              return
            }
            notification.error(result.message.message)
          }
        }
      })
    })
  },
  render() {
    const { getFieldProps } = this.props.form
    const passwordProps = getFieldProps('password', {
      rules: [
        { whitespace: true },
        { validator: this.passwordExists }
      ]
    })
    const newPasswordProps = getFieldProps('newpassword', {
      rules: [
        { whitespace: true },
        { validator: this.newPassword }
      ]
    })
    const againPassword = getFieldProps('againpassword', {
      rules: [
        { whitespace: true },
        { validator: this.againPasswordExists }
      ]
    })
    const parentScope = this.props.scope
    return (
      <Form horizontal form={this.props.form}>
        <span className="key" style={{float: 'left'}}>密码</span>
        <div className="editList" style={{ width: '400px' }}>
          <Row>
            <Col span="12">
              <FormItem>
                <Input size="large" type="password" {...passwordProps} placeholder="当前密码" style={{ marginTop: '10px' }} autoComplete="off" />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem>
                <Input size="large" type="password" {...newPasswordProps} placeholder="输入新密码" autoComplete="off" />
              </FormItem>
            </Col>
            <Col span="12">
              {this.state.passBarShow ? this.renderPassStrengthBar('pass') : null}
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem>
                <Input size="large" type="password" {...againPassword} placeholder="再输一次新密码" />
              </FormItem>
            </Col>
            <Col span="12">
              {this.state.rePassBarShow ? this.renderPassStrengthBar('newPass') : null}
            </Col>
          </Row>
          <Button size="large" onClick={() => parentScope.closeEdit('editPsd')}>取消</Button>
          <Button size="large" type="primary" onClick={(e) => this.handPsd(e)} style={{ marginLeft: '10px' }}>确定</Button>
        </div>
      </Form>
    )
  }
})

PasswordRow = createForm()(PasswordRow)
function mapStateToProps(state, props) {
		return props
}

export default connect(mapStateToProps, {
  changeUserInfo
})(PasswordRow)
