/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Create space modal
 *
 * v0.1 - 2016-12-01
 * @author Zhangpc
 */

import React from 'react'
import { Input, Modal, Form, Button, } from 'antd'
import { USERNAME_REG_EXP_NEW } from '../../../constants'

const createForm = Form.create
const FormItem = Form.Item

let CreateSpaceModal = React.createClass({
  getInitialState() {
    return {
      disabled: false,
    }
  },
  spaceExists(rule, value, callback) {
    const _this = this
    if (!value) {
      callback([new Error('请输入空间名')])
      return
    }
    const { teamID, funcs } = this.props
    const { checkTeamSpaceName } = funcs
    if (!USERNAME_REG_EXP_NEW.test(value)) {
      callback([new Error('以[a~z]开头，允许[0~9]、[-]，且以小写英文和数字结尾')])
      return
    }
    // Disabled submit button when checkTeamSpaceName
    this.setState({
      disabled: true
    })
    checkTeamSpaceName(teamID, value, {
      success: {
        func: (result) => {
          _this.setState({
            disabled: false
          })
          if (result.data) {
            callback([new Error('空间名已经存在')])
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
          callback([new Error('空间名校验失败')])
        }
      }
    })
  },
  handleOk() {
    const { form, onSubmit, scope } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { spacename, description } = values
      let newSpace = {
        spaceName: spacename,
        description,
      }
      onSubmit(newSpace)
      form.resetFields()
      scope.setState({
        createSpaceModalVisible: false,
      })
    })
  },
  handleCancel(e) {
    e.preventDefault()
    const { scope } = this.props
    scope.setState({
      createSpaceModalVisible: false,
    })
  },
  render() {
    const { form, visible } = this.props
    const { disabled } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const nameProps = getFieldProps('spacename', {
      rules: [
        { validator: this.spaceExists },
      ],
    })
    const descriptionProps = getFieldProps('description')
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    }
    return (
      <Modal title="创建新空间" visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
        wrapClassName="addSpaceModal"
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
            <Input {...nameProps} placeholder="新空间名称" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="备注">
            <Input type="textarea" {...descriptionProps} placeholder="备注" />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

CreateSpaceModal = createForm()(CreateSpaceModal)

export default CreateSpaceModal