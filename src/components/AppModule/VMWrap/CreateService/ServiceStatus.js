/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: create service
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React,{ Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse, Icon  } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/traditionEnv.less'
const FormItem = Form.Item;
const ButtonGroup = Button.Group;

class ServiceStatus extends Component{
  
  render() {
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };
    const checkAddress = getFieldProps('checkAddress', {
      rules: [
        { required: true, message: "请输入IP" }
      ],
    });
    const initTimeout = getFieldProps('initTimeout', {
      rules: [
        { required: true, message: "请输入名称" }
      ],
    });
    const ruleTimeout = getFieldProps('ruleTimeout', {
      rules: [
        { required: true, message: "请输入密码" }
      ],
    });
    const intervalTimeout = getFieldProps('intervalTimeout', {
      rules: [
        { required: true, message: "请输入密码" }
      ],
    });
    return(
      <div className="serviceStatus">
        <Form>
          <FormItem
            label="检查地址"
            {...formItemLayout}
          >
            <Input placeholder="例如：/var/log" size="large" {...checkAddress}/>
          </FormItem>
          <FormItem
            label="初始化超时"
            {...formItemLayout}
          >
            <Input size="large" {...initTimeout}/>
          </FormItem>
          <FormItem
            label="常规检查超时"
            {...formItemLayout}
          >
            <Input size="large" {...ruleTimeout}/>
          </FormItem>
          <FormItem
            label="间隔检查超时"
            {...formItemLayout}
          >
            <Input size="large" {...intervalTimeout}/>
          </FormItem>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  
  return {
  
  }
}
export default connect(mapStateToProps, {

})(Form.create()(ServiceStatus))