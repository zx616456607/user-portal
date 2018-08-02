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
    const { form, formItemLayout, serverList } = this.props
    const { getFieldProps } = form
    const optionList = serverList.map((item, k) => {
      return <Option value={item} key={k}>{item}</Option>
    })
    return <div className="nameAndeTarget">
      <FormItem
        label="安全组名称"
        {...formItemLayout}
      >
        <Input
          placeholder="请输入安全组名称，如 禁止外访 A 地图 API"
          style={{ width: 280 }}
          {...getFieldProps('name', {
            rules: [{
              required: true,
              message: '请输入安全组名称',
            }],
          })}
        />
      </FormItem>
      <FormItem
        label="隔离对象"
        {...formItemLayout}
      >
        <Select id="select" size="large"
          multiple
          style={{ width: 280 }}
          placeholder="请选择服务"
          {...getFieldProps('target', {
            rules: [{
              required: true,
              message: '请选择服务',
            }],
            // initialValue: 'lucy',
          })}
        >
          {optionList}
        </Select>
      </FormItem>
    </div>
  }
}
export default connect()(CreateNameAndTarget)
