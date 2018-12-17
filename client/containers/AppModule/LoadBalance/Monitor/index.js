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
// import Metric from '@tenx-ui/monitorChart'
import '@tenx-ui/monitorChart/assets/index.css'

const monitorType = [
  'cpu/usage_rate', 'network/tx_rate',
  'cpu/usage_rate', 'memory/usage_rate', 'ingress/qps', 'ingress/success_rate',
  'controller/qps', 'controller/connections', 'config/last_reload_successful',
  'config/last_reload_failed', 'config/last_reload_timestamp', 'controller/success_rate',
]
const UPDATE_INTERVAL = 1000 * 60

class MonitorLoadBalance extends React.Component {

  state = {
    currentValue: '1',
    freshInterval: '1分钟',
    loading: true,
    realTimeLoading: {},
    realTimeChecked: {},
  }

  clearIntervalLoadMetrics = () => {
    clearInterval(this.metricsInterval)
    monitorType.forEach(item => {
      clearInterval(this[`${item}RealTimeInterval`])
    })
  }
  componentDidMount() {
    this.clearIntervalLoadMetrics()
    this.intervalLoadMetrics()
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

    // let name = this.concatPodNames()
    // if (monitorType === 'Pod') {
    //   const { id } = match.params
    //   name = id
    // }
    // const query = {
    //   type,
    //   ...this.formatTimeRange(currentValue),
    // }
    const queryBody = {
      type,
      ...this.formatTimeRange(currentValue),
    }
    getMonitorData(clusterID, name, queryBody)
  }

  formatTimeRange = range => {
    return {
      start: this.changeTime(range),
      end: new Date().toISOString(),
    }
  }

  changeTime = hours => {
    const d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  render() {
    return (
      <div>
        监控
      </div>
    )
  }
}

const mapStateToProps = ({
  entities: { current },
}) => {
  const clusterID = current.cluster.clusterID
  return {
    clusterID,
  }
}

export default connect(mapStateToProps, {
  getMonitorData: LoadBalanceAction.getMonitorData,
})(MonitorLoadBalance)
