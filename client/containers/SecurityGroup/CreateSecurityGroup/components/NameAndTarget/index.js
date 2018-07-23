/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Create Name And Target
 *
 * v0.1 - 2018-07-23
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Form, Input, Select } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class CreateNameAndTarget extends React.Component {

  render() {
    const { form, formItemLayout } = this.props
    const { getFieldProps } = form
    return <div className="createSecurityPage">
      <FormItem
        label="策略名称"
        {...formItemLayout}
      >
        <Input placeholder="请输入..."
          style={{ width: 280 }}
          {...getFieldProps('name', {
            rules: [{
              required: true,
              message: '请输入...',
            }],
          })}
        />
      </FormItem>
      <FormItem
        label="隔离对象"
        {...formItemLayout}
      >
        <Select id="select" size="large"
          style={{ width: 280 }}
          // onChange={handleSelectChange}
          {...getFieldProps('target', {
            rules: [{
              required: true,
              message: '请选择隔离对象',
            }],
            initialValue: 'lucy',
          })}
        >
          <Option value="jack">jack</Option>
          <Option value="lucy">lucy</Option>
          <Option value="yiminghe">yiminghe</Option>
        </Select>
      </FormItem>
    </div>
  }
}
export default connect()(CreateNameAndTarget)
