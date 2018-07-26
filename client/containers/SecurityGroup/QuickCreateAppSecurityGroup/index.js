/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Isolated object
 *
 * v0.1 - 2018-07-25
 * @author lvjunfeng
 */

import React from 'react'
import './style/index.less'
import { connect } from 'react-redux'
import { Collapse, Row, Col, Form, Select, Button } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const Panel = Collapse.Panel

class SecyrityCollapse extends React.Component {
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldProps } = form
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="securityHeader">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="securityLeft">
            <div className="line"></div>
            <span className="title" style={{ paddingLeft: 8 }}>安全组</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="securityRight">
            <div className="desc">安全组 prompt </div>
          </Col>
        </Row>
      </div>
    )
    return <div id="securityGroup" >
      <Collapse>
        <Panel header={header}>
          <Row className="securityLine">
            <Col span={4}></Col>
            <Col span={20} className="lineRight">
              <Button
                type="ghost"
                onClick={this.loadData}>
                <i className="fa fa-refresh"/>
                刷新
              </Button>
              <Button type="primary" onClick={ this.newGroup }>
                新建安全组
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={4}></Col>
            <Col span={10}>
              <FormItem className="antdItem">
                <Select
                  multiple
                  size="large"
                  placeholder="选择安全组"
                  {...getFieldProps('netIsolate', {
                    rules: [{
                      required: true,
                      message: '请选择安全组',
                    }],
                    // initialValue: 'lucy',
                  })}
                >
                  <Option value="jack">jack</Option>
                  <Option value="lucy">lucy</Option>
                  <Option value="yiminghe">yiminghe</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </div>
  }
}
export default connect()(SecyrityCollapse)
