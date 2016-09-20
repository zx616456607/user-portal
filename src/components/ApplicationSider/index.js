/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppSider component
 * 
 * v0.1 - 2016-09-07
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router'
import "./style/AppSider.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

export default class AppSider extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      current: '1'
  	}
  }
  
  handleClick(e) {
    this.setState({
	  current: e.key,
	});
  }
	
  render() {
  	const { current } = this.state
    return (
      <div id = "AppSider">
        <div>
	      <Menu onClick={this.handleClick}
	        style={{ width: 140 }}
	        selectedKeys={ [current] }
	        mode="inline"
	      >
		  <Menu.Item key="1">
		    <Link to="/app_manage">应用</Link>
		  </Menu.Item>
		  <Menu.Item key="2">
		    <Link to="/app_manage/container">容器</Link>
		  </Menu.Item>
		  <Menu.Item key="3">
		    <Link to="/Application/storage">存储</Link>
		  </Menu.Item>
		  <Menu.Item key="4">
		    <Link to="/Application/firewall">防火墙</Link>
		  </Menu.Item>
		  <Menu.Item key="5">
		    <Link to="/Application/serverSetting">服务配置</Link>
		  </Menu.Item>
		  <Menu.Item key="6">
		    <Link to="/Application/netName">内网域名</Link>
		  </Menu.Item>
	      </Menu>
	    </div>
	  </div>
    )
  }
}