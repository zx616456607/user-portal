/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/22
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Row, Col, Modal, Button, Icon, Collapse, Checkbox,Menu, Dropdown,Timeline } from 'antd'
//import { Checkbox,Card,Menu,Dropdown,Button,Icon ,Modal ,Input, Slider, InputNumber, Row, Col} from 'antd'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/ServiceConfig.less'
import QueueAnim from 'rc-queue-anim'

const Panel = Collapse.Panel
const data = [
  {
    groupId : 'my_ConfigGroup',
    
  },
]
//折叠面板

//折叠面板-头部
const menu = (
  <Menu>
    <Menu.Item key="1">删除配置组</Menu.Item>
  </Menu>
);
let CollapseHeader = React.createClass({
  propTypes: {
    
  },
  render: function () {
    return (
      <Row>
        <Col className="group-name" span="6">
          <Checkbox></Checkbox>
          <Icon type="folder-open" />
          <span>my_ConfigGroup</span>
        </Col>
        <Col span="6">
          配置文件 &nbsp;
          3个
        </Col>
        <Col span="6">
          创建时间&nbsp;&nbsp;2016-09-12&nbsp;15:&nbsp;12:&nbsp;30
        </Col>
        <Col span="6">
          <Dropdown.Button overlay={menu} trigger={['click']} type="ghost">
            <Icon type="plus"/>
            配置文件
          </Dropdown.Button>
        </Col>
      </Row>
    )
  }
})
//折叠面板内容
let CollapseContainer = React.createClass({
  propTypes: {
    
  },
  render: function () {
    return (
      <Row className="file-list">
        <Timeline>
          <Timeline.Item>
            <ConfigFile />
          </Timeline.Item>
          <Timeline.Item>
            <ConfigFile />
          </Timeline.Item>
          <Timeline.Item>
            <ConfigFile />
          </Timeline.Item>
        </Timeline>
        
      </Row>
    )
  }
})
//config-flie
let ConfigFile = React.createClass({
  propTypes: {
    
  },
  render: function () {
    return (
      <Row className="file-item">
        <div className="line"></div>
        <table>
          <tr>
            <td>my_config_file1</td>
            <td>my_config_file1</td>
            <td>my_config_file1</td>
            <td>my_config_file1</td>
            <td>my_config_file1</td>
            <td>my_config_file1</td>
            <td>my_config_file1</td>
          </tr>
        </table>
      </Row>
    )
  }
})
class Service extends Component{
  constructor(props){
    super(props)
    this.createConfigGroup = this.createConfigGroup.bind(this)
    this.state = {
      createConfigGroup: false,
    }
  }
  //创建配置组
  createConfigGroup(createConfigGroup) {
    this.setState({ createConfigGroup });
  }

    
  
  render(){
    return (
      <QueueAnim className ="Service"  type = "right">
        <div id="Service" key="Service">
          <Button type="primary" onClick={() => this.createConfigGroup(true)} size="large">
            <Icon type="plus" />
            创建配置组
          </Button>
          <Button size="large" style={{marginLeft:"12px"}}>
            <Icon type="delete" />
            删除
          </Button>
          {/*创建配置组-弹出层-start*/}
          <Modal
            title="创建配置组"
            wrapClassName="server-create-modal"
            visible={this.state.createConfigGroup}
            onOk={() => this.createConfigGroup(false)}
            onCancel={() => this.createConfigGroup(false)}
          >
            <div className="create-conf-g">
              <span>名称 : </span>
              <input type="text"/>
            </div>
          </Modal>
          {/*创建配置组-弹出层-end*/}
          {/*折叠面板-start*/}
          <Collapse defaultActiveKey={['1']}>
            <Panel header={<CollapseHeader/>} key="1">
              <CollapseContainer />
            </Panel>
            <Panel header="This is panel header 2" key="2">
              <p></p>
            </Panel>
            <Panel header="This is panel header 3" key="3">
              <p></p>
            </Panel>
          </Collapse>
          {/*折叠面板-end*/}
        </div>
      </QueueAnim>
    )
  }
}


Service.propTypes = {
  intl: PropTypes.object.isRequired
}
export default injectIntl(Service,{
  withRef: true
})



