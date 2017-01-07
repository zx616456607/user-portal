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
import { changeUserInfo } from '../../../../../actions/user'
import { loadLoginUserDetail } from '../../../../../actions/entities'
import NotificationHandler from '../../../../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let EmailRow = React.createClass({
  oldEmailExists(rule, values, callback) {
    if(!Boolean(values)) {
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
    callback()
    return
  },
  newEmailExists(rule, values, callback) {
    if(!Boolean(values)) {
      callback([new Error('请输入新邮箱')])
      return
    }
    if (values.indexOf('@') < 0) {
      callback([new Error('请输入正确的邮箱')])
      return
    }
    if(this.props.email === values) {
      callback([new Error('新邮箱不能和旧邮箱相同')])
      return
    }
    callback()
    return
  },
  handEmail(e) {
    e.preventDefault()
    const { form } = this.props
    const { changeUserInfo, loadLoginUserDetail } = this.props
    const scope = this.props.scope
    const oldEmail = this.props.email
    form.validateFields(['emailPassword', 'newEmail'], (errors, values) => {
      if (!!errors) {
        return errors
      }
      const notification = new NotificationHandler()
      notification.spin('修改邮箱中')
      changeUserInfo({
        password: values.emailPassword,
        newEmail: values.newEmail,
        oldEmail: oldEmail
      }, {
        success: {
          func: () => {
            notification.close()
            notification.success('修改邮箱成功')
            scope.setState({
              editEmail: false
            })
            loadLoginUserDetail()
          },
          isAsync: true
        },
        failed: {
          func: (result) => {
            notification.close()
            if(result.message.message == 'not authorized'){
              notification.error('密码输入不正确')
              return
  	        }
            notification.close()
            notification.error(result.message.message)
          }
        }
      })
    })
  },
  render () {
    const {getFieldProps} = this.props.form
    const parentScope = this.props.scope
    const emailPassword = getFieldProps('emailPassword', {
      rules: [
        { whitespace: true, message:'请输入当前帐户密码'},
        { validator: this.oldEmailExists }
      ]
    })
    const newEmailProps = getFieldProps('newEmail', {
      rules: [
        { whitespace: true, message:'请输入新邮箱'},
        { validator: this.newEmailExists }
      ]
    })
    return (
      <Form horizontal form={this.props.form}>
        <span className="key" style={{float: 'left'}}>邮箱</span>
        <div className="editList">
          <FormItem>
            <Input type="password" size="large" {...emailPassword} placeholder="当前帐户密码" />
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

function mapStateToProps(state, props) {
		return props
}
EmailRow = createForm()(EmailRow)

export default connect(mapStateToProps, {
  changeUserInfo,
  loadLoginUserDetail
})(EmailRow)
