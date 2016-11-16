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
      <div id="AppSider">
        <div>
          <Menu onClick={this.handleClick}
            style={{ width: 140 }}
            selectedKeys={[current]}
            mode="inline"
            >
            <Menu.Item key="1">
              <Link to="/app_manage">应用</Link>
            </Menu.Item>
				    <Menu.Item key="2">
				      <Link to="/app_manage/service">服务</Link>
				    </Menu.Item>
            <Menu.Item key="3">
              <Link to="/app_manage/container">容器</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/app_manage/storage">存储</Link>
            </Menu.Item>
            {/*<Menu.Item key="5">
              <Link to="/app_manage/firewall">防火墙</Link>
            </Menu.Item>*/}
            <Menu.Item key="6">
              <Link to="/app_manage/configs">服务配置</Link>
            </Menu.Item>
            {/*<Menu.Item key="7">
              <Link to="/app_manage/netName">内网域名</Link>
            </Menu.Item>*/}
          </Menu>
        </div>
      </div>
    )
  }
}

function currentPathNameCheck(scope) {
  //this function for check the pathname and change the current key
  let pathname = window.location.pathname;
  //this check the pathname from the container
  let containerModule = pathname.indexOf('app_manage/container');
  if( containerModule > -1 ){
    scope.setState({
      current: '2'
    });
    return;
  }
  //this check the pathname from the storage
  let storageModule = pathname.indexOf('app_manage/storage');
  if( storageModule > -1 ){
    scope.setState({
      current: '3'
    });
    return;
  }
  //this check the pathname from the configs
  let configsModule = pathname.indexOf('app_manage/configs');
  if( configsModule > -1 ){
    scope.setState({
      current: '5'
    });
    return;
  }
  scope.setState({
    current: '1'
  });
}
