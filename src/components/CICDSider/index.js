/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CICDSider component
 *
 * v0.1 - 2016-10-18
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router'
import "./style/CICDSider.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

export default class CICDSider extends Component {
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
      <div id="CICDSider">
        <div>
          <Menu onClick={this.handleClick}
            style={{ width: 140 }}
            selectedKeys={[current]}
            mode="inline"
            >
            <Menu.Item key="1">
              <Link to="/ci_cd">代码仓库</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/ci_cd/tenx_flow">TenxFlow</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/ci_cd/docker_file">DockerFile</Link>
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
  //this check the pathname from the image_store
  let containerModule = pathname.indexOf('ci_cd/tenx_flow');
  if( containerModule > -1 ){
    scope.setState({
      current: '2'
    });
    return;
  }
  //this check the pathname from the stack_center
  let storageModule = pathname.indexOf('ci_cd/docker_file');
  if( storageModule > -1 ){
    scope.setState({
      current: '3'
    });
    return;
  }
  scope.setState({
    current: '1'
  });
}
