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
import { getNodesPodeList, getClusterInfo, loadHostMetrics} from '../../actions/cluster'
import './style/ClusterDetail.less'
import clusterImg from '../../assets/img/integration/cluster.png'
import { formatDate, calcuDate } from '../../common/tools'
import NotificationHandler from '../../common/notification_handler'
import { getHostInfo, fetchHostMetrics } from '../../actions/cluster'
import TimeControl from '../Metrics/TimeControl'
import Metrics from '../Metrics'
const TabPane = Tabs.TabPane
const MASTER = '主控节点/Master'
const SLAVE = '计算节点/Slave'

function cpuUsed(cpuTotal, cpuList, name) {
  //this function for compute cpu used
  if (!cpuList) {
    return `N/A`
  }
  let total = 0;
  let used;
  let length;
  for(let key in cpuList) {
    if(key != 'statusCode') {
      if(cpuList[key].name == name) {
        length = cpuList[key].metrics.length
        cpuList[key].metrics.map((item) => {
          total = total + item.value;
        });
      }
    }
  }
  // 1h and to 100%
  if (!length) {
    length = 1
  }
  used = total / cpuTotal / length;
  used = ( used * 100 ).toFixed(2);
  return `${used}%`;
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
    switch(type) {
      case 'Succeeded': {
       return <div style={{color:'#33b867'}}><i className="fa fa-circle"></i> 运行中</div>
      }
      case 'Running': {
       return <div style={{color:'#33b867'}}><i className="fa fa-circle"></i> 运行中</div>
      }
      case 'Failed': {
        return <div style={{color:'#f23e3f'}}><i className="fa fa-circle"></i> 失败</div>
      }
      default: {
        return <div style={{color:'#0b9eeb'}}><i className="fa fa-circle"></i> 启动中</div>
      }
    }
  },

  render () {
    const columns = [{
      title: '容器名称',
      dataIndex: 'objectMeta.name',
      key: 'name',
      }, {
        title: '状态',
        dataIndex: 'podPhase',
        key: 'success',
        render: (text) => this.checkedState(text)
      }, {
        title: '项目空间',
        dataIndex: 'objectMeta.namespace',
        key: 'address',
      }, {
        title: '所属应用',
        dataIndex: 'objectMeta.labels.tenxcloud.com/appName',
        key: 'apply',
        render: (text) => {
          if (text) {
            return (<div>{text}</div>)
          }
          return '--'
        }
      },
      {
        title: '镜像',
        dataIndex: 'podSpec.containers',
        key: 'container',
        render: (data) => data[0].image
      },
      {
        title: '访问地址',
        dataIndex: 'podIP',
        key: 'url',
      },
      {
        title: '创建时间',
        dataIndex: 'objectMeta.creationTimestamp',
        render: (text) => calcuDate(text)
      }
    ];

    const data = this.props.data
    const hostInfo = this.props.hostInfo
    console.log('hostinfo', hostInfo)
    if (this.props.hostInfo.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    return (
      <div className="hostInfo">
        <div className="topTitle">主机信息</div>
        <div className="wrapRow">
          <div className="host-list">
            <div className="titles">资源配额</div>
            <br/>
            <Row className="items">
              <Col span={10}><span className="keys">CPU：</span><span className="valus">{hostInfo.cpuTotal /1000} 核</span></Col>
              <Col span={14}><Progress percent={30} strokeWidth={8} status="active" /></Col>
            </Row>
            <Row className="items">
              <Col span={10}><span className="keys">内存：</span><span className="valus">{Math.round(hostInfo.memoryTotalKB/1024/1024)} G</span></Col>
              <Col span={14}><Progress percent={30} strokeWidth={8} status="active" /></Col>
            </Row>
            <Row className="items">
              <Col span={10}><span className="keys">容器配额：</span><span className="valus">{hostInfo.podCap}</span></Col>
              <Col span={14}><Progress percent={30} strokeWidth={8} status="active" /></Col>
            </Row>
          </div>

          <div className="host-list">
            <div className="titles">版本信息</div>
            <br/>
            <Row className="items">
              <Col span={12}><span className="keys">内核版本：</span>{hostInfo.versions ? hostInfo.versions.kernel: ''}</Col>
              <Col span={12}><span className="keys">kubelet版本：</span>{hostInfo.versions ? hostInfo.versions.kubelet: ''}</Col>
            </Row>
            <Row className="items">
              <Col span={12}><span className="keys">Docker版本：</span>{hostInfo.versions ? hostInfo.versions.docker: ''}</Col>
              <Col span={12}><span className="keys">kube-proxy：</span>{hostInfo.versions ? hostInfo.versions.kubeProxy:''}</Col>
            </Row>
          </div>

        </div>
        <div className="topTitle">容器详情</div>
        <div className="containers">
          <Button icon="reload" onClick={()=> this.reloadList()} type="primary" size="large">刷新</Button>
          <span className="inputGroup">
            <Input placeholder="搜索" size="large" />
            <Icon type="search" />
          </span>
          <Table className="dataTable" pagination={{ pageSize:10,showSizeChanger: true, total: data.lenght}} columns={columns} dataSource={data}/>
        </div>
      </div>
    )
  }
})

