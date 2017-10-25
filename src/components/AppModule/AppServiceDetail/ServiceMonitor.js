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
import {
  loadServiceMetricsCPU,
  loadServiceMetricsMemory,
  loadServiceMetricsNetworkReceived,
  loadServiceMetricsNetworkTransmitted,
  loadServiceAllOfMetrics,
  loadServiceMetricsDiskRead,
  loadServiceMetricsDiskWrite,
} from '../../../actions/metrics'
import { UPDATE_INTERVAL, LOAD_INSTANT_INTERVAL } from '../../../constants'
import './style/ServiceMonitor.less'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function loadData(props, query) {
  const { cluster, serviceName, loadServiceMetricsCPU, loadServiceMetricsMemory, loadServiceMetricsNetworkReceived, loadServiceMetricsNetworkTransmitted, loadServiceAllOfMetrics, loadServiceMetricsDiskRead, loadServiceMetricsDiskWrite } = props
  loadServiceMetricsCPU(cluster, serviceName, query)
  loadServiceMetricsMemory(cluster, serviceName, query)
  loadServiceMetricsNetworkReceived(cluster, serviceName, query)
  loadServiceMetricsNetworkTransmitted(cluster, serviceName, query)
  loadServiceMetricsDiskRead(cluster, serviceName, query)
  loadServiceMetricsDiskWrite(cluster, serviceName, query)
}

