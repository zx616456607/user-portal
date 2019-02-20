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
import { Row, Col, Popover, Icon } from 'antd'
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
import isEmpty from 'lodash/isEmpty'
import SelectWithCheckbox from '@tenx-ui/select-with-checkbox/lib/index'
import '@tenx-ui/select-with-checkbox/assets/index.css'
import { UPDATE_INTERVAL, LOAD_INSTANT_INTERVAL } from '../../../constants'
import './style/ServiceMonitor.less'
import { serviceNameCutForMetric } from '../../../common/tools'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import NotificationHandler from '../../../common/notification_handler'
import { getDeepValue } from "../../../../client/util/util"

class ServiceMonitior extends Component {
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
      currentStart: this.changeTime('1'),
      currentValue: '1',
      checkedKeys: [],
    }
  }

  getServiceCpu() {
    const { loadServiceMetricsCPU, cluster, serviceName } = this.props
    loadServiceMetricsCPU(cluster, serviceName, {start: this.changeTime(1), end: new Date().toISOString()}, {
      failed: {
        func: err => {
          if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
            notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
          }
        }
      },
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
    loadServiceMetricsMemory(cluster, serviceName, {start: this.changeTime(1), end: new Date().toISOString()}, {
      failed: {
        func: err => {
          if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
            notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
          }
        }
      },
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
    return new Promise(resolve => {
      loadServiceMetricsNetworkReceived(cluster, serviceName, {start: this.changeTime(1), end: new Date().toISOString()}, {
        failed: {
          func: err => {
            if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
              notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
            }
          }
        },
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
    return new Promise(resolve => {
      loadServiceMetricsNetworkTransmitted(cluster, serviceName, {start: this.changeTime(1), end: new Date().toISOString()}, {
        failed: {
          func: err => {
            if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
              notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
            }
          }
        },
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
    return new Promise(resolve => {
      loadServiceMetricsDiskRead(cluster, serviceName, {start: this.changeTime(1), end: new Date().toISOString()}, {
        failed: {
          func: err => {
            if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
              notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
            }
          }
        },
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
    return new Promise(resolve => {
      loadServiceMetricsDiskWrite(cluster, serviceName, {start: this.changeTime(1), end: new Date().toISOString()}, {
        failed: {
          func: err => {
            if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
              notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
            }
          }
        },
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
          this.getServiceCpu()
          this.cpuInterval = setInterval(() => {
            this.getServiceCpu()
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Memory':
        clearInterval(this.memoryInterval)
        if (flag) {
          this.getServiceMemory()
          this.memoryInterval = setInterval(() => {
            this.getServiceMemory()
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Network':
        clearInterval(this.networkRxInterval)
        clearInterval(this.networkTxInterval)
        if (flag) {
          Promise.all([this.getServiceNetworkRx(), this.getServiceNetworkTx()]).then(() => {
            this.setState({
              NetworkLoading: false
            })
          })
          this.networkRxInterval = setInterval(() => {
            this.getServiceNetworkRx()
          }, LOAD_INSTANT_INTERVAL)
          this.networkTxInterval = setInterval(() => this.getServiceNetworkTx(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.diskReadInterval)
        clearInterval(this.diskWriteInterval)
        if (flag) {
          Promise.all([this.getServiceDiskRead(), this.getServiceDiskWrite()]).then(() => {
            this.setState({
              DiskLoading: false
            })
          })
          this.diskReadInterval = setInterval(() => {
            this.getServiceDiskRead()
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
      this.setIntervalFunc()
    })
  }

  componentWillMount() {
    this.setIntervalFunc(true)
  }

  componentWillReceiveProps(nextProps) {
    const { serviceName } = nextProps
    if (serviceName === this.props.serviceName) {
      return
    }
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

  setIntervalFunc(isFirst) {
    const { cluster, serviceName, loadServiceAllOfMetrics } = this.props
    const { currentValue } = this.state
    const notify = new NotificationHandler()
    const query = {
      start: this.changeTime(currentValue),
      end: new Date().toISOString(),
    }
    clearInterval(this.metricsInterval)
    loadServiceAllOfMetrics(cluster, serviceName, query, {
      failed: {
        func: err => {
          if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
            notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
          }
        }
      }
    }).then(res => {
      const { data } = res.response.result
      if (!isEmpty(data)) {
        const { cpu } = data[0]
        const containers = cpu.map(_item => ({ name: serviceNameCutForMetric(_item.containerName) }))
        this.setState({
          containers,
        })
        if (isFirst) {
          this.setState({
            filterContainers: containers,
          })
          const checkedContainers = containers.length > 10 ? containers.slice(0, 10) : containers
          const checkedKeys = checkedContainers.map(_item => _item.name)
          this.setState({
            checkedKeys,
          })
        }
      }
    })
    this.metricsInterval = setInterval(() => {
      this.setState({
        currentStart: this.changeTime(currentValue)
      }, () => {
        const { currentStart } = this.state
        let query = {start: currentStart};
        loadServiceAllOfMetrics(cluster, serviceName, query, {
          failed: {
            func: err => {
              if (err.statusCode === 404 && getDeepValue(err, ['message', 'message'])) {
                notify.warn('该集群未安装 prometheus', '请联系基础设施管理员安装')
              }
            }
          }
        }).then(res => {
          const { data } = res.response.result
          if (!isEmpty(data)) {
            const {cpu} = data[0]
            const containers = cpu.map(_item => ({ name: serviceNameCutForMetric(_item.containerName) }))
            this.setState({
              containers,
            })
          }
        })
      })
    }, UPDATE_INTERVAL);
  }

  toggleVisible = () => {
    this.setState(({ visible }) => ({
      visible: !visible,
    }))
  }

  renderContent = () => {
    const { checkedKeys, value, filterContainers } = this.state
    return <SelectWithCheckbox
      type="checkBox"
      dataSource={filterContainers}
      nameKey={'name'}
      checkedKeys={checkedKeys}
      value={value}
      onChange={this.monitorFilterOnChange}
      onCheck={this.monitorFilterOnSelect}
      onOk={this.monitorFilterConfirm}
      onReset={this.monitorFilterReset}
    />
  }

  monitorFilterOnChange = value => {
    const { containers } = this.state
    this.setState({
      value,
      filterContainers: containers.filter(_item => _item.name.includes(value))
    })
  }

  monitorFilterOnSelect = item => {
    const { checkedKeys } = this.state
    let keys = new Set(checkedKeys)
    if (keys.has(item.name)) {
      keys.delete(item.name)
    } else {
      keys.add(item.name)
    }
    this.setState({
      checkedKeys: [...keys],
    })
  }

  monitorFilterConfirm = () => {
    this.setState({
      visible: false,
    })
  }

  monitorFilterReset = () => {
    this.setState({
      checkedKeys: [],
    })
  }

  filterMetrics = data => {
    const { checkedKeys } = this.state
    return data.filter(_item => checkedKeys.includes(serviceNameCutForMetric(_item.containerName)))
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, diskReadIo, diskWriteIo, allServiceMetrics } = this.props
    const { switchCpu, switchMemory, switchNetwork, switchDisk, visible, checkedKeys } = this.state
    const { formatMessage } = this.props.intl
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
      switchCpu ? showCpu = { isFetching: cpu.isFetching, data: this.filterMetrics(cpu.data) }
        : showCpu.data = this.filterMetrics(allServiceMetrics.data[0].cpu)
      switchMemory ? showMemory = { isFetching: memory.isFetching, data: this.filterMetrics(memory.data) }
        : showMemory.data = this.filterMetrics(allServiceMetrics.data[1].memory)
      if (switchNetwork) {
        showNetworkRec = { isFetching: networkReceived.isFetching, data: this.filterMetrics(networkReceived.data) }
        showNetworkTrans = { isFetching: networkTransmitted.isFetching, data: this.filterMetrics(networkTransmitted.data) }
      } else {
        showNetworkRec.data = this.filterMetrics(allServiceMetrics.data[3].networkRec)
        showNetworkTrans.data = this.filterMetrics(allServiceMetrics.data[2].networkTrans)
      }
      if (switchDisk) {
        showDiskReadIo = { isFetching: diskReadIo.isFetching, data: this.filterMetrics(diskReadIo.data) }
        showDiskWriteIo = { isFetching: diskWriteIo.isFetching, data: this.filterMetrics(diskWriteIo.data) }
      } else {
        showDiskReadIo.data = this.filterMetrics(allServiceMetrics.data[4].diskReadIo)
        showDiskWriteIo.data = this.filterMetrics(allServiceMetrics.data[5].diskWriteIo)
      }
    }
    return (
      <div id="ServiceMonitior">
        <div className="serviceInnerMonitor">
          <Row type="flex" align={"middle"} justify={"space-around"}>
            <Col span={6} id="popover-wrapper" style={{ paddingLeft: 8 }}>
              <Popover
                content={this.renderContent()}
                placement={'bottom'}
                trigger={'click'}
                visible={visible}
                overlayClassName="monitor-filter-content"
                onVisibleChange={this.toggleVisible}
                getTooltipContainer={() => document.getElementById('popover-wrapper')}
              >
            <span className="themeColor pointer">
              <Icon type="filter" /> <span>{formatMessage(AppServiceDetailIntl.filterObject, {
              length: checkedKeys.length
            })}</span>
            </span>
              </Popover>
            </Col>
            <Col span={18}>
              <TimeControl onChange={this.handleTimeChange}/>
            </Col>
          </Row>
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
            isService={true}
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

export default injectIntl(connect(mapStateToProps, {
  loadServiceMetricsCPU,
  loadServiceMetricsMemory,
  loadServiceMetricsNetworkReceived,
  loadServiceMetricsNetworkTransmitted,
  loadServiceAllOfMetrics,
  loadServiceMetricsDiskRead,
  loadServiceMetricsDiskWrite,
})(ServiceMonitior), { withRef: true, })
