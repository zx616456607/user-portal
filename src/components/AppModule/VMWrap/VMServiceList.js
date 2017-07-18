/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: service list
 *
 * v0.1 - 2017-07-18
 * @author ZhangXuan
 */

import React from 'react'
import { Link } from 'react-router'

export default class VMServiceList extends React.Component {
  render() {
    return (
      <div>
        <h1>传统应用</h1>
        <li>
          <ol>
            <Link to="/app_manage/app_create/vm_wrap">创建传统应用</Link>
          </ol>
          <ol>
            <Link to="/app_manage/vm_list">传统应用环境</Link>
          </ol>
        </li>
      </div>
    )
  }
}