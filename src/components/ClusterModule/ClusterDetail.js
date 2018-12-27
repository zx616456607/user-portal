/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster detail component
 *
 * v0.1 - 2017-3-3
 * @author BaiYu
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Icon, Button, Card, Tabs, Table, Input, Spin, Row, Col, Dropdown, Menu, Modal, Progress, Switch, Tag, Tooltip } from 'antd'
import {
  getNodesPodeList, loadHostMetrics, searchPodeList,
  loadHostCpu, loadHostMemory, loadHostRxrate, loadHostTxrate,
  loadHostDiskReadIo, loadHostDiskWriteIo
} from '../../actions/cluster'
import './style/ClusterDetail.less'
import hostImg from '../../assets/img/integration/host.png'
import { formatDate, calcuDate, getHostLastHeartbeatTime } from '../../common/tools'
import { LABEL_APPNAME } from '../../constants'
import NotificationHandler from '../../components/Notification'
import { getHostInfo } from '../../actions/cluster'
import { changeClusterNodeSchedule, getNodeLabels} from '../../actions/cluster_node'
import TimeControl from '../Metrics/TimeControl'
import Metrics from '../Metrics'
import { camelize } from 'humps'
import QueueAnim from 'rc-queue-anim'
import AlarmStrategy from '../ManageMonitor/AlarmStrategy'
import ManageLabelModal from './MangeLabelModal'
import Title from '../Title'
import { UPDATE_INTERVAL, LOAD_INSTANT_INTERVAL } from '../../constants'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { injectIntl, FormattedMessage } from 'react-intl'
import intlMsg from './ClusterDetailIntl'
import { getDeepValue } from '../../../client/util/util';

const TabPane = Tabs.TabPane

