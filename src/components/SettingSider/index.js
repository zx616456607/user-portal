/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router'
import "./style/SettingSider.less"

export default class SettingSider extends Component {
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
      <div id="SettingSider">
        <div>
          <Menu onClick={this.handleClick}
                style={{ width: 140 }}
                selectedKeys={[current]}
                mode="inline"
          >
            <Menu.Item key="1">
              <Link to="/setting">我的信息</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/setting/member">成员管理</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/setting/team">团队管理</Link>
            </Menu.Item>
            <Menu.Item key="4" style={{borderTop:'1px solid #e2e2e2',borderBottom:'1px solid #e2e2e2',
              margin:'10px 0',height:63,padding:'10px 0'}} disabled>
              <Link to="/setting/note">通知设置</Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to="/setting/API">开放API</Link>
            </Menu.Item>
            <Menu.Item key="6">
              <Link to="/setting/version">平台版本</Link>
            </Menu.Item>
            <Menu.Item key="7">
              <Link to="/setting/license">授权管理</Link>
            </Menu.Item>
          </Menu>
        </div>
      </div>
    )
  }
}

function currentPathNameCheck(scope) {
  let pathname = window.location.pathname;
  let containerModule = pathname.indexOf('/setting/member');
  if( containerModule > -1 ){
    scope.setState({
      current: '2'
    });
    return;
  }
  let storageModule = pathname.indexOf('/setting/team');
  if( storageModule > -1 ){
    scope.setState({
      current: '3'
    });
    return;
  }
  let APIModule = pathname.indexOf('/setting/API');
  if( APIModule > -1 ){
    scope.setState({
      current: '5'
    });
    return;
  }
  scope.setState({
    current: '1'
  });
}
