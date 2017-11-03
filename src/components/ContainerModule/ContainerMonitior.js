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
      switchDisk: false,
      currentValue: '1',
      currentStart: this.changeTime('1'),
      instantValue: 30
    }
  }
  getMetricsCpu() {
    const { loadContainerMetricsCPU, cluster, containerName } = this.props
    const { currentCpuStart } = this.state
    loadContainerMetricsCPU(cluster, containerName, {start: currentCpuStart, source: 'influxdb'}, {
      finally: {
        func: () => {
          this.setState({
            CpuLoading: false
          })
        }
      }
    })
  }
  getMetricsMemory() {
    const { loadContainerMetricsMemory, cluster, containerName } = this.props
    const { currentMemoryStart } = this.state
    loadContainerMetricsMemory(cluster, containerName, {start: currentMemoryStart, source: 'influxdb'}, {
      finally: {
        func: () => {
          this.setState({
            MemoryLoading: false
          })
        }
      }
    })
  }
  getMetricsNetworkRx() {
    const { loadContainerMetricsNetworkReceived, cluster, containerName } = this.props
    const { currentNetworkStart } = this.state
    return new Promise(resolve => {
      loadContainerMetricsNetworkReceived(cluster, containerName, {start: currentNetworkStart, source: 'influxdb'}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getMetricsNetworkTx() {
    const { loadContainerMetricsNetworkTransmitted, cluster, containerName } = this.props
    const { currentNetworkStart } = this.state
    return new Promise(resolve => {
      loadContainerMetricsNetworkTransmitted(cluster, containerName, {start: currentNetworkStart, source: 'influxdb'}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getMetricsDiskRead() {
    const { loadContainerMetricsDiskRead, cluster, containerName } = this.props
    const { currentDiskStart } = this.state
    return new Promise(resolve => {
      loadContainerMetricsDiskRead(cluster, containerName, {start: currentDiskStart}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getMetricsDiskWrite() {
    const { loadContainerMetricsDiskWrite, cluster, containerName } = this.props
    const { currentDiskStart } = this.state
    return new Promise(resolve => {
      loadContainerMetricsDiskWrite(cluster, containerName, {start: currentDiskStart}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  switchChange(flag, type) {
    const { instantValue } = this.state
    this.setState({
      [`switch${type}`]: flag,
      [`${type}Loading`]: flag
    })
    switch(type) {
      case 'Cpu':
        clearInterval(this.cpuInterval)
        if (flag) {
          this.setState({
            [`current${type}Start`]: this.changeMinutes(instantValue)
          }, () => {
            this.getMetricsCpu()
          })
          this.cpuInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getMetricsCpu()
            })
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Memory':
        clearInterval(this.memoryInterval)
        if (flag) {
          this.setState({
            [`current${type}Start`]: this.changeMinutes(instantValue)
          }, () => {
            this.getMetricsMemory()
          })
          this.memoryInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getMetricsMemory()
            })
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Network':
        clearInterval(this.networkRxInterval)
        clearInterval(this.networkTxInterval)
        if (flag) {
          this.setState({
            [`current${type}Start`]: this.changeMinutes(instantValue)
          }, () => {
            Promise.all([this.getMetricsNetworkRx(), this.getMetricsNetworkTx()]).then(() => {
              this.setState({
                NetworkLoading: false
              })
            })
          })
          this.networkRxInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getMetricsNetworkRx()
            })
          }, LOAD_INSTANT_INTERVAL)
          this.networkTxInterval = setInterval(() => this.getMetricsNetworkTx(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.diskReadInterval)
        clearInterval(this.diskWriteInterval)
        if (flag) {
          this.setState({
            [`current${type}Start`]: this.changeMinutes(instantValue)
          }, () => {
            Promise.all([this.getMetricsDiskRead(), this.getMetricsDiskWrite()]).then(() => {
              this.setState({
                DiskLoading: false
              })
            })
          })
          this.diskReadInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getMetricsDiskRead()
            })
          }, LOAD_INSTANT_INTERVAL)
          this.diskWriteInterval = setInterval(() => this.getMetricsDiskWrite(), LOAD_INSTANT_INTERVAL)
        }
    }
  }
  changeTime(hours) {
    let d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }
  
  changeMinutes(min) {
    let d = new Date()
    d.setMinutes(d.getMinutes() - min)
    return d.toISOString()
  }
  
  handleTimeChange(e) {
    const { loadContainerAllOfMetrics, cluster, containerName } = this.props
    const {value} = e.target
    const start = this.changeTime(value)
    const timeDes = timeFrequency[value]['timeDes']
    this.setState({
      currentStart: start,
      freshTime: timeDes,
      currentValue: value
    }, () => {
      const { currentValue } = this.state
      loadContainerAllOfMetrics(cluster, containerName, { start: this.changeTime(currentValue) })
      this.setIntervalFunc()
    })
  }

  componentDidMount() {
    const { loadContainerAllOfMetrics, cluster, containerName } = this.props
    const { currentValue } = this.state
    loadContainerAllOfMetrics(cluster, containerName, { start: this.changeTime(currentValue) })
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
    const { cluster, containerName, loadContainerAllOfMetrics } = this.props
    const { currentValue } = this.state
    clearInterval(this.metricsInterval)
    this.metricsInterval = setInterval(() => {
      this.setState({
        currentStart: this.changeTime(currentValue)
      }, () => {
        const { currentStart } = this.state
        let query = {start: currentStart};
        loadContainerAllOfMetrics(cluster, containerName, query)
      })
    }, UPDATE_INTERVAL);
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
      switchCpu ? showCpu = cpu : showCpu.data = allcontainermetrics.data[0].cpu
      switchMemory ? showMemory = memory : showMemory.data = allcontainermetrics.data[1].memory
      if (switchNetwork) {
        showNetworkRec = networkReceived
        showNetworkTrans = networkTransmitted
      } else {
        showNetworkTrans.data = allcontainermetrics.data[2].networkTrans
        showNetworkRec.data = allcontainermetrics.data[3].networkRec
      }
      if (switchDisk) {
        showDiskReadIo = diskReadIo
        showDiskWriteIo = diskWriteIo
      } else {
        showDiskReadIo.data = allcontainermetrics.data[4].diskReadIo
        showDiskWriteIo.data = allcontainermetrics.data[5].diskWriteIo
      }
    }
    return (
      <div id="ContainerMonitior">
        <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
        <Metrics
          scope={this}
          diskHide={true}
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