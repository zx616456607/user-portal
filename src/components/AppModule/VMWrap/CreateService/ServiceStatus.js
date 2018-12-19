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
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse, Icon, InputNumber } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/serviceStatus.less'
const FormItem = Form.Item;
const ButtonGroup = Button.Group;

class ServiceStatus extends Component{

  checkAddr(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      callback()
    }
    scope.setState({
      address:value
    })
    callback()
  }
  checkInit(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      callback()
    }
    scope.setState({
      init:value
    })
    callback()
  }
  checkNomal(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      callback()
    }
    scope.setState({
      normal:value
    })
    callback()
  }
  checkInterval(rules,value,callback) {
    const { scope } = this.props;
    if (!value) {
      callback()
    }
    scope.setState({
      interval:value
    })
    callback()
  }
  render() {
    const { currentPacket, form, scope, port, new_port } = this.props
    const { getFieldProps } = form;
    let warHost = ''
    let serviceName = scope.props.form.getFieldValue('serviceName')
    if (currentPacket && currentPacket.fileType === 'war') {
      warHost = `http://${scope.state.host || ''}:${port || new_port || ''}${serviceName && serviceName !== 'ROOT' ? '/' + serviceName : ''}`
    }
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };
    const checkAddress = getFieldProps('checkAddress', {
      rules: [
        { required: true, message: "请输入检查地址" },
        { validator: this.checkAddr.bind(this)}
      ],
      initialValue: warHost ? warHost : ''
    });
    const initTimeout = getFieldProps('initTimeout', {
      initialValue: 10,
      rules: [
        { required: true, message: "请输入初始化超时" },
        { validator: this.checkInit.bind(this)}
      ],
    });
    const ruleTimeout = getFieldProps('ruleTimeout', {
      initialValue: 10,
      rules: [
        { required: true, message: "请输入常规检查超时" },
        { validator: this.checkNomal.bind(this)}
      ],
    });
    const intervalTimeout = getFieldProps('intervalTimeout', {
      initialValue: 10,
      rules: [
        { required: true, message: "请输入间隔检查超时" },
        { validator: this.checkInterval.bind(this)}
      ],
    });
    return(
      <div className="serviceStatus">
        <Form>
          <FormItem
            label="检查地址"
            {...formItemLayout}
          >
            <Input placeholder="例如：http://" size="large" {...checkAddress}/>
          </FormItem>
          <FormItem
            label="初始化超时"
            {...formItemLayout}
          >
            <InputNumber size="large" {...initTimeout} style={{width: '100%'}} min={0}/><span className="second">s</span>
          </FormItem>
          <FormItem
            label="常规检查超时"
            {...formItemLayout}
          >
            <InputNumber size="large" {...ruleTimeout} style={{width: '100%'}} min={0}/><span className="second">s</span>
          </FormItem>
          <FormItem
            label="间隔检查超时"
            {...formItemLayout}
          >
            <InputNumber size="large" {...intervalTimeout} style={{width: '100%'}} min={0}/><span className="second">s</span>
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

})(ServiceStatus)