function loadData(props, query) {
  const { cluster, appName, loadHostMetrics } = props
  const body = { cluster, node }
  loadHostMetrics(body,query)

}

class ClusterDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      intervalStatus: false
    }
  }
  componentWillMount() {
    const { clusterID, clusterName, loadHostMetrics } = this.props
    const body = {
      clusterID,
      clusterName
    }
    setTimeout(()=> this.props.getHostInfo(body))

    setTimeout(()=> loadHostMetrics(body, 'cpu'))
    setTimeout(()=> loadHostMetrics(body, 'memory'))

    this.props.getNodesPodeList({clusterID, clusterName})

  }
  handleTimeChange(e) {
    const {value} = e.target
    const start = this.changeTime(value)
    this.setState({
      currentStart: start
    })
    loadData(this.props, { start })
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
      const { cluster, appName, loadAppAllOfMetrics } = this.props
      this.setState({
        intervalStatus: true
      })
      metricsInterval = setInterval(() => {
        loadAppAllOfMetrics(cluster, appName, query)
      }, 60000);
    }
  }
  render() {
    console.log(this.props,'tssssssssss')
    const hostInfo = this.props.hostInfo ? this.props.hostInfo.result : {}
    const showCpu = this.props.hostCpuMetrics
    const showMemory = this.props.hostMemoryMetrics
    const showNetworkRec =  {data:[]}
    const showNetworkTrans =  {data:[]}
    const { intervalStatus } = this.state
    if (this.props.isFetching) {
      return (
        <div className='loadingBox'>
            <Spin size='large' />
        </div>
      )
    }
    return (
      <div id="clusterDetail">
        <div className="topRow" style={{marginBottom: '20px', height: '50px', paddingTop: '20px'}}>
          <Link className="back" to="/cluster"><span className="backjia"></span><span className="btn-back">返回</span></Link>
          <span className="title">{this.props.clusterName}</span>
        </div>
        <Card className="ClusterInfo" bordered={false}>
          <div className="imgBox"  style={{padding:'30px 24px'}}>
            <img src={clusterImg} className="clusterImg"/>
          </div>
          <div className="clusterTable" style={{padding:'40px 0'}}>
            <div className="formItem">
              <div className="h2">{hostInfo.address}</div>
              <div className="list">运行状态：<span className={ hostInfo.ready == 'True' ? 'runningSpan' : 'errorSpan' }><i className='fa fa-circle' />&nbsp;&nbsp;{hostInfo.ready == 'True' ? '运行中' : '异常'}</span></div>
              <div className="list">节点角色：<span className="role">{hostInfo.isMaster ? MASTER : SLAVE}</span></div>
            </div>
             <div className="formItem">
              <div className="h2"></div>
              <div className="list">创建时间：<span className="status">{formatDate(hostInfo.objectMeta ? hostInfo.objectMeta.creationTimestamp : '')}</span></div>
              <div className="list">运行时间：<span className="role"></span></div>
            </div>
             <div className="formItem">
              <div className="h2"></div>
              <div className="list">调度状态：<span className="role"><Switch checked={hostInfo.schedulable} checkedChildren="开" unCheckedChildren="关" /></span></div>

            </div>
          </div>
        </Card>
        <Card className="infoTabs" bordered={false}>
          <div className="h3"></div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="详情" key="1"><HostInfo  data={this.props.results} hostInfo={hostInfo} scope={this} /></TabPane>
            <TabPane tab="监控" key="2">
              <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
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
  console.log('sss',props)
  const clusterName = props.params.cluster_name
  const clusterID = state.entities.current.cluster.clusterID
  const { podeList, hostInfo }= state.cluster
  const defaultState ={
    isFetching: false,
    result: {pods:[]}
  }
  const { isFetching, result } = podeList || defaultState
  const results = result ? result.pods : []
  const {
    hostCpuMetrics,
    hostMemoryMetrics,
    networkReceived,
    networkTransmitted,
    appAllMetrics
  } = state.cluster
   const cpuData = {
    isFetching: hostCpuMetrics ? hostCpuMetrics.isFetching : false,
    data: []
  }
  if (hostCpuMetrics && hostCpuMetrics.result) {
    cpuData.data = hostCpuMetrics.result.data || []
  }
  const memoryData = {
    isFetching: hostMemoryMetrics ? hostMemoryMetrics.isFetching: false,
    data: []
  }
  if (hostMemoryMetrics && hostMemoryMetrics.result) {
    memoryData.data = hostMemoryMetrics.result.data || []
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
  const allData = {
    isFetching: false,
    data: []
  }
  if(appAllMetrics && appAllMetrics.result) {
    allData.data = appAllMetrics.result.data || []
  }
  return {
    appAllMetrics: allData,
    cpu: cpuData,
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

export default connect(mapStateToProps,{
  getNodesPodeList,
  getHostInfo,
  getClusterInfo,
  loadHostMetrics,
})(ClusterDetail)