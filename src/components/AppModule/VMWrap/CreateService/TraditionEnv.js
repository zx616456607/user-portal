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

class TraditionEnv extends Component{
  
  render() {
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };
    const envIP = getFieldProps('envIP', {
      rules: [
        { required: true, message: "请输入IP" }
      ],
    });
    const userName = getFieldProps('userName', {
      rules: [
        { required: true, message: "请输入名称" }
      ],
    });
    const password = getFieldProps('password', {
      rules: [
        { required: true, message: "请输入密码" }
      ],
    });
    return (
      <div className="traditionEnv">
        <Form>
          <Row>
            <Col offset={3}>
              <ButtonGroup size="large">
                <Button type="ghost">新环境</Button>
                <Button type="ghost">已导入环境</Button>
              </ButtonGroup>
            </Col>
          </Row>
          <FormItem
            label="传统环境IP"
            {...formItemLayout}
          >
            <Input placeholder="请输入已开通SSH登录的传统环境IP" size="large" {...envIP}/>
            <div><Icon type="question-circle-o" /> 传统环境一般指非容器环境（Linux的虚拟机、物理机等）</div>
          </FormItem>
          <FormItem
            label="环境登录账号"
            {...formItemLayout}
          >
            <Input placeholder="请输入传统环境登录账号" size="large" {...userName}/>
          </FormItem>
          <FormItem
            label="环境登录密码"
            {...formItemLayout}
          >
            <Input placeholder="请输入传统环境登录密码" size="large" {...password}/>
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

})(Form.create()(TraditionEnv))