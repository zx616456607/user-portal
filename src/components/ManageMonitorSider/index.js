/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ManageMonitorSider component
 *
 * v0.1 - 2016-11-01
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router'
import "./style/ManageMonitorSider.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

export default class ManageMonitorSider extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      current: '1'
    }
  }
  
  componentWillMount(){
    currentPathNameCheck(this);
  }

  handleClick(e) {
    this.setState({
      current: e.key,
    });
  }

  render() {
    const { current } = this.state
    return (
      <div id="ManageMonitorSider">
        <div>
          <Menu onClick={this.handleClick}
            style={{ width: 140 }}
            selectedKeys={[current]}
            mode="inline"
            >
            <Menu.Item key="1">
              <Link to="/manange_monitor">操作审计</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/manange_monitor/query_log">日志查询</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/manange_monitor/monitor">监控管理</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/manange_monitor/report_center">报表中心</Link>
            </Menu.Item>
          </Menu>
        </div>
      </div>
    )
  }
}

function currentPathNameCheck(scope) {
  //this function for check the pathname and change the current key 
  let pathname = window.location.pathname;
  //this check the pathname from the query_log
  let logModule = pathname.indexOf('manange_monitor/query_log');
  if( logModule > -1 ){
    scope.setState({
      current: '2'
    });
    return;
  }
  //this check the pathname from the monitor
  let monitorModule = pathname.indexOf('manange_monitor/monitor');
  if( monitorModule > -1 ){
    scope.setState({
      current: '3'
    });
    return;
  }
  //this check the pathname from the report_center
  let reportModule = pathname.indexOf('manange_monitor/report_center');
  if( reportModule > -1 ){
    scope.setState({
      current: '3'
    });
    return;
  }
  scope.setState({
    current: '1'
  });
}
