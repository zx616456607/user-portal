/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * monitor loadBabanlce
 *
 * @author lvjunfeng
 * @date 2018-12-18
 *
*/
import React from 'react'
import { connect } from 'react-redux'
// import { Tooltip, Icon, Spin } from 'antd'
// import './style/index.less'
import * as LoadBalanceAction from '../../../../../src/actions/load_balance'
import TimeControl from '../../../../../src/components/Metrics/TimeControl'
import Metrics from '../../../../../src/components/Metrics'

const monitorType = [
  'network/tx_rate', 'network/rx_rate',
  'cpu/usage_rate',
  'memory/usage_rate',
  // 'ingress/qps', 'ingress/success_rate',
  // 'controller/qps', 'controller/connections',
  // 'config/last_reload_successful',
  // 'config/last_reload_failed', 'config/last_reload_timestamp', 'controller/success_rate',
]
const UPDATE_INTERVAL = 1000 * 60

class MonitorLoadBalance extends React.Component {

  state = {
    intervalStatus: false,
    freshTime: '1分钟',
    switchCpu: false,
    switchMemory: false,
    switchNetwork: false,
    switchDisk: false,
    currentValue: 1,
    // currentStart: this.changeTimeStart(1),
    loading: true,
  }

  clearIntervalLoadMetrics = () => {
    clearInterval(this.metricsInterval)
    monitorType.forEach(item => {
      clearInterval(this[`${item}RealTimeInterval`])
    })
  }

  componentWillUnmount() {
    this.clearIntervalLoadMetrics()
  }

  componentDidMount() {
    if (!this.state.currentStart) {
      this.setState({
        currentStart: this.changeTimeStart(1),
      }, () => {
        this.clearIntervalLoadMetrics()
        this.intervalLoadMetrics()
      })
    }
  }

  intervalLoadMetrics = () => {
    clearInterval(this.metricsInterval)
    this.loadInstanceAllMetrics()
    this.metricsInterval = setInterval(() => {
      this.loadInstanceAllMetrics()
    }, UPDATE_INTERVAL)
  }

  loadInstanceAllMetrics = async () => {
    const promiseArray = monitorType.map(type => this.getInstanceMetricsByType(type))
    this.setState({
      loading: true,
    })
    await Promise.all(promiseArray)
    this.setState({
      loading: false,
    })
  }

  getInstanceMetricsByType = type => {
    const { clusterID, location, getMonitorData } = this.props
    const { query: { name } } = location || {}
    const { currentValue } = this.state
    const queryBody = {
      type,
      ...this.formatTimeRange(currentValue),
    }
    getMonitorData(clusterID, name, queryBody)
  }

  formatTimeRange = range => ({
    start: this.changeTimeStart(range),
    end: new Date().toISOString(),
  })

  changeTimeStart = hours => {
    const d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  handleTimeChange = e => {
    const { value } = e.target
    const start = this.changeTimeStart(value)
    const timeFrequency = {
      1: {
        second: 1000 * 60,
        timeDes: '1分钟',
      },
      6: {
        second: 1000 * 60 * 5,
        timeDes: '5分钟',
      },
      24: {
        second: 1000 * 60 * 20,
        timeDes: '20分钟',
      },
      168: {
        second: 1000 * 60 * 60 * 2,
        timeDes: '2小时',
      },
      720: {
        second: 1000 * 60 * 60 * 6,
        timeDes: '6小时',
      },
    }
    const timeDes = timeFrequency[value].timeDes
    this.setState({
      currentStart: start,
      freshTime: timeDes,
      currentValue: value,
    }, this.intervalLoadMetrics)
  }

  render() {
    const { loading } = this.state
    const { monitor } = this.props
    return (
      <div>
        <TimeControl
          onChange={this.handleTimeChange}
        />
        {
          loading ?
            null :
            <Metrics
              scope={this}
              key="loadBalanceMonitior"
              events="loadBalanceMonitior"
              cpu={monitor && monitor['cpu/usage_rate']}
              memory={monitor && monitor['memory/usage_rate']}
              networkReceived={monitor && monitor['network/rx_rate']}
              networkTransmitted={monitor && monitor['network/tx_rate']}
              diskHide={true}
            />
        }
      </div>
    )
  }
}

const mapStateToProps = ({
  entities: { current },
  loadBalance: { monitorData },
}) => {
  const clusterID = current.cluster.clusterID
  const { monitor, isFetching } = monitorData
  return {
    clusterID,
    monitor,
    isFetching,
  }
}

export default connect(mapStateToProps, {
  getMonitorData: LoadBalanceAction.getMonitorData,
})(MonitorLoadBalance)
