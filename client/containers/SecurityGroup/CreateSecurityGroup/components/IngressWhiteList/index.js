/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Ingress White List
 *
 * v0.1 - 2018-07-23
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Icon } from 'antd'
// Form, Select
// const FormItem = Form.Item
// const Option = Select.Option

class IngressWhiteList extends React.Component {

  render() {
    // const { form, formItemLayout } = this.props
    // const { getFieldProps } = form
    return <div className="createSecurityPage">
      <Row className="ingress">
        <Col span={4}>ingress 来源白名单</Col>
        <Col onClick={this.add}>
          <Icon type="plus-circle-o" />
          添加一个来源
        </Col>
        {/* <Select id="select" size="large" defaultValue="lucy"
          style={{ width: 200 }}
          // onChange={handleSelectChange}
          {...getFieldProps('ingress', {
            rules: [{
              required: true, message: '请选择'
            }],
          })}
        >
          <Option value="jack">jack</Option>
          <Option value="lucy">lucy</Option>
          <Option value="disabled" disabled>disabled</Option>
          <Option value="yiminghe">yiminghe</Option>
        </Select> */}
      </Row>
    </div>
  }
}
export default connect()(IngressWhiteList)
