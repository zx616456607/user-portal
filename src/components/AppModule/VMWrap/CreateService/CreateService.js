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

class VMServiceCreate extends React.Component {
  
  onChange(key) {
  
  }
  renderPanelHeader(text) {
    return (
      <div className="headerBg">
        <i/>{text}
      </div>
    )
  }
  render() {
    const { getFieldProps } = this.props.form;
    return (
      <QueueAnim
        id="vmServiceCreate"
        type='right'
      >
        <div className="vmServiceCreate">
          <Card>
            <Form>
              <FormItem
                label="服务名称"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 9 }}
              >
                <Input {...getFieldProps('serviceName')} placeholder="请输入服务名称"/>
              </FormItem>
            </Form>
            <Collapse defaultActiveKey={['env','status','packet']} onChange={this.onChange}>
              <Panel header={this.renderPanelHeader('传统环境')} key="env">
                <TraditionEnv/>
              </Panel>
              <Panel header={this.renderPanelHeader('服务状态')} key="status">
                <ServiceStatus/>
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

})(Form.create()(VMServiceCreate))