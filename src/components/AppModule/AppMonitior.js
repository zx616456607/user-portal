/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/19
 * @author ZhaoXueYu
 */

import React, { Component, PropTypes } from 'react'
import { Radio, } from 'antd'
import { connect } from 'react-redux'
import TimeControl from '../Metrics/TimeControl'
import Metrics from '../Metrics'
import { loadAppMetricsCPU, loadAppMetricsMemory, loadAppMetricsNetworkReceived, loadAppMetricsNetworkTransmitted } from '../../actions/metrics'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function loadData(props, query) {
  const { cluster, appName, loadAppMetricsCPU, loadAppMetricsMemory, loadAppMetricsNetworkReceived, loadAppMetricsNetworkTransmitted, getAllAppMonitorData } = props
  loadAppMetricsCPU(cluster, appName, query)
  loadAppMetricsMemory(cluster, appName, query)
  loadAppMetricsNetworkReceived(cluster, appName, query)
  loadAppMetricsNetworkTransmitted(cluster, appName, query)
}

class AppMonitior extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
  }

  changeTime(hours) {
    let d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  handleTimeChange(e) {
    const {value} = e.target
    const start = this.changeTime(value)
    loadData(this.props, { start })
  }

  componentDidMount() {
    loadData(this.props, { start: this.changeTime(1) })
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, appAllMetrics } = this.props
    const { data } = appAllMetrics.result
    return (
      <div id="AppMonitior">
        <TimeControl onChange={this.handleTimeChange} />
        <Metrics
          cpu={cpu}
          memory={memory}
          networkReceived={networkReceived}
          networkTransmitted={networkTransmitted}
          />
      </div>
    )
  }
}

AppMonitior.propTypes = {
  cluster: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
  const {
    CPU,
    memory,
    networkReceived,
    networkTransmitted,
    appAllMetrics
  } = state.metrics.apps
  const cpuData = {
    isFetching: CPU.isFetching,
    data: []
  }
  if (CPU && CPU.result) {
    cpuData.data = CPU.result.data || []
  }
  const memoryData = {
    isFetching: memory.isFetching,
    data: []
  }
  if (memory && memory.result) {
    memoryData.data = memory.result.data || []
  }
  const networkReceivedData = {
    isFetching: networkReceived.isFetching,
    data: []
  }
  if (networkReceived && networkReceived.result) {
    networkReceivedData.data = networkReceived.result.data || []
  }
  const networkTransmittedData = {
    isFetching: networkTransmitted.isFetching,
    data: []
  }
  if (networkTransmitted && networkTransmitted.result) {
    networkTransmittedData.data = networkTransmitted.result.data || []
  }
  return {
    appAllMetrics: appAllMetrics,
    cpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,
  }
}

export default connect(mapStateToProps, {
  loadAppMetricsCPU,
  loadAppMetricsMemory,
  loadAppMetricsNetworkReceived,
  loadAppMetricsNetworkTransmitted
})(AppMonitior)