/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Service monitor
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Radio, } from 'antd'
import { connect } from 'react-redux'
import TimeControl from '../../Metrics/TimeControl'
import Metrics from '../../Metrics'
import { loadServiceMetricsCPU, loadServiceMetricsMemory, loadServiceMetricsNetworkReceived, loadServiceMetricsNetworkTransmitted } from '../../../actions/metrics'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function loadData(props, query) {
  const { cluster, serviceName, loadServiceMetricsCPU, loadServiceMetricsMemory, loadServiceMetricsNetworkReceived, loadServiceMetricsNetworkTransmitted } = props
  loadServiceMetricsCPU(cluster, serviceName, query)
  loadServiceMetricsMemory(cluster, serviceName, query)
  loadServiceMetricsNetworkReceived(cluster, serviceName, query)
  loadServiceMetricsNetworkTransmitted(cluster, serviceName, query)
}

class ServiceMonitior extends Component {
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
    loadData(this.props, { start: this.changeTime(0) })
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted } = this.props
    return (
      <div id="ServiceMonitior">
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

ServiceMonitior.propTypes = {
  serviceName: PropTypes.string.isRequired,
  cluster: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
  const {
    CPU,
    memory,
    networkReceived,
    networkTransmitted,
  } = state.metrics.services
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
    cpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,
  }
}

export default connect(mapStateToProps, {
  loadServiceMetricsCPU,
  loadServiceMetricsMemory,
  loadServiceMetricsNetworkReceived,
  loadServiceMetricsNetworkTransmitted,
})(ServiceMonitior)