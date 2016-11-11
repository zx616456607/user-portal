/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * MonitorModule component
 *
 * v0.1 - 2016-09-07
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router'
import "./style/MonitorModule.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

export default class MonitorModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentWillMount(){
  }

  render() {
    const { current } = this.state
    return (
      <div id="MonitorModule">
      </div>
    )
  }
}