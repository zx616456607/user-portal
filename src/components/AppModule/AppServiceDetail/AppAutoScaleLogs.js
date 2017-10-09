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
import { Timeline, Icon, Spin } from 'antd'
import './style/AppAutoScaleLogs.less'
import { formatDate } from '../../../common/tools'
const TimelineItem = Timeline.Item
export default class AppAutoScaleLogs extends React.Component {
  constructor() {
    super()
    this.state = {
      logList: [],
      loading: false
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
    this.setState({
      loading: true
    })
    getAutoScaleLogs(cluster, serviceName, {
      success: {
        func: res => {
          this.setState({
            logList: res.data.data,
            loading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            logList: [],
            loading: false
          })
        },
        isAsync: true
      }
    })
  }
  emailStatus = status => {
    switch (status) {
      case 0 :
        return '，邮件正在发送。'
      case 1 :
        return '，邮件发送成功。'
      case 2 : 
        return '，邮件发送失败。'
    }
  }
  renderLineTiem(item) {
    const diff = item.scaleFrom - item.scaleTo
    if (diff > 0) {
      return <TimelineItem dot={<Icon type="check-circle" style={{fontSize: 16, color: '#2cb8f6'}}/>} key={item.message}>
               <span style={{ color: '#2cb8f6' }}>{`收缩${diff}个实例${this.emailStatus(item.status)}`}</span>
               <span>{formatDate(item.createTime)}</span>
             </TimelineItem>
    }
    return <TimelineItem dot={<Icon type="check-circle" style={{fontSize: 16, color: '#2fba67'}}/>} key={item.message}>
             <span style={{ color: '#2fba67' }}>{`扩展${Math.abs(diff)}个实例${this.emailStatus(item.status)}`}</span>
             <span>{formatDate(item.createTime)}</span>
    </TimelineItem>
  }
  render() {
    const { logList, loading } = this.state
    return(
      <div className="appAutoScaleLogs">
        {
          loading ?
            <div className='loadingBox'>
              <Spin size='large' />
            </div> :
            logList.length > 0 ?
              <Timeline>
                {
                  logList.map(item => {
                    return this.renderLineTiem(item)
                  })
                }
              </Timeline>
              : <div style={{ textAlign: 'center' }}>暂无数据</div>
        }
      </div>
    )
  }
}