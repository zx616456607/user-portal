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
import { Icon, Button, Card, Tabs, Table, Input, Spin, Row, Col, Dropdown, Menu, Modal, Progress, Switch } from 'antd'
import { getNodesPodeList, loadHostMetrics, searchPodeList , loadHostInstant} from '../../actions/cluster'
import './style/ClusterDetail.less'
import hostImg from '../../assets/img/integration/host.png'
import { formatDate, calcuDate } from '../../common/tools'
import { LABEL_APPNAME } from '../../constants'
import NotificationHandler from '../../common/notification_handler'
import { getHostInfo } from '../../actions/cluster'
import { changeClusterNodeSchedule } from '../../actions/cluster_node'
import TimeControl from '../Metrics/TimeControl'
import Metrics from '../Metrics'
import moment from 'moment'
import { camelize } from 'humps'
import QueueAnim from 'rc-queue-anim'

const TabPane = Tabs.TabPane
const MASTER = '主控节点/Master'
const SLAVE = '计算节点/Slave'

let HostInfo = React.createClass({
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
        title: '命名空间',
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
        render: (text) => formatDate(text)
      }
    ];

    const { hostInfo, instant, podeList, foreverPodNumber } = this.props
    const memTotal = isNaN(hostInfo[camelize('memory_total_kb')] /1024) ? '' : Math.floor(hostInfo[camelize('memory_total_kb')] / 1024 / 1024 *100) /100
    const useMem = (instant.memory /1024  / hostInfo[camelize('memory_total_kb')] *100).toFixed(2)
    return (
      <QueueAnim className="ClusterDetail">
        <div className="hostInfo" key="ClusterDetail">
          <div className="topTitle" style={{marginTop:'20px',marginBottom: 10}}>主机信息</div>
          <div className="wrapRow">
            <div className="host-list">
              <div className="titles"><svg className="svg-icon"><use xlinkHref="#resource"></use></svg> 资源配额</div>
              <br />
              <Row className="items">
                <Col span={8}><span className="keys">CPU：</span><span className="valus">{isNaN(hostInfo.cpuTotal / 1000)? '': hostInfo.cpuTotal / 1000} 核</span></Col>
                <Col span={10}><Progress percent={ Math.min(instant.cpus, 100) } showInfo={false} strokeWidth={8} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已使用 { (instant.cpus || 0).toFixed(2) } %</Col>
              </Row>
              <Row className="items">
                <Col span={8}><span className="keys">内存：</span><span className="valus">{ memTotal } GB</span></Col>
                <Col span={10}><Progress percent={ Math.min(useMem, 100) } strokeWidth={8} showInfo={false} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已使用 { useMem } %</Col>

              </Row>
              <Row className="items">
                <Col span={8}><span className="keys">容器配额：</span><span className="valus">{hostInfo.podCap} 个</span></Col>
                <Col span={10}><Progress percent={ Math.round(foreverPodNumber / hostInfo.podCap *100) } strokeWidth={8} showInfo={false} status="active" /></Col>
                <Col span={6} style={{whiteSpace:'nowrap'}}>&nbsp; 已使用 { foreverPodNumber} 个</Col>

              </Row>
            </div>

            <div className="host-list">
              <div className="titles"><svg className="svg-icon"><use xlinkHref="#tag"></use></svg> 版本信息</div>
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
            <Button onClick={() => this.reloadList()} type="primary" size="large"><i className="fa fa-refresh"></i> 刷新</Button>
            <span className="inputGroup">
              <Input placeholder="搜索" size="large" onChange={(e)=> this.setSearchState(e.target.value)} onPressEnter={()=> this.handSearch()}/>
              <Icon type="search" onClick={()=> this.handSearch()} />
            </span>
            <Table className="dataTable" pagination={{ pageSize: 10, showSizeChanger: true, total: podeList.lenght }} loading={this.props.hostInfo.isFetching} columns={columns} dataSource={podeList} />
          </div>
        </div>
      </QueueAnim>
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
      schedulable: false,
      foreverPodNumber: 0,
      btnAll: true,
      deleteModal: false,
      activeTabKey:'info'
    }
  }
  componentWillMount() {
    const { clusterID, clusterName, loadHostInstant, loadHostMetrics } = this.props

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

    loadHostInstant(body)

    this.props.getNodesPodeList({ clusterID, clusterName }, {
      success: {
        func:(ret) => {
          _this.setState({foreverPodNumber: ret.pods.length})
        }
      }
    })

    loadHostMetrics(body, { start: this.changeTime(1) })

    let query = location.search
    if (query.length >0) {
      this.setState({activeTabKey: query.split('?')[1]})
    }

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

  formetCpumetrics(cpuData, cpuTotal) {
    if (!cpuData.data) return
    let formetDate = { data: [] }
    let metrics = {}
    if (cpuData.data.metrics) {
      metrics = cpuData.data.metrics.map((list) => {
        let floatValue = list.floatValue || list.value
        return {
          timestamp: moment(list.timestamp).format('MM-DD HH:mm'),
          value: floatValue / cpuTotal
        }
      })

    }
    formetDate.data.push({ metrics })
    return formetDate
  }
  formetMemorymetrics(memoryData, nodeName) {
    if (!memoryData.data) return
    let formetDate = { data: [] }
    let metrics = {}
    if (memoryData.data.metrics) {
      metrics = memoryData.data.metrics.map((list) => {
        return {
          timestamp: moment(list.timestamp).format('MM-DD HH:mm'),
          value: list.floatValue || list.value
        }
      })

    }
    formetDate.data.push({ metrics, containerName: nodeName})
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
          value: list.floatValue || list.value,
        }
      })

    }
    formetDate.data.push({ metrics,containerName: nodeName})
    return formetDate
  }
  hnadDelete(e, record) {
    console.log('key is',e.key, record)
  }
  dropdowns (record){
    // Dropdown delete btn
    return(
      <Menu onClick={(key)=> this.hnadDelete(key, record)}
          style={{ width: '80px' }}
      >
      <Menu.Item key="delete">
        <span>删除</span>
      </Menu.Item>
      <Menu.Item key="edit">
        <span>修改</span>
      </Menu.Item>
      <Menu.Item key="stop">
        <span>停用</span>
      </Menu.Item>
      <Menu.Item key="start">
        <span>启用</span>
      </Menu.Item>

    </Menu>

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
    const hostInfo = this.props.hostInfo.result ? this.props.hostInfo.result : {objectMeta:{creationTimestamp:''}, address:' '}
    hostInfo.isFetching = this.props.isFetching
    const showCpu = this.formetCpumetrics(this.props.hostcpu,hostInfo.cpuTotal/1000)
    const showMemory = this.formetMemorymetrics(this.props.memory)
    const showNetworkRec = this.formetNetworkmetrics(this.props.networkReceived, this.props.clusterName)
    const showNetworkTrans = this.formetNetworkmetrics(this.props.networkTransmitted, this.props.clusterName)
    const columns = [
      {
      title: '名称',
      dataIndex: 'name',
      key:'name',
      render: text => <a href="#">{text}</a>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key:'status',
        render: text => {
           if (text == 1) {
            return <div style={{color:'#33b867'}}><i className="fa fa-circle" /> &nbsp;启用</div>
          }
          if (text ==2) {
            return <div style={{color:'#f23e3f'}}><i className="fa fa-circle" /> &nbsp;停用</div>
          }
          return <div style={{color:'#FAB35B'}}><i className="fa fa-circle" /> &nbsp;告警</div>
        }
      },
      {
        title: '监控周期',
        dataIndex: 'time'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key:'createTime',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
      },
      {
        title: '最后修改人',
        dataIndex: 'editUser',
        key:'edit',
      },
      {
        title: '操作',
        dataIndex: 'name',
        key:'action',
        render: (text, record) => {
          return <Dropdown.Button type="ghost" overlay={ this.dropdowns(record) }>忽略</Dropdown.Button>
        }
      }
    ];

    const data = [
      {
        key:1,
        name: '大事业部',
        status: 1,
        time:'5分钟',
        createTime: '2017-03-06 15:35:21',
        editUser:'admin',
      }, {
        key:2,
        name: 'test It',
        status: 1,
        time:'15分钟',
        createTime: '2017-03-03 10:35:21',
        editUser:'admin',
      }, {
        key:3,
        name: '统计',
        status: 0,
        time:'2分钟',
        createTime: '2017-03-02 13:35:21',
        editUser:'baiyu',
      }
    ];
    const _this = this
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        let btnAll = true
        if (selectedRows.length >0) {
          btnAll = false
        }
        _this.setState({btnAll, selectedRows})
      }
    }
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
          <Tabs defaultActiveKey={this.state.activeTabKey}>
            <TabPane tab="详情" key="info">
              <HostInfo foreverPodNumber={this.state.foreverPodNumber} podeList={this.props.results} instant={ this.props.instant } hostInfo={hostInfo} scope={this} />
            </TabPane>
            <TabPane tab="监控" key="monitoring">
              <TimeControl onChange={this.handleTimeChange} />
              <Metrics
                cpu={showCpu}
                memory={showMemory}
                networkReceived={showNetworkRec}
                networkTransmitted={showNetworkTrans}
              />
            </TabPane>
            <TabPane tab="告警策略" key="alarm">
              <div className="alarmTest">
                <div className="topRow">
                  <Button size="large" type="primary"><i className="fa fa-refresh"/> 刷新</Button>
                  <Button icon="delete" size="large" type="ghost" onClick={()=> this.setState({deleteModal: true})} disabled={this.state.btnAll}>删除</Button>
                </div>
                <Table className="strategyTable" rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}  loading={this.props.isFetching}/>
              </div>
            </TabPane>
          </Tabs>

        </Card>
        <Modal title="删除策略" visible={this.state.deleteModal}
          onCancel={()=> this.setState({deleteModal: false})}
          onOk={()=> console.log(this.state.selectedRowKeys)}
        >
          <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>策略删除后将不再发送邮件告警，是否确定删除？</div>
        </Modal>
      </div>
    )
  }

}

function mapStateToProps(state, props) {
  const clusterName = props.params.cluster_name
  const { clusterID }  = props.params
  const { podeList, hostInfo, hostMetrics, hostInstant } = state.cluster || {}
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
  let instant = {}
  if (hostInstant && hostInstant.result) {
    instant = hostInstant.result
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
    instant,
    hostInfo
  }
}

export default connect(mapStateToProps, {
  getNodesPodeList,
  getHostInfo,
  loadHostMetrics,
  loadHostInstant,
  searchPodeList,
  changeClusterNodeSchedule
})(ClusterDetail)