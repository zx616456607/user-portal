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
import { formatDate, calcuDate } from '../../common/tools'
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
import Resourcequota from '../../../static/img/Resourcequota.svg'
import { UPDATE_INTERVAL, LOAD_INSTANT_INTERVAL } from '../../constants'

const TabPane = Tabs.TabPane
const MASTER = '主控节点/Master'
const SLAVE = '计算节点/Slave'

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
    const { scope } = this.props
    const { clusterID, clusterName } = scope.props
    scope.props.getNodesPodeList({ clusterID, clusterName }, {
      success: {
        func: (ret) => {
          new NotificationHandler().success('刷新成功')
          scope.setState({ foreverPodNumber: ret.pods.length})
        }
      }
    })
  },
  checkedState(type) {
    switch (type) {
      case 'Succeeded': {
        return <div style={{ color: '#33b867' }}><i className="fa fa-circle"></i> 运行中</div>
      }
      case 'Running': {
        return <div style={{ color: '#33b867' }}><i className="fa fa-circle"></i> 运行中</div>
      }
      case 'Failed': {
        return <div style={{ color: '#f23e3f' }}><i className="fa fa-circle"></i> 失败</div>
      }
      default: {
        return <div style={{ color: '#0b9eeb' }}><i className="fa fa-circle"></i> 启动中</div>
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
    const columns = [{
        title: '容器名称',
        dataIndex: 'objectMeta.name',
        key: 'name',
        width:'200px',
      }, {
        title: '状态',
        dataIndex: 'podPhase',
        width:'8%',
        key: 'success',
        render: (text) => this.checkedState(text)
      }, {
        title: '命名空间',
        dataIndex: 'objectMeta.namespace',
        key: 'address',
      }, {
        title: '所属应用',
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
        title: '镜像',
        dataIndex: 'podSpec.containers',
        width:'25%',
        key: 'container',
        render: (data) => data[0].image
      },
      {
        title: '访问地址',
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
        title: '创建时间',
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
                  totalRequestedMemory += parseInt(container.resources.requests.memory.replace("M", "")) * 1000
                }
                if (container.resources.requests.memory.endsWith("G") > 0) {// Convert to Ki
                  totalRequestedMemory += parseInt(container.resources.requests.memory.replace("G", "")) * 1000 * 1000
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
    const memTotal = isNaN(hostInfo[camelize('MemoryAllocatable')] /1000) ? '' : Math.floor(hostInfo[camelize('MemoryAllocatable')] / 1000 / 1000 *100) /100
    const useMem = (totalRequestedMemory / hostInfo[camelize('MemoryAllocatable')] *100).toFixed(2)
    return (
      <QueueAnim className="ClusterDetail">
        <div className="hostInfo" key="ClusterDetail">
          <div className="topTitle" style={{marginTop:'20px',marginBottom: 10}}>主机信息</div>
          <div className="wrapRow">
            <div className="host-list">
              <div className="titles"><div className="quotaimg"><img style={{width:'100%'}} src={Resourcequota}/></div> 资源配额（可分配）</div>
              <br />
              <Row className="items">
                <Col span={8}><span className="keys resources">CPU：</span><span className="valus">{ hostInfo.cPUAllocatable }m（{ hostInfo.cPUAllocatable / 1000}核）</span></Col>
                <Col span={10}><Progress percent={ Math.min(totalRequestedCPU * 100 /hostInfo.cPUAllocatable, 100) } showInfo={false} strokeWidth={8} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已分配 { (totalRequestedCPU * 100 /hostInfo.cPUAllocatable|| 0).toFixed(2) } %</Col>
              </Row>
              <Row className="items">
                <Col span={8}><span className="keys resources">内存：</span><span className="valus">{ memTotal } GB</span></Col>
                <Col span={10}><Progress percent={ Math.min(useMem, 100) } strokeWidth={8} showInfo={false} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已分配 { useMem } %</Col>

              </Row>
              <Row className="items">
                <Col span={8}><span className="keys resources">容器：</span><span className="valus">{hostInfo.podCap} 个</span></Col>
                <Col span={10}><Progress percent={ Math.round(foreverPodNumber / hostInfo.podCap *100) } strokeWidth={8} showInfo={false} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已分配 { foreverPodNumber} 个</Col>

              </Row>
            </div>

            <div className="host-list Versionin">
              <div className="titles"><svg className="svg-icon"><use xlinkHref="#tag"></use></svg> 版本信息</div>
              <br />
              <Row className="items versioninformation">
                <Col span={12} className='col_style'>内核版本： {hostInfo.versions ? hostInfo.versions.kernel : ''}</Col>
                <Col span={12} className='col_style'>kubelet 版本： {hostInfo.versions ? hostInfo.versions.kubelet : ''}</Col>
              </Row>
              <Row className="items versioninformation">
                <Col span={12} className='col_style'>Docker 版本： {hostInfo.versions ? hostInfo.versions.docker.replace('docker://','') : ''}</Col>
                <Col span={12} className='col_style'>kube-proxy： {hostInfo.versions ? hostInfo.versions.kubeProxy : ''}</Col>
              </Row>
            </div>

            <div className="host-list">
              <div className="titles"><svg className='size select'><use xlinkHref="#managelabels"></use></svg> 标签信息 <Button className='manageLabelButton' type="ghost" onClick={this.handleManageLabelModal}><Icon type="setting" />管理标签</Button></div>
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
          <div className="topTitle">容器详情</div>
          <div className="containers">
            <Button onClick={() => this.reloadList()} type="primary" size="large"><i className="fa fa-refresh"></i> 刷新</Button>
            <span className="inputGroup">
              <Input placeholder="搜索" size="large" onChange={(e)=> this.setSearchState(e.target.value)} onPressEnter={()=> this.handSearch()}/>
              <Icon type="search" onClick={()=> this.handSearch()} />
            </span>
            <Table className="dataTable" pagination={{ pageSize: 10, showSizeChanger: true, total: podeList.length }} loading={this.props.hostInfo.isFetching} columns={columns} dataSource={podeList} />
          </div>
        </div>
      </QueueAnim>
    )
  }
})

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

class ClusterDetail extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.formatNodemetrics = this.formatNodemetrics.bind(this)
    this.state = {
      schedulable: false,
      foreverPodNumber: 0,
      activeTabKey: 'info',
      alarmOpen: false,
      freshTime: '1分钟',
      switchCpu: false,
      switchMemory: false,
      switchNetwork: false,
      switchDisk: false
    }
  }
  componentWillMount() {
    const { clusterID, clusterName,location } = this.props
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

    this.loadData(this.props, { start: this.changeTime(1) })
    this.changeTimeInterval = setInterval(() => {
      this.loadData(this.props, { start: this.changeTime(1) })
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
    const { clusterID, changeClusterNodeSchedule } = this.props;
    const _this = this
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: ()=> {
          // notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
          notification.success(e ? '开启调度成功' : '关闭调度成功');
          _this.setState({
            schedulable: e
          })
        },
        isAsync: true
      },
      failed:{
        func: (ret)=> {
          let message = ret.message.message ? ret.message.message: ret.message
          notification.error(e ? '开启调度失败' : '关闭调度失败', message);

          _this.setState({
            schedulable: !e
          })
        }
      }
    })
  }
  getHostCpu() {
    const { loadHostCpu, clusterID, clusterName } = this.props
    loadHostCpu({clusterID, clusterName}, {start: this.changeTime(0.5), source: 'influxdb'}, {
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
    loadHostMemory({clusterID, clusterName}, {start: this.changeTime(0.5), source: 'influxdb'}, {
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
      loadHostRxrate({clusterID, clusterName}, {start: this.changeTime(0.5), source: 'influxdb'}, {
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
      loadHostTxrate({clusterID, clusterName}, {start: this.changeTime(0.5), source: 'influxdb'}, {
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
      loadHostDiskReadIo({clusterID, clusterName}, {start: this.changeTime(0.5), source: 'influxdb'}, {
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
      loadHostDiskWriteIo({clusterID, clusterName}, {start: this.changeTime(0.5), source: 'influxdb'}, {
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
        clearInterval(this.rxRateInterval)
        clearInterval(this.txRateInterval)
        if (flag) {
          this.getHostRxrate()
          this.getHostTxrate()
          Promise.all([this.getHostRxrate(), this.getHostTxrate()]).then(() => {
            this.setState({
              NetworkLoading: false
            })
          })
          this.rxRateInterval = setInterval(() => this.getHostRxrate(), LOAD_INSTANT_INTERVAL)
          this.txRateInterval = setInterval(() => this.getHostTxrate(), LOAD_INSTANT_INTERVAL)
        }
        break
      case 'Disk':
        clearInterval(this.readIoInterval)
        clearInterval(this.writeIoInterval)
        if (flag) {
          this.getHostReadIo()
          this.getHostWriteIo()
          Promise.all([this.getHostReadIo(), this.getHostWriteIo()]).then(() => {
            this.setState({
              DiskLoading: false
            })
          })
          this.readIoInterval = setInterval(() => this.getHostReadIo(), LOAD_INSTANT_INTERVAL)
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
    const intervalTime = timeFrequency[value]['second']
    const timeDes = timeFrequency[value]['timeDes']
    const start = this.changeTime(value)
    this.setState({
      currentStart: start,
      freshTime: timeDes
    })
    clearInterval(this.changeTimeInterval)
    this.loadData(this.props, { start })
    this.changeTimeInterval = setInterval(() => {
      this.loadData(this.props, { start })  
    }, intervalTime)
  }

  formetCpumetrics(cpuData) {
    if (!cpuData.data) return {}
    let formetDate = { data: [] }
    let metrics = []
    if (cpuData.data.metrics) {
      metrics = cpuData.data.metrics.map((list) => {
        let floatValue = list.floatValue || list.value
        return {
          timestamp: formatDate(list.timestamp).substr(list.timestamp.indexOf('-')+1),
          value: floatValue
        }
      })

    }
    formetDate.data.push({ metrics })
    return formetDate
  }
  formetMemorymetrics(memoryData, nodeName) {
    if (!memoryData.data) return {}
    let formetDate = { data: [] }
    let metrics = {}
    if (memoryData.data.metrics) {
      metrics = memoryData.data.metrics.map((list) => {
        return {
          timestamp: formatDate(list.timestamp).substr(list.timestamp.indexOf('-')+1),
          value: list.floatValue || list.value
        }
      })

    }
    formetDate.data.push({ metrics, containerName: nodeName})
    return formetDate
  }
  formetNetworkmetrics(memoryData, nodeName) {
    if (!memoryData.data) return {}
    let formetDate = { data: [] }
    let metrics = {}
    memoryData.data.containerName= nodeName
    if (memoryData.data.metrics) {
      metrics = memoryData.data.metrics.map((list) => {
        return {
          timestamp: formatDate(list.timestamp).substr(list.timestamp.indexOf('-')+1),
          value: list.floatValue || list.value,
        }
      })

    }
    formetDate.data.push({ metrics,containerName: nodeName})
    return formetDate
  }
  formatNodemetrics(memoryData, nodeName){
    if (!memoryData || !memoryData.data) return {}
    let formetDate = { data: [] }
    let metrics = {}
    memoryData.data.containerName = nodeName
    if (memoryData.data.metrics) {
      metrics = memoryData.data.metrics.map((list) => {
        return {
          timestamp: formatDate(list.timestamp).substr(list.timestamp.indexOf('-')+1),
          value: list.floatValue || list.value,
        }
      })

    }
    formetDate.data.push({ metrics,containerName: nodeName})
    return formetDate
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
      diskReadIo, diskWriteIo, hostDiskReadIo, hostDiskWriteIo
    } = this.props
    const hostInfo = this.props.hostInfo.result ? this.props.hostInfo.result : {objectMeta:{creationTimestamp:''}, address:' '}
    hostInfo.isFetching = this.props.isFetching
    const showCpu = switchCpu ? this.formetCpumetrics(hostCpu) : this.formetCpumetrics(cpu)
    const showMemory = switchMemory ? this.formetMemorymetrics(hostMemory): this.formetMemorymetrics(memory)
    const showNetworkRec = switchNetwork ? this.formetNetworkmetrics(hostNetworkRx, clusterName) : this.formetNetworkmetrics(networkReceived, clusterName)
    const showNetworkTrans = switchNetwork ? this.formetNetworkmetrics(hostNetworkTx, clusterName) : this.formetNetworkmetrics(networkTransmitted, clusterName)
    const showNodeReadIo = switchDisk ? this.formatNodemetrics(hostDiskReadIo, clusterName) : this.formatNodemetrics(diskReadIo, clusterName)
    const showNodeWriteIo = switchDisk ? this.formatNodemetrics(hostDiskWriteIo, clusterName) : this.formatNodemetrics(diskWriteIo, clusterName)
    const fetchApi = {
      getNodeLabels: this.props.getNodeLabels,
      clusterID: this.props.clusterID,
      nodeName: this.props.clusterName,
      nodeLabel: this.props.nodeLabel
    }
    let runningtime = calcuDate(hostInfo.objectMeta.creationTimestamp)
    runningtime = runningtime.substring(0,runningtime.length-1)
    return (
      <div id="clusterDetail">
        <Title title="基础设施"/>
        <div className="topRow" style={{ marginBottom: '20px', height: '50px', paddingTop: '20px' }}>
          <span className="back" onClick={() => {browserHistory.push(`/cluster?clusterID=${fetchApi.clusterID}&from=clusterDetail`)}}><span className="backjia"></span><span className="btn-back">返回</span></span>
          <span className="title">主机详情 （{this.props.clusterName}）</span>
        </div>
        <Card className="ClusterInfo" bordered={false}>
          <div className="imgBox" style={{ padding: '30px 24px' }}>
            <img src={hostImg} className="clusterImg" />
          </div>
          <div className="clusterTable" style={{ paddingTop: '30px' }}>
            <div className="formItem">
              <div className="h2">{ hostInfo.address ? hostInfo.address:'' }</div>
              <div className="list">运行状态：<span className={hostInfo.ready == 'True' ? 'runningSpan' : 'errorSpan'}><i className='fa fa-circle' />&nbsp;&nbsp;{hostInfo.ready == 'True' ? '运行中' : '异常'}</span></div>
              <div className="list">节点角色：<span className="role">{hostInfo.isMaster ? MASTER : SLAVE}</span></div>
            </div>
            <div className="formItem">
              <div className="h2"></div>
              <div className="list">创建时间：<span className="status">{formatDate(hostInfo.objectMeta ? hostInfo.objectMeta.creationTimestamp : '')}</span></div>
              <div className="list">运行时间：<span className="role">{runningtime}</span></div>
            </div>
            <div className="formItem">
              <div className="h2"></div>
              <div className="list">调度状态：
                <span className="role"><Switch checked={ this.state.schedulable }
                  onChange={this.changeSchedulable.bind(this, this.props.clusterName)} checkedChildren="开" unCheckedChildren="关" /></span>
              </div>

            </div>
          </div>
        </Card>
        <Card className="infoTabs" bordered={false}>
          <div className="h3"></div>
          <Tabs defaultActiveKey={this.state.activeTabKey}>
            <TabPane tab="详情" key="info">
              <HostInfo foreverPodNumber={this.state.foreverPodNumber} podeList={this.props.results} hostInfo={hostInfo} func={fetchApi} scope={this} />
            </TabPane>
            <TabPane tab="监控" key="monitoring">
              <TimeControl onChange={this.handleTimeChange} />
              <Metrics
                scope={this}
                cpu={showCpu}
                memory={showMemory}
                networkReceived={showNetworkRec}
                networkTransmitted={showNetworkTrans}
                diskReadIo={showNodeReadIo}
                diskWriteIo={showNodeWriteIo}
              />
            </TabPane>
            <TabPane tab="告警策略" key="alarm">
              <AlarmStrategy nodeName={this.props.clusterName} cluster={this.props.clusterID} modalOpen={this.state.alarmOpen}/>
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
  const { nodeLabel } = state.cluster_nodes || {}
  if (hostMetrics && hostMetrics.result) {
    cpuData.data = hostMetrics.result.cpus
    memoryData.data = hostMetrics.result.memory
    networkReceivedData.data = hostMetrics.result.rxRate
    networkTransmittedData.data = hostMetrics.result.txRate
    diskReadIo.data = hostMetrics.result.diskReadIo
    diskWriteIo.data = hostMetrics.result.diskWriteIo
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
})(ClusterDetail)