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
import {formatDate} from "../../../common/tools";

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
      switchDisk: false,
      currentStart: this.changeTime('1'),
      currentValue: '1',
      instantValue: 30
    }
  }

  getServiceCpu() {
    const { loadServiceMetricsCPU, cluster, serviceName } = this.props
    const { currentCpuStart } = this.state
    loadServiceMetricsCPU(cluster, serviceName, {start: currentCpuStart}, {
      finally: {
        func: () => {
          this.setState({
            CpuLoading: false
          })
        }
      }
    })
  }
  getServiceMemory() {
    const { loadServiceMetricsMemory, cluster, serviceName } = this.props
    const { currentMemoryStart } = this.state
    loadServiceMetricsMemory(cluster, serviceName, {start: currentMemoryStart}, {
      finally: {
        func: () => {
          this.setState({
            MemoryLoading: false
          })
        }
      }
    })
  }
  getServiceNetworkRx() {
    const { loadServiceMetricsNetworkReceived, cluster, serviceName } = this.props
    const { currentNetworkStart } = this.state
    return new Promise(resolve => {
      loadServiceMetricsNetworkReceived(cluster, serviceName, {start: currentNetworkStart}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getServiceNetworkTx() {
    const { loadServiceMetricsNetworkTransmitted, cluster, serviceName } = this.props
    const { currentNetworkStart } = this.state
    return new Promise(resolve => {
      loadServiceMetricsNetworkTransmitted(cluster, serviceName, {start: currentNetworkStart}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getServiceDiskRead() {
    const { loadServiceMetricsDiskRead, cluster, serviceName } = this.props
    const { currentDiskStart } = this.state
    return new Promise(resolve => {
      loadServiceMetricsDiskRead(cluster, serviceName, {start: currentDiskStart}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getServiceDiskWrite() {
    const { loadServiceMetricsDiskWrite, cluster, serviceName } = this.props
    const { currentDiskStart } = this.state
    return new Promise(resolve => {
      loadServiceMetricsDiskWrite(cluster, serviceName, {start: currentDiskStart}, {
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
            this.getServiceCpu()
          })
          this.cpuInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getServiceCpu()
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
            this.getServiceMemory()
          })
          this.memoryInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getServiceMemory()
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
            Promise.all([this.getServiceNetworkRx(), this.getServiceNetworkTx()]).then(() => {
              this.setState({
                NetworkLoading: false
              })
            })
          })
          this.networkRxInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getServiceNetworkRx()
            })
          }, LOAD_INSTANT_INTERVAL)
          this.networkTxInterval = setInterval(() => this.getServiceNetworkTx(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.diskReadInterval)
        clearInterval(this.diskWriteInterval)
        if (flag) {
          this.setState({
            [`current${type}Start`]: this.changeMinutes(instantValue)
          }, () => {
            Promise.all([this.getServiceDiskRead(), this.getServiceDiskWrite()]).then(() => {
              this.setState({
                DiskLoading: false
              })
            })
          })
          this.diskReadInterval = setInterval(() => {
            this.setState({
              [`current${type}Start`]: this.changeMinutes(instantValue)
            }, () => {
              this.getServiceDiskRead()
            })
          }, LOAD_INSTANT_INTERVAL)
          this.diskWriteInterval = setInterval(() => this.getServiceDiskWrite(), LOAD_INSTANT_INTERVAL)
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
    const { loadServiceAllOfMetrics, cluster, serviceName } = this.props
    const {value} = e.target
    const start = this.changeTime(value)
    const timeDes = timeFrequency[value]['timeDes']
    this.setState({
      currentStart: start,
      freshTime: timeDes,
      currentValue: value
    }, () => {
      const { currentValue } = this.state
      loadServiceAllOfMetrics(cluster, serviceName, { start: this.changeTime(currentValue) })
      this.setIntervalFunc()
    })
  }

  componentWillMount() {
    const { loadServiceAllOfMetrics, cluster, serviceName } = this.props
    const { currentValue } = this.state
    loadServiceAllOfMetrics(cluster, serviceName, { start: this.changeTime(currentValue)})
    this.setIntervalFunc()
  }

  componentWillReceiveProps(nextProps) {
    const { cluster, serviceName, loadServiceAllOfMetrics } = nextProps
    const { currentValue } = this.state
    if (serviceName === this.props.serviceName) {
      return
    }
    loadServiceAllOfMetrics(cluster, serviceName, { start: this.changeTime(currentValue)})
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
    const { cluster, serviceName, loadServiceAllOfMetrics } = this.props
    const { currentValue } = this.state
    clearInterval(this.metricsInterval)
    this.metricsInterval = setInterval(() => {
      this.setState({
        currentStart: this.changeTime(currentValue)
      }, () => {
        const { currentStart } = this.state
        let query = {start: currentStart};
        loadServiceAllOfMetrics(cluster, serviceName, query)
      })
    }, UPDATE_INTERVAL);
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
        <div className="serviceInnerMonitor">
          <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
          <Metrics
            scope={this}
            diskHide={false}
            events='AppServiceDetail'
            cpu={showCpu}
            memory={showMemory}
            networkReceived={showNetworkRec}
            networkTransmitted={showNetworkTrans}
            diskReadIo={showDiskReadIo}
            diskWriteIo={showDiskWriteIo}
          />
        </div>
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