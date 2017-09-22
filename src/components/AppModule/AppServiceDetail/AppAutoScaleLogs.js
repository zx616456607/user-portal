/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2017/09/22
 * @author ZhaoXuan
 */

import React from 'react'
import { Timeline, Icon } from 'antd'
import './style/AppAutoScaleLogs.less'
const TimelineItem = Timeline.Item
export default class AppAutoScaleLogs extends React.Component {
  constructor() {
    super()
    this.state = {
      logList: []
    }
  }
  componentWillMount() {
    this.loadLogs(this.props)
  }
  componentWillReceiveProps(nextProps) {
    const { serviceName: newServiceName, isCurrentTab: newCurrentTab, serviceDetailmodalShow: newScopeModal } = nextProps
    const { serviceName: oldServiceName, isCurrentTab: oldCurrentTab, serviceDetailmodalShow: oldScopeModal } = this.props
    if (newServiceName !== oldServiceName || (newCurrentTab && !oldCurrentTab)) {
      this.loadLogs(nextProps)
    }
  }
  loadLogs = props => {
    const { getAutoScaleLogs, cluster, serviceName } = props
    getAutoScaleLogs(cluster, serviceName, {
      success: {
        func: res => {
          this.setState({
            logList: res.data.data
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            logList: []
          })
        },
        isAsync: true
      }
    })
  }
  render() {
    const { logList } = this.state
    return(
      <div className="appAutoScaleLogs">
        <Timeline>
          {
            logList.length > 0 ? logList.map(item => {
              return <TimelineItem dot={<Icon type="check-circle" style={{fontSize: 16, color: '#2fba67'}}/>} key={item.message}>{item.message}</TimelineItem>
            }) : null
          }
        </Timeline>
      </div>
    )
  }
}