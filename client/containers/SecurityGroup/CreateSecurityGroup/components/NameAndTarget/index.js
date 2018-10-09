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
import * as securityActions from '../../../../../actions/securityGroup'

const FormItem = Form.Item
const Option = Select.Option

class CreateNameAndTarget extends React.Component {

  componentDidMount() {
    const { getSecurityGroupList, cluster } = this.props
    getSecurityGroupList(cluster)
  }

  checkName = (rule, value, callback) => {
    const { isEdit, listData } = this.props
    !isEdit && listData.forEach(item => {
      if (item.name === value) {
        return callback('该安全组已存在，请修改名称')
      }
    })
    callback()
  }

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
          placeholder="请输入安全组名称，如放通某业务服务"
          style={{ width: 280 }}
          {...getFieldProps('name', {
            rules: [{
              required: true,
              message: '请输入安全组名称',
            }, {
              validator: this.checkName,
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

const mapStateToProps = ({
  entities: { current },
  securityGroup: { getSecurityGroupList: { data } },
}) => {
  const listData = []
  data && data.map(item => listData.push({
    name: item.metadata && item.metadata.annotations['policy-name'],
    key: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    listData,
  }
}

export default connect(mapStateToProps, {
  getSecurityGroupList: securityActions.getSecurityGroupList,
})(CreateNameAndTarget)
