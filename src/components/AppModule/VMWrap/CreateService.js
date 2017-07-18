/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: create service
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
        <h1>创建传统应用</h1>
        <Link to="/app_manage/vm_wrap">传统应用</Link>
      </div>
    )
  }
}