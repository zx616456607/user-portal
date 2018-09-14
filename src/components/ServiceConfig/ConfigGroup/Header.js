/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * config group: header
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import {
  Menu, Row, Col, Icon, Button, Dropdown, Checkbox,
} from 'antd'
import { calcuDate } from '../../../common/tools'

const ButtonGroup = Button.Group

export default class ConfigGroupHeader extends React.Component {
  handleMenuClick = name => {
    const { removeSecrets, setCheckedList } = this.props
    setCheckedList([ name ], removeSecrets)
  }

  stopPropagation = e => e.stopPropagation()

  handleCheckedChange = (name, e) => {
    const { setCheckedList, checkedList } = this.props
    const { checked } = e.target
    let newCheckedList = []
    if (checked) {
      newCheckedList = checkedList.concat([ name ])
    } else {
      newCheckedList = checkedList.filter(item => item !== name)
    }
    setCheckedList(newCheckedList)
  }

  render() {
    const {
      group, checkedList = [], openCreateConfigFileModal
    } = this.props
    let { name, data, createdAt } = group
    if(!!!data) data = {}
    const menu = (
      <Menu onClick={this.handleMenuClick.bind(this, name)} mode="vertical">
        <Menu.Item key="delete">
          <i className="fa fa-trash-o" /> 删除配置组
        </Menu.Item>
      </Menu>
    )
    return (
      <Row>
        <Col className="group-name textoverflow" span="6">
          <Checkbox
            checked={(checkedList.indexOf(name) > -1)}
            onChange={this.handleCheckedChange.bind(this, name)}
            onClick={this.stopPropagation}
          />
          <Icon type="folder-open" />
          <Icon type="folder" />
          <span>{name}</span>
        </Col>
        <Col span="6">
          加密对象 &nbsp;
          {Object.keys(data).length || '0'}个
        </Col>
        <Col span="6">
          创建时间&nbsp;&nbsp;
          {calcuDate(createdAt)}
        </Col>
        <Col span="6">
          <ButtonGroup onClick={this.stopPropagation}>
            <Dropdown.Button
              size="large"
              onClick={openCreateConfigFileModal.bind(this, name)}
              overlay={menu}
              type="ghost"
            >
              <Icon type="plus" /> 加密对象
            </Dropdown.Button>
          </ButtonGroup>
        </Col>
      </Row>
    )
  }
}
