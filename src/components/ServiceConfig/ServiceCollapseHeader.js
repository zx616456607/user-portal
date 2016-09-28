/**
 *
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/23
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Row,Col,Modal,Button,Icon,Checkbox,Menu,Dropdown,Input } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

function handleMenuClick() {
  console.log('delete !');
}
const menu = (
  <Menu onClick={() => handleMenuClick()} mode="vertical">
    <Menu.Item key="1">删除配置组</Menu.Item>
  </Menu>
);
const ButtonGroup = Button.Group

class CollapseHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createConfigFile: false
    }
    this.createConfigFile = this.createConfigFile.bind(this)
    this.handleDropdown = this.handleDropdown.bind(this)
  }
  createConfigFile(e,createConfigFile){
    this.setState({createConfigFile})
    e.stopPropagation()
  }
  handleDropdown(e) {
    e.stopPropagation()
  }
  render(){
    const {collapseHeader} = this.props
    return (
      <Row>
        <Col className="group-name" span="6">
          <Checkbox onClick={(e) => this.handleDropdown(e)}></Checkbox>
          <Icon type="folder-open" />
          <Icon type="folder" />
          <span>{collapseHeader.groupName}</span>
        </Col>
        <Col span="6">
          配置文件 &nbsp;
          {collapseHeader.configFile.length}个
        </Col>
        <Col span="6">
          创建时间&nbsp;&nbsp;{collapseHeader.date}
        </Col>
        <Col span="6">
          <ButtonGroup>
            <Button type="ghost" onClick={(e) => this.createConfigFile(e,true)}>
              <Icon type="plus" style={{marginRight: '5px'}}/>配置文件
            </Button>
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="ghost" onClick={(e) => this.handleDropdown(e)}>
                <Icon type="down" />
              </Button>
            </Dropdown>
          </ButtonGroup>
          {/*添加配置文件-弹出层-start*/}
          <Modal
            title="添加配置文件"
            wrapClassName="configFile-create-modal"
            visible={this.state.createConfigFile}
            onOk={() => this.createConfigFile(false)}
            onCancel={() => this.createConfigFile(false)}
          >
            <div className="configFile-inf">
              <p className="configFile-tip" style={{color: "#16a3ea"}}>
                <Icon type="info-circle-o" style={{marginRight: "10px"}}/>
                即将保存一个配置文件 , 您可以在创建应用 → 添加服务时 , 关联使用该配置
              </p>
              <span style={{float: "left", marginRight: "16px"}}>名称 : </span>
              <Input type="text" className="configName"/>
              <div style={{ margin: '24px 0' }} />
              <span style={{float: "left", marginRight: "16px"}}>内容 : </span>
              <Input type="textarea" />
            </div>
          </Modal>
          {/*添加配置文件-弹出层-end*/}
        </Col>
      </Row>
    )
  }
}

CollapseHeader.propTypes = {
  collapseHeader: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

export default injectIntl(CollapseHeader, {
  withRef: true,
})
