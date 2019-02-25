/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * net-management
 *
 * v0.1 - 2018-06-20
 * @author zhangpc
 */
import React from 'react'
import './style/index.less'

export default class NetManagement extends React.Component {
  state = {
    windowHeight: window.innerHeight,
    containerSiderStyle: 'normal',
  }

  render() {
    const { children } = this.props

    return <div id="NetManagement">
      <div
        className="NetManagementContent CommonSecondContent"
      >
        { children }
      </div>
    </div>
  }
}
