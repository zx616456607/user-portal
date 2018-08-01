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
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../constants'
import { teamNameValidation } from '../../../common/naming_validation'
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
    const msg = teamNameValidation(value)
    if (msg !== 'success') {
      return callback(msg)
    }
    const { checkTeamName } = this.props.funcs
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
          },
          isAsync: true
        },
        failed: {
          func: (err) => {
            _this.setState({
              disabled: true
            })
            return callback(new Error('团队名校验失败'))
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  },
  handleOk() {
    const { form, onSubmit, scope } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { name, comment } = values
      let newTeam = {
        teamName: name,
        description: comment
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
    const { scope, form} = this.props
    scope.setState({
      visible: false,
    })
    form.resetFields()
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
    const commentProps = getFieldProps('comment', {

    })
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    }
    return (
      <Modal title="创建团队" visible={visible}
        onCancel={this.handleCancel}
        closable={true}
        wrapClassName="NewTeamForm"
        key="NewTeamForm"
        width={510}
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
            <FormItem
              {...formItemLayout}
              label="备注"
              key='commentInputForm'
            >
              <Input key='nameInput' {...commentProps} id="commentInput" type='textarea'/>
            </FormItem>
          </Form>
        </div>
      </Modal>
    )
  }
})

CreateTeamModal = createForm()(CreateTeamModal)

export default CreateTeamModal
