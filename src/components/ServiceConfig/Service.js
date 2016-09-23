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
import { Row,Col,Modal,Button,Icon,Collapse,Input } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/ServiceConfig.less'
import QueueAnim from 'rc-queue-anim'
import CollapseHeader from './ServiceCollapseHeader'
import CollapseContainer from  './ServiceCollapseContainer'

const data = [
  {
    groupId : 'my_ConfigGroup',
    
  },
]
const Panel = Collapse.Panel

class Service extends Component{
  constructor(props){
    super(props)
    this.createConfigGroup = this.createConfigGroup.bind(this)
    this.state = {
      createConfigGroup: false,
    }
  }
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
              <Input type="text"/>
            </div>
          </Modal>
          {/*创建配置组-弹出层-end*/}
          {/*折叠面板-start*/}
          <Collapse defaultActiveKey={['1']}>
            <Panel header={<CollapseHeader/>} key="1">
              <CollapseContainer />
            </Panel>
            <Panel header={<CollapseHeader/>} key="2">
              <CollapseContainer />
            </Panel>
            <Panel header={<CollapseHeader/>} key="3">
              <CollapseContainer />
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



