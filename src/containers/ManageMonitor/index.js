/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Manage and Monitor component
 *
 * v0.1 - 2016-11-01
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import ManageMonitorSider from '../../components/ManageMonitorSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/ManageMonitor.less'

export default class ManageMonitor extends Component {
  render() {
    const { children } = this.props
    return (
      <div id="ManageMonitor">
        <QueueAnim
          className="ManageMonitorSiderAnimate"
          key="ManageMonitorSiderAnimate"
          type="left"
          >
          <div className="ManageMonitorMenu" key="ManageMonitorSider">
            <ManageMonitorSider />
          </div>
        </QueueAnim>
        <div className="ManageMonitorContent">
          {children}
        </div>
      </div>
    )
  }
}

ManageMonitor.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}