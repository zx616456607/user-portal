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
import { Link } from 'react-router'
import { Icon, Button, Card, Tabs, Table, Input, Spin, Row, Col, Progress, Switch } from 'antd'
import { getNodesPodeList, loadHostMetrics, searchPodeList } from '../../actions/cluster'
import './style/ClusterDetail.less'
import hostImg from '../../assets/img/integration/host.png'
import { formatDate, calcuDate } from '../../common/tools'
import { LABEL_APPNAME } from '../../constants'
import NotificationHandler from '../../common/notification_handler'
import { getHostInfo, fetchHostMetrics } from '../../actions/cluster'
import { changeClusterNodeSchedule } from '../../actions/cluster_node'
import TimeControl from '../Metrics/TimeControl'
import Metrics from '../Metrics'
import moment from 'moment'
import { camelize } from 'humps'
import { NOT_AVAILABLE } from '../../constants'

const TabPane = Tabs.TabPane
const MASTER = '主控节点/Master'
const SLAVE = '计算节点/Slave'
let foreverPodNumber = 0 // pod %

function cpuUsed(cpuTotal, cpuList) {
  //this function for compute cpu used
  if (!cpuTotal|| !cpuList.data) {
    return NOT_AVAILABLE
  }
  let total = 0;
  let used;
  let length=0;
  if (cpuList.data.metrics) {
    length = cpuList.data.metrics.length
    cpuList.data.metrics.map((item) => {
      total = total + item.value;
    });

  }

  used = total / cpuTotal / length;
  used = (used * 100).toFixed(2);
  return {
    unit:`${used}%`,
    amount: used
  }
}
function memoryUsed(memoryTotal, memoryList) {
  //this function for compute memory used
  if (!memoryTotal || !memoryList.data) {
    return NOT_AVAILABLE
  }
  let total = 0;
  let used;
  let length=0
  if (memoryList.data.metrics) {
    length = memoryList.data.metrics.length
    memoryList.data.metrics.map((item) => {
      total = total + (item.value / 1024);
    });

  }
  used = total / memoryTotal;
  used = (used * 100 / length).toFixed(2)
  return {
    unit:`${used}%`,
    amount: used
  }
}

