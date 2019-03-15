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
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/ManageMonitor.less'

const menuList = [
  {
    url: '/manange_monitor/audit',
    name: 'audit'
  },
  {
    url: '/manange_monitor/query_log',
    name: 'queryLog'
  },
  {
    url: '/manange_monitor/panel',
    name: 'monitorPanel'
  },
  {
    url: '/manange_monitor/alarm_setting',
    name:'alarmSetting'
  },
  {
    url: '/manange_monitor/alarm_record',
    name: 'alarmRecord'
  },
]

export default class ManageMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children } = this.props
    return (
      <div id="ManageMonitor">
        <div className="ManageMonitorContent CommonSecondContent" >
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