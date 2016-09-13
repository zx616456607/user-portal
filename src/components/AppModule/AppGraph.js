/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * AppGraph component
 * 
 * v0.1 - 2016-09-10
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Checkbox,Dropdown,Button,Card, Menu,Icon } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppGraph.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const operaMenu = (<Menu>
					  <Menu.Item key="0">
						test
					  </Menu.Item>
					  <Menu.Item key="1">
						task
					  </Menu.Item>
					  <Menu.Item key="2">
						suse
					  </Menu.Item>
					  <Menu.Item key="3">
						img
					  </Menu.Item>
					</Menu>);

export default class AppGraph extends Component {
  constructor(props) {
    super(props);
  }	
  
  render() {
    return (
      <div id="AppGraph">
	    <div className="topBox">
	      <span>编排类型:</span>
	      <Dropdown overlay={menu} trigger={['click']}>
		    <Button>task
		    </Button>
		  </Dropdown>
	    </div>
	    <div className="bottomBox">
	      <span>描述文件:</span>
	    </div>
      </div>
    )
  }
}

AppGraph.propTypes = {
//
}