let HostInfo = React.createClass({
  reloadList() {
    const { scope } = this.props
    const { clusterID, clusterName } = scope.props
    scope.props.getNodesPodeList({ clusterID, clusterName }, {
      success: {
        func: () => {
          new NotificationHandler().success('刷新成功')
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
    let podname = this.state.podname
    const { scope } = this.props
    scope.props.searchPodeList(podname)
  },
  render() {
    const columns = [{
        title: '容器名称',
        dataIndex: 'objectMeta.name',
        key: 'name',
      }, {
        title: '状态',
        dataIndex: 'podPhase',
        width:'15%',
        key: 'success',
        render: (text) => this.checkedState(text)
      }, {
        title: '项目空间',
        dataIndex: 'objectMeta.namespace',
        key: 'address',
      }, {
        title: '所属应用',
        dataIndex: `objectMeta.labels`,
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
        render: (text) => calcuDate(text)
      }
    ];

    const { hostInfo, metricsData, podeList } = this.props
    foreverPodNumber = (foreverPodNumber > 0) ? foreverPodNumber
    : Math.round(podeList.length / hostInfo.podCap *100) // pod %

    return (
      <div className="hostInfo">
        <div className="topTitle" style={{margin:'0'}}>主机信息</div>
        <div className="wrapRow">
          <div className="host-list">
            <div className="titles">资源配额</div>
            <br />
            <Row className="items">
              <Col span={8}><span className="keys">CPU：</span><span className="valus">{isNaN(hostInfo.cpuTotal / 1000)? '': hostInfo.cpuTotal / 1000} 核</span></Col>
              <Col span={10}><Progress percent={ cpuUsed(hostInfo.cpuTotal,metricsData.cpuData).amount } showInfo={false} strokeWidth={8} status="active" /></Col>
              <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已使用 {cpuUsed(hostInfo.cpuTotal, metricsData.cpuData).unit }</Col>
            </Row>
            <Row className="items">
              <Col span={8}><span className="keys">内存：</span><span className="valus">{isNaN(hostInfo[camelize('memory_total_kb')] /1024) ? '' : Math.round(hostInfo[camelize('memory_total_kb')] / 1024 / 1024)} G</span></Col>
              <Col span={10}><Progress percent={memoryUsed(hostInfo[camelize('memory_total_kb')], metricsData.memoryData).amount } strokeWidth={8} showInfo={false} status="active" /></Col>
              <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已使用 {memoryUsed(hostInfo[camelize('memory_total_kb')], metricsData.memoryData).unit }</Col>

            </Row>
            <Row className="items">
              <Col span={8}><span className="keys">容器配额：</span><span className="valus">{hostInfo.podCap}</span></Col>
              <Col span={10}><Progress percent={ foreverPodNumber } strokeWidth={8} showInfo={false} status="active" /></Col>
              <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已使用 { isNaN(foreverPodNumber) ? '': foreverPodNumber }%</Col>

            </Row>
          </div>

          <div className="host-list">
            <div className="titles">版本信息</div>
            <br />
            <Row className="items">
              <Col span={12}><span className="keys">内核版本：</span>{hostInfo.versions ? hostInfo.versions.kernel : ''}</Col>
              <Col span={12}><span className="keys">kubelet 版本：</span>{hostInfo.versions ? hostInfo.versions.kubelet : ''}</Col>
            </Row>
            <Row className="items">
              <Col span={12}><span className="keys">Docker 版本：</span>{hostInfo.versions ? hostInfo.versions.docker.replace('docker://','') : ''}</Col>
              <Col span={12}><span className="keys">kube-proxy：</span>{hostInfo.versions ? hostInfo.versions.kubeProxy : ''}</Col>
            </Row>
          </div>

        </div>
        <div className="topTitle">容器详情</div>
        <div className="containers">
          <Button onClick={() => this.reloadList()} type="primary" icon="reload" size="large">刷新</Button>
          <span className="inputGroup">
            <Input placeholder="搜索" size="large" onChange={(e)=> this.setSearchState(e.target.value)} onPressEnter={()=> this.handSearch()}/>
            <Icon type="search" onClick={()=> this.handSearch()} />
          </span>
          <Table className="dataTable" pagination={{ pageSize: 10, showSizeChanger: true, total: podeList.lenght }} loading={this.props.hostInfo.isFetching} columns={columns} dataSource={podeList} />
        </div>
      </div>
    )
  }
})

function loadData(props, query) {
  const { clusterID, clusterName, loadHostMetrics } = props
  const body = { clusterID, clusterName }
  loadHostMetrics(body, query)

}

class ClusterDetail extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.state = {
      schedulable: false
    }
  }
  componentWillMount() {
    const { clusterID, clusterName, loadHostMetrics } = this.props

    const body = {
      clusterID,
      clusterName
    }
    const _this = this
    this.props.getHostInfo(body, {
      success: {
        func:(res)=> {
          _this.setState({schedulable: res.schedulable})
        }
      }
    })

    loadHostMetrics(body, { start: this.changeTime(1) })

    this.props.getNodesPodeList({ clusterID, clusterName })

  }
  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { clusterID, changeClusterNodeSchedule } = this.props;
    const _this = this
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: ()=> {
          notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
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
  changeTime(hours) {
    let d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }
  handleTimeChange(e) {
    const { value } = e.target
    const start = this.changeTime(value)
    this.setState({
      currentStart: start
    })
    loadData(this.props, { start })
  }

  formetCpumetrics(cpuData) {
    if (!cpuData.data) return
    let formetDate = { data: [] }
    let metrics = {}
    if (cpuData.data.metrics) {
      metrics = cpuData.data.metrics.map((list) => {
        return {
          timestamp: moment(list.timestamp).format('MM-DD HH:mm'),
          value: list.value
        }
      })

    }
    formetDate.data.push({ metrics })
    return formetDate
  }
  formetMemorymetrics(memoryData) {
    if (!memoryData.data) return
    let formetDate = { data: [] }
    let metrics = {}
    if (memoryData.data.metrics) {
      metrics = memoryData.data.metrics.map((list) => {
        return {
          timestamp: moment(list.timestamp).format('MM-DD HH:mm'),
          value: Math.ceil(list.value / 1024 / 1024)
        }
      })

    }
    formetDate.data.push({ metrics })
    return formetDate
  }
  formetNetworkmetrics(memoryData, nodeName) {
    if (!memoryData.data) return
    let formetDate = { data: [] }
    let metrics = {}
    memoryData.data.containerName= nodeName
    if (memoryData.data.metrics) {
      metrics = memoryData.data.metrics.map((list) => {
        return {
          timestamp: moment(list.timestamp).format('MM-DD HH:mm'),
          value: list.value,
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
    const hostInfo = this.props.hostInfo.result ? this.props.hostInfo.result : {objectMeta:{creationTimestamp:''}, address:' '}
    hostInfo.isFetching = this.props.isFetching
    const showCpu = this.formetCpumetrics(this.props.hostcpu)
    const showMemory = this.formetMemorymetrics(this.props.memory)
    const showNetworkRec = this.formetNetworkmetrics(this.props.networkReceived, hostInfo.address)
    const showNetworkTrans = this.formetNetworkmetrics(this.props.networkTransmitted, hostInfo.address)
    return (
      <div id="clusterDetail">
        <div className="topRow" style={{ marginBottom: '20px', height: '50px', paddingTop: '20px' }}>
          <Link className="back" to="/cluster"><span className="backjia"></span><span className="btn-back">返回</span></Link>
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
              <div className="list">运行时间：<span className="role">{calcuDate(hostInfo.objectMeta.creationTimestamp)}</span></div>
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
          <Tabs defaultActiveKey="1">
            <TabPane tab="详情" key="1"><HostInfo podeList={this.props.results} metricsData={{cpuData:this.props.hostcpu,memoryData:this.props.memory}} hostInfo={hostInfo} scope={this} /></TabPane>
            <TabPane tab="监控" key="2">
              <TimeControl onChange={this.handleTimeChange} />
              <Metrics
                cpu={showCpu}
                memory={showMemory}
                networkReceived={showNetworkRec}
                networkTransmitted={showNetworkTrans}
              />
            </TabPane>
          </Tabs>

        </Card>

      </div>
    )
  }

}

function mapStateToProps(state, props) {
  const clusterName = props.params.cluster_name
  const clusterID = state.entities.current.cluster.clusterID
  const { podeList, hostInfo, hostMetrics } = state.cluster || {}
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
  if (hostMetrics && hostMetrics.result) {
    cpuData.data = hostMetrics.result.cpus
    memoryData.data = hostMetrics.result.memory
    networkReceivedData.data = hostMetrics.result.rxRate
    networkTransmittedData.data = hostMetrics.result.txRate
  }

  return {
    hostcpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,

    clusterID,
    clusterName,
    isFetching,
    results,
    hostInfo
  }
}

export default connect(mapStateToProps, {
  getNodesPodeList,
  getHostInfo,
  loadHostMetrics,
  searchPodeList,
  changeClusterNodeSchedule
})(ClusterDetail)