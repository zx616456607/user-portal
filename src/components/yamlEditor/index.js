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
import {test} from './check.js'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

export default class AppSider extends Component {
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
      <div id="AppSider">
        <textarea id="source" style="display: none;">
        </textarea>
        <textarea id="result" style="display: none;">
        </textarea>
      </div>
    )
  }
}
