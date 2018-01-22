/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance config
 *
 * v0.1 - 2018-01-15
 * @author zhangxuan
 */

import React from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Button, Pagination } from 'antd'
import QueueAnim from 'rc-queue-anim'
import BaseInfo from './BaseInfo'
import MonitorTable from './MonitorTable'
import MonitorDetail from './MonitorDetail'
import './style/LoadBalanceConfig.less'

class LoadBalanceConfig extends React.Component {
  state = {
    tablePart: true,
  }
  
  togglePart = (flag, data) => {
    this.setState({
      tablePart: flag,
      currentMonitor: data
    })
  }
  
  render() {
    const { tablePart, currentMonitor } = this.state
    return (
      <QueueAnim className="loadBalanceConfig">
        <div className="configHeader" key="configHeader">
          <span
            className="back"
            onClick={() => browserHistory.push(`/app_manage/load_balance`)}
          >
              <span className="backjia"/>
              <span className="btn-back">返回</span>
            </span>
          <span className="headerTitle">
            配置负载均衡器
          </span>
        </div>
        <BaseInfo key="baseInfo"/>
        <div key="tableAndDetail">
          {
            tablePart ?
              <MonitorTable
                togglePart={this.togglePart}
              />
              :
              <MonitorDetail
                currentMonitor={currentMonitor}
                togglePart={this.togglePart}
              />
          }
        </div>
      </QueueAnim>
    )
  }
}

const mapStateToProps = state => {
  return {
    
  }
}

export default connect(mapStateToProps, {
  
})(LoadBalanceConfig)