let HostInfo = React.createClass({
  getInitialState(){
    return {
      manageLabelModal : false,
      nodeLabel: {}
    }
  },
  componentWillMount() {
    const { func } = this.props
    func.getNodeLabels(func.clusterID,func.nodeName, {
      success: {
        func:(ret)=> {
          this.setState({nodeLabel: JSON.parse(ret.raw)})
        }
      }
    })
  },
  reloadList() {
    const { scope, intl: { formatMessage } } = this.props
    const { clusterID, clusterName } = scope.props
    scope.props.getNodesPodeList({ clusterID, clusterName }, {
      success: {
        func: (ret) => {
          new NotificationHandler().success(formatMessage(intlMsg.refreshSuccess))
          scope.setState({ foreverPodNumber: ret.pods.length})
        }
      }
    })
  },
  checkedState(type) {
    switch (type) {
      case 'Succeeded': {
        return <div style={{ color: '#33b867' }}><i className="fa fa-circle"></i> <FormattedMessage {...intlMsg.running}/></div>
      }
      case 'Running': {
        return <div style={{ color: '#33b867' }}><i className="fa fa-circle"></i> <FormattedMessage {...intlMsg.running}/></div>
      }
      case 'Failed': {
        return <div style={{ color: '#f23e3f' }}><i className="fa fa-circle"></i> <FormattedMessage {...intlMsg.fail}/></div>
      }
      default: {
        return <div style={{ color: '#0b9eeb' }}><i className="fa fa-circle"></i> <FormattedMessage {...intlMsg.booting}/></div>
      }
    }
  },
  setSearchState(podname) {
    this.setState({podname})
    const _this = this
    if (podname =='') {
      setTimeout(function() {
        _this.handSearch()
      }, 500);
    }
  },
  handSearch() {
    let podname = this.state.podname.trim()
    const { scope } = this.props
    scope.props.searchPodeList(podname)
  },
  formTagContainer(){
    const label = []
    const {nodeLabel} = this.props.func
    for (let key in nodeLabel) {
      label.push(
        <Tag color="blue" className='tag' key={key}>
            <Tooltip title={key}>
              <span className='key'>{key}</span>
            </Tooltip>
            <span className='point'>：</span>
            <Tooltip title={nodeLabel[key]}>
              <span className='value'>{nodeLabel[key]}</span>
            </Tooltip>
        </Tag>
      )
    }

    return label
  },
  handleManageLabelModal(){
    this.setState({
      manageLabelModal: true
    })
  },
  callbackManageLabelModal(){
    this.setState({
      manageLabelModal: false,
      nodeLabel:this.props.func.nodeLabel
    })
  },
  render() {
    const { intl: { formatMessage } } = this.props
    const columns = [{
        title: formatMessage(intlMsg.containerName),
        dataIndex: 'objectMeta.name',
        key: 'name',
        width:'200px',
      }, {
        title: formatMessage(intlMsg.status),
        dataIndex: 'podPhase',
        width:'8%',
        key: 'success',
        render: (text) => this.checkedState(text)
      }, {
        title: formatMessage(intlMsg.namespace),
        dataIndex: 'objectMeta.namespace',
        key: 'address',
      }, {
        title: formatMessage(intlMsg.belongApp),
        dataIndex: `objectMeta.labels`,
        width:'70px',
        key: 'apply',
        render: (text) => {
          if (text && text[LABEL_APPNAME]) {
            return (<div>{text[LABEL_APPNAME]}</div>)
          }
          return '--'
        }
      },
      {
        title: formatMessage(intlMsg.iamge),
        dataIndex: 'podSpec.containers',
        width:'25%',
        key: 'container',
        render: (data) => data[0].image
      },
      {
        title: formatMessage(intlMsg.accessAddress),
        dataIndex: 'podIP',
        key: 'url',
        render: (text) => {
          if (text) {
            return text
          }
          return '--'
        }
      },
      {
        title: formatMessage(intlMsg.createTime),
        dataIndex: 'objectMeta.creationTimestamp',
        render: (text) => formatDate(text)
      }
    ];

    const { hostInfo, podeList, foreverPodNumber,func } = this.props
    // Get requested CPU/memory from pod list
    var totalRequestedMemory = 0, totalRequestedCPU = 0
    if (podeList && podeList.length > 0) {
      podeList.forEach(function(pod) {
        pod.podSpec.containers.forEach(function(container) {
          if (container.resources) {
            if (container.resources.requests) {
              if (container.resources.requests.memory) {// Convert to Ki
                if (container.resources.requests.memory.endsWith("Mi") > 0) {
                  totalRequestedMemory += parseInt(container.resources.requests.memory.replace("Mi", "")) * 1024
                }
                if (container.resources.requests.memory.endsWith("Gi") > 0) {// Convert to Ki
                  totalRequestedMemory += parseInt(container.resources.requests.memory.replace("Gi", "")) * 1024 * 1024
                }
                if (container.resources.requests.memory.endsWith("M") > 0) {
                  totalRequestedMemory += parseInt(container.resources.requests.memory.replace("M", "")) * 1024
                }
                if (container.resources.requests.memory.endsWith("G") > 0) {// Convert to Ki
                  totalRequestedMemory += parseInt(container.resources.requests.memory.replace("G", "")) * 1024 * 1024
                }
              }
              if (container.resources.requests.cpu) {
                if (container.resources.requests.cpu.endsWith("m") > 0) {
                  totalRequestedCPU += parseInt(container.resources.requests.cpu.replace("m", ""))
                } else {
                  totalRequestedCPU += parseInt(container.resources.requests.cpu) * 1000
                }
              }
            }
          }
        })
      })
    }
    const memTotal = isNaN(hostInfo[camelize('MemoryAllocatable')] /1024) ?
      '' :
      Math.floor(hostInfo[camelize('MemoryAllocatable')] / 1024 / 1024 *100) /100
    const useMem = (totalRequestedMemory / hostInfo[camelize('MemoryAllocatable')] *100).toFixed(2)
    return (
      <QueueAnim className="ClusterDetail">
        <div className="hostInfo" key="ClusterDetail">
          <div className="topTitle" style={{marginTop:'20px',marginBottom: 10}}><FormattedMessage {...intlMsg.hostInfo}/></div>
          <div className="wrapRow">
            <div className="host-list">
              <div className="titles"><div className="quotaimg">
                <TenxIcon type="resource-quota" size={14} style={{marginRight: 4}}/>
              </div> <FormattedMessage {...intlMsg.resourceQuota}/></div>
              <br />
              <Row className="items">
                <Col span={8}><span className="keys resources">CPU：</span><span className="valus">{ hostInfo.cPUAllocatable }m（{ hostInfo.cPUAllocatable / 1000}<FormattedMessage {...intlMsg.CPUCore}/>）</span></Col>
                <Col span={10}><Progress percent={ Math.min(totalRequestedCPU * 100 /hostInfo.cPUAllocatable, 100) } showInfo={false} strokeWidth={8} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; <FormattedMessage {...intlMsg.assigned}/> { (totalRequestedCPU * 100 /hostInfo.cPUAllocatable|| 0).toFixed(2) } %</Col>
              </Row>
              <Row className="items">
                <Col span={8}><span className="keys resources"><FormattedMessage {...intlMsg.memory}/>：</span><span className="valus">{ memTotal } GB</span></Col>
                <Col span={10}><Progress percent={ Math.min(useMem, 100) } strokeWidth={8} showInfo={false} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; <FormattedMessage {...intlMsg.assigned}/> { useMem } %</Col>

              </Row>
              <Row className="items">
                <Col span={8}><span className="keys resources"><FormattedMessage {...intlMsg.container}/>：</span><span className="valus">
                  <FormattedMessage {...intlMsg.podCap} values={{ podCap: hostInfo.podCap }}/>
                </span></Col>
                <Col span={10}><Progress percent={ Math.round(foreverPodNumber / hostInfo.podCap *100) } strokeWidth={8} showInfo={false} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; <FormattedMessage {...intlMsg.foreverPodNumber} values={{ foreverPodNumber }}/></Col>

              </Row>
            </div>

            <div className="host-list Versionin">
              <div className="titles">
                <TenxIcon className="svg-icon" type="tag-right" size={14} style={{marginRight: 4}}/>
                <FormattedMessage {...intlMsg.versionInfo}/></div>
              <br />
              <Row className="items versioninformation">
                <Col span={12} className='col_style'><FormattedMessage {...intlMsg.coreVersion}/>： {hostInfo.versions ? hostInfo.versions.kernel : ''}</Col>
                <Col span={12} className='col_style'><FormattedMessage {...intlMsg.kubeletVersion}/>： {hostInfo.versions ? hostInfo.versions.kubelet : ''}</Col>
              </Row>
              <Row className="items versioninformation">
                <Col span={12} className='col_style'><FormattedMessage {...intlMsg.dockerVersion}/>： {hostInfo.versions ? hostInfo.versions.docker.replace('docker://','') : ''}</Col>
                <Col span={12} className='col_style'>kube-proxy： {hostInfo.versions ? hostInfo.versions.kubeProxy : ''}</Col>
              </Row>
            </div>

            <div className="host-list">
              <div className="titles">
                <TenxIcon className="size select" type="tag-right" size={14} />
                <FormattedMessage {...intlMsg.labelInfo}/> <Button className='manageLabelButton' type="ghost" onClick={this.handleManageLabelModal}><Icon type="setting" /><FormattedMessage {...intlMsg.manageLabel}/></Button></div>
              <br />
              <div className='labelContainer'>
                {this.formTagContainer()}
              </div>
            </div>

            <ManageLabelModal
              manageLabelModal={this.state.manageLabelModal}
              callback={this.callbackManageLabelModal}
              userCreateLabel= { func.nodeLabel }
              nodeName={ func.nodeName }
              clusterID= { func.clusterID }
              labels={[this.state.nodeLabel]}
              isNode={true}
              footer={false}
            />
          </div>
          <div className="topTitle"><FormattedMessage {...intlMsg.containerDetail}/></div>
          <div className="containers">
            <Button onClick={() => this.reloadList()} type="primary" size="large"><i className="fa fa-refresh"></i> <FormattedMessage {...intlMsg.refresh}/></Button>
            <span className="inputGroup">
              <Input placeholder={formatMessage(intlMsg.search)} size="large" onChange={(e)=> this.setSearchState(e.target.value)} onPressEnter={()=> this.handSearch()}/>
              <Icon type="search" onClick={()=> this.handSearch()} />
            </span>
            <Table className="dataTable" pagination={{ pageSize: 10, showSizeChanger: true, total: podeList.length }} loading={this.props.hostInfo.isFetching} columns={columns} dataSource={podeList} />
          </div>
        </div>
      </QueueAnim>
    )
  }
})