class ServiceMonitior extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.setIntervalFunc = this.setIntervalFunc.bind(this)
    this.state = {
      intervalStatus: false,
      freshTime: '1分钟',
      switchCpu: false,
      switchMemory: false,
      switchNetwork: false,
      switchDisk: false
    }
  }
  
  getHostCpu() {
    const { loadServiceMetricsCPU, cluster, serviceName } = this.props
    loadServiceMetricsCPU(cluster, serviceName, {start: this.changeTime('0.5')})
  }
  getHostMemory() {
    const { loadServiceMetricsMemory, cluster, serviceName } = this.props
    loadServiceMetricsMemory(cluster, serviceName, {start: this.changeTime('0.5')})
  }
  getHostNetworkRx() {
    const { loadServiceMetricsNetworkReceived, cluster, serviceName } = this.props
    loadServiceMetricsNetworkReceived(cluster, serviceName, {start: this.changeTime('0.5')})
  }
  getHostNetworkTx() {
    const { loadServiceMetricsNetworkTransmitted, cluster, serviceName } = this.props
    loadServiceMetricsNetworkTransmitted(cluster, serviceName, {start: this.changeTime('0.5')})
  }
  getHostDiskRead() {
    const { loadServiceMetricsDiskRead, cluster, serviceName } = this.props
    loadServiceMetricsDiskRead(cluster, serviceName, {start: this.changeTime('0.5')})
  }
  getHostDiskWrite() {
    const { loadServiceMetricsDiskWrite, cluster, serviceName } = this.props
    loadServiceMetricsDiskWrite(cluster, serviceName, {start: this.changeTime('0.5')})
  }
  switchChange(flag, type) {
    this.setState({
      [`switch${type}`]: flag
    })
    switch(type) {
      case 'Cpu':
        clearInterval(this.cpuInterval)
        if (flag) {
          this.getHostCpu()
          this.cpuInterval = setInterval(() => this.getHostCpu(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Memory':
        clearInterval(this.memoryInterval)
        if (flag) {
          this.getHostMemory()
          this.memoryInterval = setInterval(() => this.getHostMemory(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Network':
        clearInterval(this.networkRxInterval)
        clearInterval(this.networkTxInterval)
        if (flag) {
          this.getHostNetworkRx()
          this.getHostNetworkTx()
          this.networkRxInterval = setInterval(() => this.getHostNetworkRx(), LOAD_INSTANT_INTERVAL)
          this.networkTxInterval = setInterval(() => this.getHostNetworkTx(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.diskReadInterval)
        clearInterval(this.diskWriteInterval)
        if (flag) {
          this.getHostDiskRead()
          this.getHostDiskWrite()
          this.diskReadInterval = setInterval(() => this.getHostDiskRead(), LOAD_INSTANT_INTERVAL)
          this.diskWriteInterval = setInterval(() => this.getHostDiskWrite(), LOAD_INSTANT_INTERVAL)
        }
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

  componentWillMount() {
    const { loadServiceAllOfMetrics, cluster, serviceName } = this.props
    loadServiceAllOfMetrics(cluster, serviceName, { start: this.changeTime(1)})
    this.setIntervalFunc()
  }

  componentWillReceiveProps(nextProps) {
    const { cluster, serviceName } = nextProps
    if (serviceName === this.props.serviceName) {
      return
    }
    loadData(nextProps, { start: this.changeTime(1) })
  }

  componentWillUnmount() {
    clearInterval(this.metricsInterval)
    clearInterval(this.changeTimeInterval)
    clearInterval(this.cpuInterval)
    clearInterval(this.memoryInterval)
    clearInterval(this.networkRxInterval)
    clearInterval(this.networkTxInterval)
    clearInterval(this.diskReadInterval)
    clearInterval(this.diskWriteInterval)
  }

  setIntervalFunc() {
    //this function for setInterval
    let query = this.state.currentStart;
    const { intervalStatus } = this.state;
    if(intervalStatus) {
      clearInterval(this.metricsInterval)
      this.setState({
        intervalStatus: false
      })
    } else {
      const { cluster, serviceName, loadServiceAllOfMetrics } = this.props
      this.setState({
        intervalStatus: true
      })
      this.metricsInterval = setInterval(() => {
        loadServiceAllOfMetrics(cluster, serviceName, query)
      }, UPDATE_INTERVAL);
    }
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, diskReadIo, diskWriteIo, allServiceMetrics } = this.props
    const { intervalStatus, switchCpu, switchMemory, switchNetwork, switchDisk } = this.state
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
    // if(allServiceMetrics.data.length > 0) {
    //   showCpu.data = allServiceMetrics.data[0].cpu;
    //   showCpu.isFetching = false;
    //   showMemory.data = allServiceMetrics.data[1].memory;
    //   showMemory.isFetching = false;
    //   showNetworkTrans.data = allServiceMetrics.data[2].networkTrans;
    //   showNetworkTrans.isFetching = false;
    //   showNetworkRec.data = allServiceMetrics.data[3].networkRec;
    //   showNetworkRec.isFetching = false;
    //   showDiskReadIo.data = allServiceMetrics.data[4].diskReadIo;
    //   showDiskReadIo.isFetching = false;
    //   showDiskWriteIo.data = allServiceMetrics.data[5].diskWriteIo;
    //   showDiskWriteIo.isFetching = false;
    // } else {
    //   showCpu = cpu;
    //   showMemory = memory;
    //   showNetworkTrans = networkTransmitted;
    //   showNetworkRec = networkReceived;
    //   showDiskReadIo = diskReadIo
    //   showDiskWriteIo = diskWriteIo
    // }
    if (allServiceMetrics.data.length) {
      switchCpu ? showCpu = cpu : showCpu.data = allServiceMetrics.data[0].cpu
      switchMemory ? showMemory = memory: showMemory.data = allServiceMetrics.data[1].memory
      if (switchNetwork) {
        showNetworkRec = networkReceived
        showNetworkTrans = networkTransmitted
      } else {
        showNetworkRec.data = allServiceMetrics.data[3].networkRec
        showNetworkTrans.data = allServiceMetrics.data[2].networkTrans;
      }
      if (switchDisk) {
        showDiskReadIo = diskReadIo
        showDiskWriteIo = diskWriteIo
      } else {
        showDiskReadIo.data = allServiceMetrics.data[4].diskReadIo;
        showDiskWriteIo.data = allServiceMetrics.data[5].diskWriteIo;
      }
    }
    return (
      <div id="ServiceMonitior">
        <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
        <Metrics
          scope={this}
          events='AppServiceDetail'
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
    allservicesmetrics,
    diskReadIo,
    diskWriteIo,
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
  if(allservicesmetrics && allservicesmetrics.result) {
    allData.data = allservicesmetrics.result.data || []
  }
  return {
    cpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,
    diskReadIo: diskReadIoData,
    diskWriteIo: diskWriteIoData,
    allServiceMetrics: allData
  }
}

export default connect(mapStateToProps, {
  loadServiceMetricsCPU,
  loadServiceMetricsMemory,
  loadServiceMetricsNetworkReceived,
  loadServiceMetricsNetworkTransmitted,
  loadServiceAllOfMetrics,
  loadServiceMetricsDiskRead,
  loadServiceMetricsDiskWrite,
})(ServiceMonitior)