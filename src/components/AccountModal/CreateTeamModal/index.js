/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Create team modal
 *
 * v0.1 - 2016-12-01
 * @author Zhangpc
 */

import React from 'react'
import { Input, Modal, Form, Button, } from 'antd'
import { USERNAME_REG_EXP_NEW, ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'

const createForm = Form.create
const FormItem = Form.Item

let CreateTeamModal = React.createClass({
  getInitialState() {
    return {
      disabled: true,
    }
  },
  teamExists(rule, value, callback) {
    const _this = this
    this.setState({
      disabled: true
    })
    if (!value) {
      callback([new Error('请输入团队名')])
      return
    }
    const { checkTeamName } = this.props.funcs
    if (!USERNAME_REG_EXP_NEW.test(value)) {
      callback(new Error('以[a~z]开头，允许[0~9]、[-]，长度5~40个字符'))
      return
    }
    
    clearTimeout(this.teamExistsTimeout)
    this.teamExistsTimeout = setTimeout(() => {
      checkTeamName(value, {
        success: {
          func: (result) => {
            _this.setState({
              disabled: false
            })
            if (result.data) {
              _this.setState({
                disabled: true
              })
              callback(new Error('团队名称已被占用，请修改后重试'))
              return
            }
            callback()
          }
        },
        failed: {
          func: (err) => {
            _this.setState({
              disabled: true
            })
            callback(new Error('团队名校验失败'))
          }
        }
      })
    }, 0)
  },
  handleOk() {
    const { form, onSubmit, scope } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { name } = values
      let newTeam = {
        teamName: name,
      }
      onSubmit(newTeam)
      form.resetFields()
      scope.setState({
        visible: false,
      })
    })
  },
  handleCancel(e) {
    e.preventDefault()
    const { scope } = this.props
    scope.setState({
      visible: false,
    })
  },
  render() {
    const { form, visible } = this.props
    const { disabled } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.teamExists },
      ],
    })
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    }
    return (
      <Modal title="创建团队" visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
        wrapClassName="NewTeamForm"
        key="NewTeamForm"
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
        <div key='modalDiv'>
          <Form horizontal key='modalForm'>
            <FormItem
              {...formItemLayout}
              label="名称"
              hasFeedback
              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
              key='nameInputForm'
              >
              <Input key='nameInput' {...nameProps} autoComplete='off' placeholder="新团队名称" id="teamInput" type='text'/>
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
})

CreateTeamModal = createForm()(CreateTeamModal)

export default CreateTeamModal