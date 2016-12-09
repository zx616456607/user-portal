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
import { Input, Modal, Form, } from 'antd'
import { USERNAME_REG_EXP } from '../../../constants'

const createForm = Form.create
const FormItem = Form.Item

let CreateSpaceModal = React.createClass({
  spaceExists(rule, value, callback) {
    if (!value) {
      callback([new Error('请输入空间名')])
      return
    }
    const { teamID, funcs } = this.props
    const { checkTeamSpaceName } = funcs
    setTimeout(() => {
      if (!USERNAME_REG_EXP.test(value)) {
        callback([new Error('抱歉，空间名不合法。')])
        return
      }
      checkTeamSpaceName(teamID, value, {
        success: {
          func: (result) => {
            if (result.data) {
              callback([new Error('空间名已经存在')])
              return
            }
            callback()
          }
        },
        failed: {
          func: (err) => {
            callback([new Error('空间名校验失败')])
          }
        }
      })
    }, 800)
  },
  handleOk() {
    const { form, onSubmit, scope } = this.props
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { name, description } = values
      let newSpace = {
        spaceName: name,
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
    const { getFieldProps, getFieldError, isFieldValidating } = form
    const nameProps = getFieldProps('name', {
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
        width="463px">
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