const timeFrequency = (formatMessage, value, time) => {
  const obj = {
    '1': {
      'second': 1000 * 60,
      'timeDes': formatMessage(intlMsg.oneMinute)
    },
    '6': {
      'second': 1000 * 60 * 5,
      'timeDes': formatMessage(intlMsg.fiveMinutes)
    },
    '24': {
      'second': 1000 * 60 * 20,
      'timeDes': formatMessage(intlMsg.twentyMinutes)
    },
    '168': {
      'second': 1000 * 60 * 60 * 2,
      'timeDes': formatMessage(intlMsg.twoHours)
    },
    '720': {
      'second': 1000 * 60 * 60 * 6,
      'timeDes': formatMessage(intlMsg.sixHours)
    }
  }
  return obj[value][time]
}

class ClusterDetail extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    const { intl: { formatMessage } } = this.props
    this.state = {
      schedulable: false,
      foreverPodNumber: 0,
      activeTabKey: 'info',
      alarmOpen: false,
      freshTime: formatMessage(intlMsg.oneMinute),
      switchCpu: false,
      switchMemory: false,
      switchNetwork: false,
      switchDisk: false,
      currentValue: '1',
      currentStart: this.changeTime('1'),
    }
  }
  componentWillMount() {
    const { clusterID, clusterName,location } = this.props
    const { currentValue } = this.state
    //this.setState({activeTabKey:tab || 'info'})
    const body = {
      clusterID,
      clusterName
    }
    this.props.getHostInfo(body, {
      success: {
        func:(res)=> {
          this.setState({schedulable: res.schedulable})
        }
      }
    })

    //loadHostInstant(body)

    this.props.getNodesPodeList({ clusterID, clusterName }, {
      success: {
        func:(ret) => {
          this.setState({foreverPodNumber: ret.pods.length})
        }
      }
    })

    this.loadData(this.props, { start: this.changeTime(currentValue), end: new Date().toISOString() })
    this.changeTimeInterval = setInterval(() => {
      this.setState({
        currentStart: this.changeTime(currentValue)
      }, () => {
        const { currentStart} = this.state
        this.loadData(this.props, { start: currentStart, end: new Date().toISOString() })
      })
    }, UPDATE_INTERVAL)

    let { tab , open } = location.query
    if (tab) {
      if(open) {
        this.setState({alarmOpen: open})
      }
      this.setState({activeTabKey: tab},()=>{
        browserHistory.push(`/cluster/${clusterID}/${clusterName}`)
      })
    }
  }
  componentWillUnmount() {
    clearInterval(this.changeTimeInterval)
    clearInterval(this.cpuInterval)
    clearInterval(this.memoryInterval)
    clearInterval(this.rxRateInterval)
    clearInterval(this.txRateInterval)
    clearInterval(this.readIoInterval)
    clearInterval(this.writeIoInterval)
  }
  loadData(props, query) {
    const { clusterID, clusterName, loadHostMetrics } = props
    const body = { clusterID, clusterName }
    loadHostMetrics(body, query)
  }

  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { clusterID, changeClusterNodeSchedule, intl: { formatMessage } } = this.props;
    const _this = this
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: ()=> {
          // notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
          notification.success(e ? formatMessage(intlMsg.openDispatchSuccess) : formatMessage(intlMsg.closeDispatchSuccess));
          _this.setState({
            schedulable: e
          })
        },
        isAsync: true
      },
      failed:{
        func: (ret)=> {
          let message = ret.message.message ? ret.message.message: ret.message
          notification.error(e ? formatMessage(intlMsg.openDispatchFail) : formatMessage(intlMsg.closeDispatchFail), message);

          _this.setState({
            schedulable: !e
          })
        }
      }
    })
  }
  getHostCpu() {
    const { loadHostCpu, clusterID, clusterName } = this.props
    loadHostCpu({clusterID, clusterName}, {start: this.changeTime(1), end: new Date().toISOString(), source: 'influxdb'}, {
      success: {
        func: () => {
          this.setState({
            CpuLoading: false
          })
        }
      },
      failed: {
        func: () => {
          this.setState({
            CpuLoading: false
          })
        }
      }
    })
  }
  getHostMemory() {
    const { loadHostMemory, clusterID, clusterName } = this.props
    loadHostMemory({clusterID, clusterName}, {start: this.changeTime(1), end: new Date().toISOString(), source: 'influxdb'}, {
      success: {
        func: () => {
          this.setState({
            MemoryLoading: false
          })
        }
      },
      failed: {
        func: () => {
          this.setState({
            MemoryLoading: false
          })
        }
      }
    })
  }
  getHostRxrate() {
    const { loadHostRxrate, clusterID, clusterName } = this.props
    return new Promise((resolve, reject) => {
      loadHostRxrate({clusterID, clusterName}, {start: this.changeTime(1), end: new Date().toISOString(), source: 'influxdb'}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getHostTxrate() {
    const { loadHostTxrate, clusterID, clusterName } = this.props
    return new Promise((resolve, reject) => {
      loadHostTxrate({clusterID, clusterName}, {start: this.changeTime(1), end: new Date().toISOString(), source: 'influxdb'}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getHostReadIo() {
    const { loadHostDiskReadIo, clusterID, clusterName } = this.props
    return new Promise((resolve, reject) => {
      loadHostDiskReadIo({clusterID, clusterName}, {start: this.changeTime(1), end: new Date().toISOString(), source: 'influxdb'}, {
        finally: {
          func: () => {
            resolve()
          }
        }
      })
    })
  }
  getHostWriteIo() {
    const { loadHostDiskWriteIo, clusterID, clusterName } = this.props
    return new Promise((resolve, reject) => {
      loadHostDiskWriteIo({clusterID, clusterName}, {start: this.changeTime(1), end: new Date().toISOString(), source: 'influxdb'}, {
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
          this.cpuInterval = setInterval(() => {
            this.getHostCpu()
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Memory':
        clearInterval(this.memoryInterval)
        if (flag) {
          this.getHostMemory()
          this.memoryInterval = setInterval(() => {
            this.getHostMemory()
          }, LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Network':
        clearInterval(this.rxRateInterval)
        clearInterval(this.txRateInterval)
        if (flag) {
          Promise.all([this.getHostRxrate(), this.getHostTxrate()]).then(() => {
            this.setState({
              NetworkLoading: false
            })
          })
          this.rxRateInterval = setInterval(() => {
            this.getHostRxrate()
          }, LOAD_INSTANT_INTERVAL)
          this.txRateInterval = setInterval(() => this.getHostTxrate(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.readIoInterval)
        clearInterval(this.writeIoInterval)
        if (flag) {
          Promise.all([this.getHostReadIo(), this.getHostWriteIo()]).then(() => {
            this.setState({
              DiskLoading: false
            })
          })
          this.readIoInterval = setInterval(() => {
            this.getHostReadIo()
          }, LOAD_INSTANT_INTERVAL)
          this.writeIoInterval = setInterval(() => this.getHostWriteIo(), LOAD_INSTANT_INTERVAL)
        }
    }
  }
  changeTime(hours) {
    let d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  handleTimeChange(e) {
    const { value } = e.target
    const { intl: { formatMessage } } = this.props
    // const timeDes = timeFrequency[value]['timeDes']
    const timeDes = timeFrequency(formatMessage, value, 'timeDes')
    const start = this.changeTime(value)
    this.setState({
      currentStart: start,
      freshTime: timeDes,
      currentValue: value
    }, () => {
      const { currentValue, currentStart } = this.state
      clearInterval(this.changeTimeInterval)
      this.loadData(this.props, { start: currentStart, end: new Date().toISOString() })
      this.changeTimeInterval = setInterval(() => {
        this.setState({
          currentStart: this.changeTime(currentValue)
        }, () => {
          const { currentStart} = this.state
          this.loadData(this.props, { start: currentStart, end: new Date().toISOString() })
        })
      }, UPDATE_INTERVAL)
    })
  }

  formatMetrics(result, nodeName) {
    if (!result || !result.data) return {}
    let formatData = { data: [] }
    let metrics
    result.data.metrics && result.data.metrics.length && (metrics = result.data.metrics)
    formatData.data.push({metrics, containerName: nodeName})
    return formatData
  }

  renderStatus(hostInfo){
    const { intl: { formatMessage } } = this.props
    const { maintainStatus, current, total } = hostInfo.objectMeta.annotations || { maintainStatus: 'fetching', current: 0, total: 0 }
    let message = formatMessage(intlMsg.abnormal)
    let classname = 'errorSpan'
    if (hostInfo.ready === 'True') {
      if (hostInfo.objectMeta.annotations.maintenance === 'true') {
        message = formatMessage(intlMsg.maintaining)
        classname = 'themeColor'
      } else if (hostInfo.objectMeta.annotations.maintenance === 'failed') {
        message = formatMessage(intlMsg.migrateFail)
        classname = 'errorSpan'
      } else if (maintainStatus === 'processing') {
        message = formatMessage(intlMsg.serverMigrating)
        classname = 'themeColor'
      } else {
        message = formatMessage(intlMsg.running)
        classname = 'runningSpan'
      }
    }
    return (
      <span>
        <span className={classname}>
          <i className='fa fa-circle'/>&nbsp;&nbsp;{message}
          {
            maintainStatus === 'processing' &&
            <Tooltip
              title={formatMessage(intlMsg.notActWhenMigrating)}
            >
              <Icon type="exclamation-circle-o" />
            </Tooltip>
          }
        </span>
        {
          maintainStatus === 'processing' && <div>已迁移服务 <span>{total - current}</span>/{total}</div>
        }
      </span>
    )
  }
  render() {
    if (this.props.hostInfo.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const { freshTime, switchCpu, switchMemory, switchNetwork, switchDisk } = this.state
    const {
      clusterName, cpu, hostCpu, memory, hostMemory,
      networkReceived, hostNetworkRx, networkTransmitted, hostNetworkTx,
      diskReadIo, diskWriteIo, hostDiskReadIo, hostDiskWriteIo,
      tcpListen, tcpEst, tcpClose, tcpTime, intl: { formatMessage },
    } = this.props
    const hostInfo = this.props.hostInfo.result ? this.props.hostInfo.result : {objectMeta:{creationTimestamp:''}, address:' '}
    hostInfo.isFetching = this.props.isFetching
    const lastHeartbeatTime = getHostLastHeartbeatTime(hostInfo) || '-'
    const showCpu = switchCpu ? this.formatMetrics(hostCpu, clusterName) : this.formatMetrics(cpu, clusterName)
    const showMemory = switchMemory ? this.formatMetrics(hostMemory, clusterName): this.formatMetrics(memory, clusterName)
    const showNetworkRec = switchNetwork ? this.formatMetrics(hostNetworkRx, clusterName) : this.formatMetrics(networkReceived, clusterName)
    const showNetworkTrans = switchNetwork ? this.formatMetrics(hostNetworkTx, clusterName) : this.formatMetrics(networkTransmitted, clusterName)
    const showNodeReadIo = switchDisk ? this.formatMetrics(hostDiskReadIo, clusterName) : this.formatMetrics(diskReadIo, clusterName)
    const showNodeWriteIo = switchDisk ? this.formatMetrics(hostDiskWriteIo, clusterName) : this.formatMetrics(diskWriteIo, clusterName)
    const showTcpListen = this.formatMetrics(tcpListen, clusterName)
    const showTcpEst = this.formatMetrics(tcpEst, clusterName)
    const showTcpClose = this.formatMetrics(tcpClose, clusterName)
    const showTcpTime = this.formatMetrics(tcpTime, clusterName)
    const fetchApi = {
      getNodeLabels: this.props.getNodeLabels,
      clusterID: this.props.clusterID,
      nodeName: this.props.clusterName,
      nodeLabel: this.props.nodeLabel
    }
    let runningtime = calcuDate(hostInfo.objectMeta.creationTimestamp)
    runningtime = runningtime.substring(0,runningtime.length-1)
    const isMaintaining = hostInfo.objectMeta.annotations && ['true', 'failed'].includes(hostInfo.objectMeta.annotations.maintenance)
    const arch = getDeepValue(hostInfo, [ 'objectMeta', 'labels', 'beta.kubernetes.io/arch' ])
    const os = getDeepValue(hostInfo, [ 'objectMeta', 'labels', 'beta.kubernetes.io/os' ])
    return (
      <div id="clusterDetail">
        <Title title={formatMessage(intlMsg.infrastructure)}/>
        <div className="topRow" style={{ marginBottom: '20px', height: '50px', paddingTop: '20px' }}>
          <span className="back" onClick={() => {browserHistory.push(`/cluster?clusterID=${fetchApi.clusterID}&from=clusterDetail`)}}><span className="backjia"></span><span className="btn-back">
            <FormattedMessage {...intlMsg.back}/>
          </span></span>
          <span className="title"><FormattedMessage {...intlMsg.hostDetail}/> （{this.props.clusterName}）</span>
        </div>
        <Card className="ClusterInfo" bordered={false}>
          <div className="imgBox" style={{ padding: '30px 24px' }}>
            <img src={hostImg} className="clusterImg" />
          </div>
          <div className="clusterTable" style={{ paddingTop: '30px' }}>
            <div className="formItem">
              <div className="h2">{ hostInfo.address ? hostInfo.address:'' }</div>
              <div className="list"><FormattedMessage {...intlMsg.runningStatus}/>：{this.renderStatus(hostInfo)}</div>
              <div className="list"><FormattedMessage {...intlMsg.os}/>：{(() => {
                const arr = os.split('')
                arr[0] = arr[0].toUpperCase()
                return arr.join('')
              })()} {arch.toUpperCase()}</div>
              <div className="list"><FormattedMessage {...intlMsg.nodeRole}/>：<span className="role">{hostInfo.isMaster ? formatMessage(intlMsg.masterNode) : formatMessage(intlMsg.computedNode)}</span></div>
            </div>
            <div className="formItem">
              <div className="h2"></div>
              <div className="list"><FormattedMessage {...intlMsg.runningTime}/>：<span className="role">{runningtime}</span></div>
              <div className="list">
                <FormattedMessage {...intlMsg.lastHeartbeatTime}/>
                <span className="role">
                  {lastHeartbeatTime}
                </span>
              </div>
              <div className="list"><FormattedMessage {...intlMsg.createTime}/>：<span className="status">{formatDate(hostInfo.objectMeta ? hostInfo.objectMeta.creationTimestamp : '')}</span></div>

            </div>
            <div className="formItem">
              <div className="h2"></div>
              <div className="list"><FormattedMessage {...intlMsg.dispatchStatus}/>：
                <span className="role">
                  <Tooltip title={isMaintaining ? formatMessage(intlMsg.maintainingNoDispatch) : ''}>
                    <Switch checked={ this.state.schedulable }
                            onChange={
                              isMaintaining ? () => null :
                              this.changeSchedulable.bind(this, this.props.clusterName)}
                            checkedChildren={formatMessage(intlMsg.on)} unCheckedChildren={formatMessage(intlMsg.off)} />
                  </Tooltip>
                </span>
              </div>

            </div>
          </div>
        </Card>
        <Card className="infoTabs" bordered={false}>
          <div className="h3"></div>
          <Tabs defaultActiveKey={this.state.activeTabKey}>
            <TabPane tab={formatMessage(intlMsg.detail)} key="info">
              <HostInfo intl={this.props.intl} foreverPodNumber={this.state.foreverPodNumber} podeList={this.props.results} hostInfo={hostInfo} func={fetchApi} scope={this} />
            </TabPane>
            <TabPane tab={formatMessage(intlMsg.monitor)} key="monitoring">
              <TimeControl onChange={this.handleTimeChange} />
              <Metrics
                scope={this}
                diskHide={false}
                hideInstantBtn={true}
                cpu={showCpu}
                memory={showMemory}
                networkReceived={showNetworkRec}
                networkTransmitted={showNetworkTrans}
                diskReadIo={showNodeReadIo}
                diskWriteIo={showNodeWriteIo}
                tcpListen={showTcpListen}
                tcpEst={showTcpEst}
                tcpClose={showTcpClose}
                tcpTime={showTcpTime}
                showTcp={true}
              />
            </TabPane>
            <TabPane tab={formatMessage(intlMsg.alarmStrategy)} key="alarm">
              <AlarmStrategy withNode nodeName={this.props.clusterName} cluster={this.props.clusterID} modalOpen={this.state.alarmOpen}/>
            </TabPane>
          </Tabs>

        </Card>

      </div>
    )
  }

}

function mapStateToProps(state, props) {
  const clusterName = props.params.cluster_name
  const { clusterID }  = props.params
  const { podeList, hostInfo, hostMetrics, hostCpu, hostMemory, hostRxRate, hostTxRate, hostReadIo, hostWriteIo } = state.cluster || {}
  const defaultState = {
    isFetching: false,
    result: { pods: [] }
  }
  const { result, isFetching } = podeList || defaultState
  const results = result ? result.pods : []
  const cpuData = {
    isFetching: hostMetrics ? hostMetrics.isFetching : false,
  }
  const memoryData = {
    isFetching: hostMetrics ? hostMetrics.isFetching : false,
  }
  const networkReceivedData = {
    isFetching: hostMetrics ? hostMetrics.isFetching : false,
  }
  const networkTransmittedData = {
    isFetching: hostMetrics ? hostMetrics.isFetching : false,
  }
  const diskReadIo = {
    isFetching: hostMetrics ? hostMetrics.isFetching : false,
  }
  const diskWriteIo = {
    isFetching: hostMetrics ? hostMetrics.isFetching : false,
  }
  const tcpListen = {
    isFetching: hostMetrics ? hostMetrics.isFetching: false,
  }
  const tcpEst = {
    isFetching: hostMetrics ? hostMetrics.isFetching: false,
  }
  const tcpClose = {
    isFetching: hostMetrics ? hostMetrics.isFetching: false,
  }
  const tcpTime = {
    isFetching: hostMetrics ? hostMetrics.isFetching: false,
  }
  const { nodeLabel } = state.cluster_nodes || {}
  if (hostMetrics && hostMetrics.result) {
    cpuData.data = hostMetrics.result.cpus
    memoryData.data = hostMetrics.result.memory
    networkReceivedData.data = hostMetrics.result.rxRate
    networkTransmittedData.data = hostMetrics.result.txRate
    diskReadIo.data = hostMetrics.result.diskReadIo
    diskWriteIo.data = hostMetrics.result.diskWriteIo
    tcpListen.data = hostMetrics.result.tcpListen
    tcpEst.data = hostMetrics.result.tcpEst
    tcpClose.data = hostMetrics.result.tcpCloseWait
    tcpTime.data = hostMetrics.result.tcpTimeWait
  }
  let instantCpu = {}
  let instantMemory = {}
  let instantNetworkRx = {}
  let instantNetworkTx = {}
  let instantDiskReadIo = {}
  let instantDiskWriteIo = {}
  if (hostCpu && hostCpu.result) {
    instantCpu.data = hostCpu.result.cpu
  }
  if (hostMemory && hostMemory.result) {
    instantMemory.data = hostMemory.result.memory
  }
  if (hostRxRate && hostRxRate.result) {
    instantNetworkRx.data = hostRxRate.result.rxRate
  }
  if (hostTxRate && hostTxRate.result) {
    instantNetworkTx.data = hostTxRate.result.txRate
  }
  if (hostReadIo && hostReadIo.result) {
    instantDiskReadIo.data = hostReadIo.result.diskReadIo
  }
  if (hostWriteIo && hostWriteIo.result) {
    instantDiskWriteIo.data = hostWriteIo.result.diskWriteIo
  }

  /*let instant = {}
  if (hostInstant && hostInstant.result) {
    instant = hostInstant.result
  }*/
  return {
    cpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,
    diskReadIo,
    diskWriteIo,
    tcpListen,
    tcpEst,
    tcpClose,
    tcpTime,
    nodeLabel: nodeLabel ? nodeLabel.result: {} ,
    clusterID,
    clusterName,
    isFetching,
    results,
    // instant,
    hostInfo,
    hostCpu: instantCpu, //实时刷新
    hostMemory: instantMemory,
    hostNetworkRx: instantNetworkRx,
    hostNetworkTx: instantNetworkTx,
    hostDiskReadIo: instantDiskReadIo,
    hostDiskWriteIo: instantDiskWriteIo
  }
}

export default connect(mapStateToProps, {
  getNodesPodeList,
  getHostInfo,
  loadHostMetrics,
  // loadHostInstant,
  searchPodeList,
  changeClusterNodeSchedule,
  getNodeLabels,
  loadHostCpu,
  loadHostMemory,
  loadHostRxrate,
  loadHostTxrate,
  loadHostDiskReadIo,
  loadHostDiskWriteIo
})(injectIntl(ClusterDetail, {
  withRef: true,
}))
