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
import Metrics from '../Metrics'
import {
  loadContainerMetricsCPU,
  loadContainerMetricsMemory,
  loadContainerMetricsNetworkReceived,
  loadContainerMetricsNetworkTransmitted,
  loadContainerMetricsDiskRead,
  loadContainerMetricsDiskWrite,
  loadContainerAllOfMetrics,
} from '../../actions/metrics'
import { UPDATE_INTERVAL, LOAD_INSTANT_INTERVAL } from '../../constants'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const timeFrequency = {
  '1': {
    'second': 1000 * 60,
    'timeDes': '1分钟'
  },
  '6': {
    'second': 1000 * 60 * 5,
    'timeDes': '5分钟'
  },
  '24': {
    'second': 1000 * 60 * 20,
    'timeDes': '20分钟'
  },
  '168': {
    'second': 1000 * 60 * 60 * 2,
    'timeDes': '2小时'
  },
  '672': {
    'second': 1000 * 60 * 60 * 6,
    'timeDes': '6小时'
  }
}

function loadData(props, query) {
  const { cluster, containerName, loadContainerMetricsCPU, loadContainerMetricsMemory, loadContainerMetricsNetworkReceived, loadContainerMetricsNetworkTransmitted, loadContainerMetricsDiskRead, loadContainerMetricsDiskWrite } = props
  loadContainerMetricsCPU(cluster, containerName, query)
  loadContainerMetricsMemory(cluster, containerName, query)
  loadContainerMetricsNetworkReceived(cluster, containerName, query)
  loadContainerMetricsNetworkTransmitted(cluster, containerName, query)
  loadContainerMetricsDiskRead(cluster, containerName, query)
  loadContainerMetricsDiskWrite(cluster, containerName, query)
}

class ContainerMonitior extends Component {
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
    const { loadContainerMetricsCPU, cluster, containerName } = this.props
    loadContainerMetricsCPU(cluster, containerName, {start: this.changeTime('0.5'), source: 'influxdb'}, {
      finally: {
        func: () => {
          this.setState({
            CpuLoading: false
          })
        }
      }
    })
  }
  getHostMemory() {
    const { loadContainerMetricsMemory, cluster, containerName } = this.props
    loadContainerMetricsMemory(cluster, containerName, {start: this.changeTime('0.5'), source: 'influxdb'}, {
      finally: {
        func: () => {
          this.setState({
            MemoryLoading: false
          })
        }
      }
    })
  }
  getHostNetworkRx() {
    const { loadContainerMetricsNetworkReceived, cluster, containerName } = this.props
    return new Promise(resolve => {
      loadContainerMetricsNetworkReceived(cluster, containerName, {start: this.changeTime('0.5'), source: 'influxdb'}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getHostNetworkTx() {
    const { loadContainerMetricsNetworkTransmitted, cluster, containerName } = this.props
    return new Promise(resolve => {
      loadContainerMetricsNetworkTransmitted(cluster, containerName, {start: this.changeTime('0.5'), source: 'influxdb'}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getHostDiskRead() {
    const { loadContainerMetricsDiskRead, cluster, containerName } = this.props
    return new Promise(resolve => {
      loadContainerMetricsDiskRead(cluster, containerName, {start: this.changeTime('0.5')}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getHostDiskWrite() {
    const { loadContainerMetricsDiskWrite, cluster, containerName } = this.props
    return new Promise(resolve => {
      loadContainerMetricsDiskWrite(cluster, containerName, {start: this.changeTime('0.5')}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  switchChange(flag, type) {
    this.setState({
      [`switch${type}`]: flag,
      [`${type}Loading`]: flag
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
          Promise.all([this.getHostNetworkRx(), this.getHostNetworkTx()]).then(() => {
            this.setState({
              NetworkLoading: false
            })
          })
          this.networkRxInterval = setInterval(() => this.getHostNetworkRx(), LOAD_INSTANT_INTERVAL)
          this.networkTxInterval = setInterval(() => this.getHostNetworkTx(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.diskReadInterval)
        clearInterval(this.diskWriteInterval)
        if (flag) {
          Promise.all([this.getHostDiskRead(), this.getHostDiskWrite()]).then(() => {
            this.setState({
              DiskLoading: false
            })
          })
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
    const timeDes = timeFrequency[value]['timeDes']
    this.setState({
      currentStart: start,
      freshTime: timeDes
    })
    loadData(this.props, { start })
  }

  componentDidMount() {
    const { loadContainerAllOfMetrics, cluster, containerName } = this.props
    loadContainerAllOfMetrics(cluster, containerName, { start: this.changeTime(1) })
    this.setIntervalFunc()
  }

  componentWillUnmount() {
    clearInterval(this.metricsInterval)
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
      const { cluster, containerName, loadContainerAllOfMetrics } = this.props
      this.setState({
        intervalStatus: true
      })
      this.metricsInterval = setInterval(() => {
        loadContainerAllOfMetrics(cluster, containerName, query)
      }, UPDATE_INTERVAL);
    }
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, diskReadIo, diskWriteIo, allcontainermetrics } = this.props
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
    if (allcontainermetrics.data.length) {
      switchCpu ? showCpu = cpu : showCpu.data.push(allcontainermetrics.data[0].cpu)
      switchMemory ? showMemory = memory : showMemory.data.push(allcontainermetrics.data[1].memory)
      if (switchNetwork) {
        showNetworkRec = networkReceived
        showNetworkTrans = networkTransmitted
      } else {
        showNetworkTrans.data.push(allcontainermetrics.data[2].networkTrans)
        showNetworkRec.data.push(allcontainermetrics.data[3].networkRec)
      }
      if (switchDisk) {
        showDiskReadIo = diskReadIo
        showDiskWriteIo = diskWriteIo
      } else {
        showDiskReadIo.data.push(allcontainermetrics.data[4].diskReadIo)
        showDiskWriteIo.data.push(allcontainermetrics.data[5].diskWriteIo)
      }
    }
    return (
      <div id="ContainerMonitior">
        <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
        <Metrics
          scope={this}
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

ContainerMonitior.propTypes = {

}

function mapStateToProps(state, props) {
  const {
    CPU,
    memory,
    networkReceived,
    networkTransmitted,
    diskReadIo,
    diskWriteIo,
    allcontainersmetrics
  } = state.metrics.containers
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
  if(allcontainersmetrics && allcontainersmetrics.result) {
    allData.data = allcontainersmetrics.result.data || []
  }
  return {
    cpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,
    diskReadIo: diskReadIoData,
    diskWriteIo: diskWriteIoData,
    allcontainermetrics: allData
  }
}
export default connect(mapStateToProps, {
  loadContainerMetricsCPU,
  loadContainerMetricsMemory,
  loadContainerMetricsNetworkReceived,
  loadContainerMetricsNetworkTransmitted,
  loadContainerAllOfMetrics,
  loadContainerMetricsDiskRead,
  loadContainerMetricsDiskWrite,
})(ContainerMonitior)