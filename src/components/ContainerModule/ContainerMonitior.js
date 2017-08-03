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

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
let metricsInterval;

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
      const { cluster, containerName, loadContainerAllOfMetrics } = this.props
      this.setState({
        intervalStatus: true
      })
      metricsInterval = setInterval(() => {
        loadContainerAllOfMetrics(cluster, containerName, query)
      }, 60000);
    }
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, diskReadIo, diskWriteIo, allcontainermetrics } = this.props
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
    if(allcontainermetrics.data.length > 0) {
      showCpu.data.push(allcontainermetrics.data[0].cpu);
      showCpu.isFetching = false;
      showMemory.data.push(allcontainermetrics.data[1].memory);
      showMemory.isFetching = false;
      showNetworkTrans.data.push(allcontainermetrics.data[2].networkTrans);
      showNetworkTrans.isFetching = false;
      showNetworkRec.data.push(allcontainermetrics.data[3].networkRec);
      showNetworkRec.isFetching = false;
      showDiskReadIo.data.push(allcontainermetrics.data[4].diskReadIo)
      showDiskReadIo.isFetching = false
      showDiskWriteIo.data.push(allcontainermetrics.data[5].diskWriteIo)
      showDiskWriteIo.isFetching = false
    } else {
      showCpu = cpu;
      showMemory = memory;
      showNetworkTrans = networkTransmitted;
      showNetworkRec = networkReceived;
      showDiskReadIo = diskReadIo
      showDiskWriteIo = diskWriteIo
    }
    return (
      <div id="ContainerMonitior">
        <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
        <Metrics
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