/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Upsert endpoint component of replications
 *
 * v0.1 - 2017-11-27
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { Modal, Form, Input } from 'antd'
import './style/UpsertModal.less'

const FormItem = Form.Item

const UpsertModal = React.createClass({
  getInitialState() {
    return {
      readOnly: true,
    }
  },
  componentWillMount() {
    const { mode, currentRow, form } = this.props
    if (mode === 'edit') {
      const { name, endpoint, username, password } = currentRow
      form.setFieldsValue({ name, endpoint, username, password })
    }
  },
  propTypes: {
    mode: PropTypes.oneOf([ 'create', 'edit' ]),
    currentRow: PropTypes.object,
  },
  render() {
    const { mode, form, ...otherProps } = this.props
    const { getFieldProps } = this.props.form
    const { readOnly } = this.state
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    }
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入目标名' },
      ]
    })
    const endpointProps = getFieldProps('endpoint', {
      rules: [
        { required: true, message: '请输入目标 URL' },
      ]
    })
    const usernameProps = getFieldProps('username')
    const passwordProps = getFieldProps('password')
    return (
      <Modal
        title={mode === 'create' ? '添加目标' : '编辑目标'}
        wrapClassName="replications-upsert-modal"
        {...otherProps}
      >
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="目标名"
          >
            <Input {...nameProps} placeholder="请输入目标名" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="目标 URL"
          >
            <Input {...endpointProps} placeholder="请输入目标 URL" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="用户名"
          >
            <Input {...usernameProps} placeholder="请输入用户名" autoComplete="off" />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="密码"
          >
            <Input
              {...passwordProps}
              placeholder="请输入密码"
              type="password"
              autoComplete="new-password"
              readOnly={readOnly}
              onFocus={() => this.setState({ readOnly: false })}
              onBlur={() => this.setState({ readOnly: true })}
            />
          </FormItem>
        </Form>
      </Modal>
    )
  }
})

export default Form.create()(UpsertModal)
