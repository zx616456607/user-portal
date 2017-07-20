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

import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Card, Row, Col, Form, Input, Button, Checkbox, Collapse  } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/createService.less'
import TraditionEnv from './TraditionEnv'
import ServiceStatus from './ServiceStatus'
import SelectPacket from './SelectPacket'
const FormItem = Form.Item;
const Panel = Collapse.Panel;
import { ASYNC_VALIDATOR_TIMEOUT } from '../../../../constants'
import { checkServiceExists } from '../../../../actions/vm_wrap'

class VMServiceCreate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      vmInfoID:undefined,
      host:undefined,
      account:undefined,
      password:undefined,
      address:undefined,
      init:undefined,
      normal:undefined,
      interval:undefined,
      packages:[],
      env:[]
    }
  }
  
  onChange(key) {
  
  }
  renderPanelHeader(text) {
    return (
      <div className="headerBg">
        <i/>{text}
      </div>
    )
  }
  serviceNameCheck(rules,value,callback) {
    const { checkServiceExists } = this.props;
    let newValue = value.trim()
    if (!Boolean(newValue)) {
      callback(new Error('请输入名称'))
      return
    }
    if (newValue.length < 1 || newValue.length > 21) {
      callback(new Error('请输入1~21个字符'))
      return
    }
    clearTimeout(this.projectNameCheckTimeout)
    this.projectNameCheckTimeout = setTimeout(()=>{
      checkServiceExists(value,{},{
        success: {
          func: (res) => {
            callback()
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            return callback(new Error('该应用名称已经存在'))
          },
          isAsync:true
        }
      })
    },ASYNC_VALIDATOR_TIMEOUT)
  }
  render() {
    const { getFieldProps, isFieldValidating, getFieldError } = this.props.form;
    return (
      <QueueAnim
        id="vmServiceCreate"
        type='right'
      >
        <div className="vmServiceCreate">
          <Card>
            <Form>
              <FormItem
                label="应用名称"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 9 }}
                hasFeedback
                help={isFieldValidating('serviceName') ? '校验中...' : (getFieldError('serviceName') || []).join(', ')}
              >
                <Input {...getFieldProps('serviceName',{
                  rules: [
                    { validator: this.serviceNameCheck.bind(this)}
                  ]
                })} placeholder="请输入应用名称"/>
              </FormItem>
            </Form>
            <Collapse defaultActiveKey={['env','status','packet']} onChange={this.onChange}>
              <Panel header={this.renderPanelHeader('传统环境')} key="env">
                <TraditionEnv scope={this}/>
              </Panel>
              <Panel header={this.renderPanelHeader('服务状态')} key="status">
                <ServiceStatus scope={this}/>
              </Panel>
              <Panel header={this.renderPanelHeader('选择部署包')} key="packet">
                <SelectPacket/>
              </Panel>
            </Collapse>
            <div className="btnBox clearfix">
              <Button type="primary" size="large" className="pull-right">创建</Button>
            </div>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  
  return {
  
  }
}
export default connect(mapStateToProps, {
  checkServiceExists
})(Form.create()(VMServiceCreate))