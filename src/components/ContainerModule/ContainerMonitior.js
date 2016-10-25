/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/19
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Radio, } from 'antd'
import { connect } from 'react-redux'
import './style/ContainerMonitior.less'
import TimeControl from '../Metrics/TimeControl'
import CPUMonitior from './CPUMonitior'
import MemoryMonitior from './MemoryMonitior'
import NetworkMonitior from './NetworkMonitior'
import { loadMetricsCPU, loadMetricsMemory, loadMetricsNetworkReceived, loadMetricsNetworkTransmitted, } from '../../actions/metrics'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function loadData(props, query) {
  const { cluster, containerName, loadMetricsCPU, loadMetricsMemory, loadMetricsNetworkReceived, loadMetricsNetworkTransmitted } = props
  loadMetricsCPU(cluster, containerName, query)
  loadMetricsMemory(cluster, containerName, query)
  loadMetricsNetworkReceived(cluster, containerName, query)
  loadMetricsNetworkTransmitted(cluster, containerName, query)
}

class ContainerMonitior extends Component {
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

  componentWillMount() {
    loadData(this.props, { start: this.changeTime(0) })
  }

  render() {
    const { CPU, memory, networkReceived, networkTransmitted } = this.props
    console.log('propsMemory=====', memory);
    return (
      <div id="ContainerMonitior">
        <TimeControl onChange={this.handleTimeChange} />
        <div className="cpu">
          <CPUMonitior CPU={CPU} />
        </div>
        <div className="memory">
          <MemoryMonitior memory={memory} />
        </div>
        <div className="network">
          <NetworkMonitior networkReceived={networkReceived} networkTransmitted={networkTransmitted} />
        </div>
      </div>
    )
  }
}

ContainerMonitior.propTypes = {

}

function mapStateToProps(state, props) {
  const {
    CPU,
    memory,
    networkReceived,
    networkTransmitted,
  } = state.metrics.containers
  const cpuData = {
    isFetching: CPU.isFetching,
    data: []
  }
  if (CPU && CPU.result) {
    cpuData.data = CPU.result.data || []
    /*CPU.result.data['cpu/usageRate'].map((item) => {
      cpuData.timeDatas.push(item.timestamp)
      cpuData.values.push(item.value * 100)
    })*/
  }
  console.log('cpuData--------------------------------')
  console.log(cpuData)
  return {
    CPU: cpuData,
    memory,
    networkReceived,
    networkTransmitted,
  }
}
export default connect(mapStateToProps, {
  loadMetricsCPU,
  loadMetricsMemory,
  loadMetricsNetworkReceived,
  loadMetricsNetworkTransmitted,
})(ContainerMonitior)