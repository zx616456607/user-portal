/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v2.0 - 2016/10/11
 * @author Bai Yu
 */


import React, { Component, PropTypes } from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router'

export default class DatabaseSider extends Component {
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
      <div id="ImageCenterSider">
        <div>
          <Menu onClick={this.handleClick}
            style={{ width: 140 }}
            selectedKeys={[current]}
            mode="inline"
            >
            <Menu.Item key="1">
              <Link to="/database_cache">MySQL集群</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/database_cache/mongo_cluster">Mongo集群</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/database_cache/redis_cluster">Redis集群</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/database_cache/database_storage">存储</Link>
            </Menu.Item>
          </Menu>
        </div>
      </div>
    )
  }
}

DatabaseSider.PropTypes = {

}

function currentPathNameCheck(scope) {
  //this function for check the pathname and change the current key 
  let pathname = window.location.pathname;
  //this check the pathname from the mongo_cluster
  let mongoModule = pathname.indexOf('database_cache/mongo_cluster');
  if( mongoModule > -1 ){
    scope.setState({
      current: '2'
    });
    return;
  }
  //this check the pathname from the redis_cluster
  let redisModule = pathname.indexOf('database_cache/redis_cluster');
  if( redisModule > -1 ){
    scope.setState({
      current: '3'
    });
    return;
  }
  //this check the pathname from the storage
  let storageModule = pathname.indexOf('database_cache/database_storage');
  if( storageModule > -1 ){
    scope.setState({
      current: '4'
    });
    return;
  }
  scope.setState({
    current: '1'
  });
}
