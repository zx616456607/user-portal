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
import {
  loadAppMetricsCPU,
  loadAppMetricsMemory,
  loadAppMetricsNetworkReceived,
  loadAppMetricsNetworkTransmitted,
  loadAppAllOfMetrics,
  loadAppMetricsDiskRead,
  loadAppMetricsDiskWrite,
} from '../../actions/metrics'

const RadioGroup = Radio.Group;
let metricsInterval;

function loadData(props, query) {
  const { cluster, appName, loadAppMetricsCPU, loadAppMetricsMemory, loadAppMetricsNetworkReceived, loadAppMetricsNetworkTransmitted, loadAppMetricsDiskRead, loadAppMetricsDiskWrite } = props
  loadAppMetricsCPU(cluster, appName, query)
  loadAppMetricsMemory(cluster, appName, query)
  loadAppMetricsNetworkReceived(cluster, appName, query)
  loadAppMetricsNetworkTransmitted(cluster, appName, query)
  loadAppMetricsDiskRead(cluster, appName, query)
  loadAppMetricsDiskWrite(cluster, appName, query)
}

class AppMonitior extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.setIntervalFunc = this.setIntervalFunc.bind(this)
    this.state = {
      intervalStatus: false
    }
  }

  changeTime(hours) {
    let d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  handleTimeChange(e) {
    const {value} = e.target
    const start = this.changeTime(value)
    this.setState({
      currentStart: start
    })
    loadData(this.props, { start })
  }

  componentDidMount() {
    loadData(this.props, { start: this.changeTime(1) })
  }

  componentWillUnmount() {
    clearInterval(metricsInterval)
  }

  setIntervalFunc() {
    //this function for setInterval
    let query = this.state.currentStart;
    const { intervalStatus } = this.state;
    if(intervalStatus) {
      clearInterval(metricsInterval)
      this.setState({
        intervalStatus: false
      })
    } else {
      const { cluster, appName, loadAppAllOfMetrics } = this.props
      this.setState({
        intervalStatus: true
      })
      metricsInterval = setInterval(() => {
        loadAppAllOfMetrics(cluster, appName, query)
      }, 60000);
    }
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, diskReadIo, diskWriteIo, appAllMetrics } = this.props
    const { intervalStatus } = this.state
    let showCpu = {
      data: [],
      isFetching: false
    };
    let showMemory = {
      data: [],
      isFetching: false
    };
    let showNetworkTrans = {
      data: [],
      isFetching: false
    };
    let showNetworkRec = {
      data: [],
      isFetching: false
    };
    let showDiskReadIo = {
      data: [],
      isFetching: false
    }
    let showDiskWriteIo = {
      data: [],
      isFetching: false
    }
    if(appAllMetrics.data.length > 0) {
      appAllMetrics.data.map((metric) => {
        showCpu.data.push(metric[0].cpu[0]);
        showCpu.isFetching = false;
        showMemory.data.push(metric[1].memory[0]);
        showMemory.isFetching = false;
        showNetworkTrans.data.push(metric[2].networkTrans[0]);
        showNetworkTrans.isFetching = false;
        showNetworkRec.data.push(metric[3].networkRec[0]);
        showNetworkRec.isFetching = false;
        showDiskReadIo.data.push(metric[4].diskReadIo[0])
        showDiskReadIo.isFetching = false
        showDiskWriteIo.data.push(metric[5].diskWriteIo[0])
        showDiskWriteIo.isFetching = false
      })
    } else {
      showCpu = cpu;
      showMemory = memory;
      showNetworkTrans = networkTransmitted;
      showNetworkRec = networkReceived;
      showDiskReadIo = diskReadIo
      showDiskWriteIo = diskWriteIo
    }
    return (
      <div id="AppMonitior">
        <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
        <Metrics
          events="AppMonitior"
          cpu={showCpu}
          memory={showMemory}
          networkReceived={showNetworkRec}
          networkTransmitted={showNetworkTrans}
          diskReadIo={showDiskReadIo}
          diskWriteIo={showDiskWriteIo}
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
    diskReadIo,
    diskWriteIo,
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
  const diskReadIoData = {
    isFetching: diskReadIo.isFetching,
    data: []
  }
  if(diskReadIo && diskReadIo.result){
    diskReadIoData.data = diskReadIo.result.data || []
  }
  const diskWriteIoData = {
    isFetching: diskWriteIo.isFetching,
    data: []
  }
  if(diskWriteIo && diskWriteIo.result){
    diskWriteIoData.data = diskWriteIo.result.data || []
  }
  const allData = {
    isFetching: false,
    data: []
  }
  if(appAllMetrics && appAllMetrics.result) {
    allData.data = appAllMetrics.result.data || []
  }
  return {
    appAllMetrics: allData,
    cpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,
    diskReadIo: diskReadIoData,
    diskWriteIo: diskWriteIoData,
  }
}

export default connect(mapStateToProps, {
  loadAppMetricsCPU,
  loadAppMetricsMemory,
  loadAppMetricsNetworkReceived,
  loadAppMetricsNetworkTransmitted,
  loadAppAllOfMetrics,
  loadAppMetricsDiskRead,
  loadAppMetricsDiskWrite,
})(AppMonitior)