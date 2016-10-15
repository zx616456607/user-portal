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
              <Link to="/database_cache/mongo">Mongo集群</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/database_cache/redis">Redis集群</Link>
            </Menu.Item>
          </Menu>
        </div>
      </div>
    )
  }
}

DatabaseSider.PropTypes = {

}