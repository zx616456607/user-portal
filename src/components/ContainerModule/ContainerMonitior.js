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
import { FormattedMessage } from 'react-intl'
import { AppServiceDetailIntl } from '../AppModule/ServiceIntl'
import NotificationHandler from '../../components/Notification'
import { getDeepValue } from "../../../client/util/util"

const RadioGroup = Radio.Group;

const timeFrequency = {
  '1': {
    'second': 1000 * 60,
    'timeDes': <FormattedMessage {...AppServiceDetailIntl.oneMinute}/>
  },
  '6': {
    'second': 1000 * 60 * 5,
    'timeDes': <FormattedMessage {...AppServiceDetailIntl.fiveMinute}/>
  },
  '24': {
    'second': 1000 * 60 * 20,
    'timeDes': <FormattedMessage {...AppServiceDetailIntl.twentyMinute}/>
  },
  '168': {
    'second': 1000 * 60 * 60 * 2,
    'timeDes': <FormattedMessage {...AppServiceDetailIntl.twoHour}/>
  },
  '720': {
    'second': 1000 * 60 * 60 * 6,
    'timeDes': <FormattedMessage {...AppServiceDetailIntl.sixHour}/>
  }
}


class ContainerMonitior extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.setIntervalFunc = this.setIntervalFunc.bind(this)
    const { formatMessage } = this.props.intl
    this.state = {
      intervalStatus: false,
      freshTime: formatMessage(AppServiceDetailIntl.oneMinute),
      switchCpu: false,
      switchMemory: false,
      switchNetwork: false,
      switchDisk: false,
      currentValue: '1',
      currentStart: this.changeTime('1'),
    }
  }
  getMetricsCpu() {
    const { loadContainerMetricsCPU, cluster, containerName } = this.props
    loadContainerMetricsCPU(cluster, containerName, {start: this.changeTime(1), end: new Date().toISOString(), source: 'prometheus'}, {
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
    loadContainerMetricsMemory(cluster, containerName, {start: this.changeTime(1), end: new Date().toISOString(), source: 'prometheus'}, {
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
    return new Promise(resolve => {
      loadContainerMetricsNetworkReceived(cluster, containerName, {start: this.changeTime(1), end: new Date().toISOString(), source: 'prometheus'}, {
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
    return new Promise(resolve => {
      loadContainerMetricsNetworkTransmitted(cluster, containerName, {start: this.changeTime(1), end: new Date().toISOString(), source: 'prometheus'}, {
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
    return new Promise(resolve => {
      loadContainerMetricsDiskRead(cluster, containerName, {start: this.changeTime(1), end: new Date().toISOString()}, {
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
    return new Promise(resolve => {
      loadContainerMetricsDiskWrite(cluster, containerName, {start: this.changeTime(1), end: new Date().toISOString()}, {
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
          this.getMetricsCpu()
          this.cpuInterval = setInterval(() => {
            this.getMetricsCpu()
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Memory':
        clearInterval(this.memoryInterval)
        if (flag) {
          this.getMetricsMemory()
          this.memoryInterval = setInterval(() => {
            this.getMetricsMemory()
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Network':
        clearInterval(this.networkRxInterval)
        clearInterval(this.networkTxInterval)
        if (flag) {
          Promise.all([this.getMetricsNetworkRx(), this.getMetricsNetworkTx()]).then(() => {
            this.setState({
              NetworkLoading: false
            })
          })
          this.networkRxInterval = setInterval(() => {
            this.getMetricsNetworkRx()
          }, LOAD_INSTANT_INTERVAL)
          this.networkTxInterval = setInterval(() => this.getMetricsNetworkTx(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.diskReadInterval)
        clearInterval(this.diskWriteInterval)
        if (flag) {
          Promise.all([this.getMetricsDiskRead(), this.getMetricsDiskWrite()]).then(() => {
            this.setState({
              DiskLoading: false
            })
          })
          this.diskReadInterval = setInterval(() => {
            this.getMetricsDiskRead()
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

  loadAllMetrics = query => {
    const { loadContainerAllOfMetrics, cluster, containerName } = this.props
    const notify = new NotificationHandler()
    loadContainerAllOfMetrics(cluster, containerName, query, {
      failed: {
        func: err => {
          if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
            notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
          }
        }
      }
    })
  }

  handleTimeChange(e) {
    const {value} = e.target
    const start = this.changeTime(value)
    const { formatMessage } = this.props.intl
    const timeFrequency = {
      '1': {
        'second': 1000 * 60,
        'timeDes': formatMessage(AppServiceDetailIntl.oneMinute)
      },
      '6': {
        'second': 1000 * 60 * 5,
        'timeDes': formatMessage(AppServiceDetailIntl.fiveMinute)
      },
      '24': {
        'second': 1000 * 60 * 20,
        'timeDes': formatMessage(AppServiceDetailIntl.twentyMinute)
      },
      '168': {
        'second': 1000 * 60 * 60 * 2,
        'timeDes': formatMessage(AppServiceDetailIntl.twoHour)
      },
      '720': {
        'second': 1000 * 60 * 60 * 6,
        'timeDes': formatMessage(AppServiceDetailIntl.sixHour)
      }
    }
    const timeDes = timeFrequency[value]['timeDes']
    this.setState({
      currentStart: start,
      freshTime: timeDes,
      currentValue: value
    }, () => {
      const { currentValue } = this.state
      const query = { start: this.changeTime(currentValue), end: new Date().toISOString() }
      this.loadAllMetrics(query)
      this.setIntervalFunc()
    })
  }

  componentDidMount() {
    const { currentValue } = this.state
    const query = { start: this.changeTime(currentValue), end: new Date().toISOString() }
    this.loadAllMetrics(query)
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
    const { currentValue } = this.state
    clearInterval(this.metricsInterval)
    this.metricsInterval = setInterval(() => {
      this.setState({
        currentStart: this.changeTime(currentValue)
      }, () => {
        const { currentStart } = this.state
        let query = {start: currentStart, end: new Date().toISOString()};
        this.loadAllMetrics(query)
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
          diskHide={false}
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
