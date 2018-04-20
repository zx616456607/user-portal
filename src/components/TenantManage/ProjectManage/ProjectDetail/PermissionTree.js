/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Permission tree
 *
 * v0.1 - 2018-04-19
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Table, Collapse, Button, Row, Col, Popover } from 'antd'
import CheckboxTree from 'react-checkbox-tree';
import { loadAppList } from '../../../../actions/app_manage'
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

export default class PermissionTree extends React.Component {

  state = {
    nodes: []
  }

  formatType = type => {

    switch(type){
      case "application":
        return "应用";
      case "configuration":
        return "配置";
      case "container":
        return "容器";
      case "service":
        return "服务";
      case "volume":
        return "存储";
      default:
        return '未知';
    }
  }

  getTrees = (type, data, record) => {
    const { onChange } = this.props
    const { operations, acls } = data
    const { fixed } = acls
    const parentNode = this.formatType(type)
    const expanded = [type]
    const children = []
    let currentPermission

    if (!record.isReg) {
      currentPermission = acls.fixed[record.name]
    } else {
      currentPermission = acls.resourceList.filter(item => item.name === record.name)[0].permissionList
    }
    for(let [key, value] of Object.entries(operations)) {
      children.push({
        value: String(value.permissionId),
        label: value.name
      })
    }
    const nodes = [{
      value: type,
      label: parentNode,
      children
    }]

    const checked = currentPermission.map(item => String(item.permissionId))

    onChange(checked)

    this.setState({
      nodes,
      checked,
      expanded
    })
  }

  onCheck = checked => {
    const { onChange } = this.props
    this.setState({ checked })
    onChange(checked)
  }

  componentDidMount() {
    const { type, value, record } = this.props
    this.getTrees(type, value, record)
  }

  render() {
    const { nodes } = this.state

    return (
      <CheckboxTree
        nodes={nodes}
        checked={this.state.checked}
        expanded={this.state.expanded}
        onCheck={this.onCheck}
        onExpand={expanded => this.setState({ expanded })}
      />
    );
  }
}