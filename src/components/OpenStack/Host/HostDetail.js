/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * host HostDetail component
 *
 * v0.1 - 2017-7-15
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Modal, Card, Tabs, Row, Col,Icon, Spin } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Title from '../../Title'
// import TimeControl from '../../Metrics/TimeControl'
// import Metrics from '../Metrics'
import hostImg from '../../../assets/img/integration/host.png'
import '../style/HostDetail.less'
import { getVMDetail, getVMMeters } from '../../../actions/openstack/calculation_service'
import { formatDate } from '../../../common/tools'
import { browserHistory } from 'react-router'

const TabPane = Tabs.TabPane

class DetailInfo extends Component {
  constructor(props) {
    super()
  }

  render() {
    const { server } = this.props
    let serverIP = server.addresses
    const ips = []
    if(serverIP ) {
      const objectKeys = Object.getOwnPropertyNames(serverIP)
      if(objectKeys && objectKeys.length > 0) {
        objectKeys.forEach(item => {
          serverIP[item].forEach(ip => {
            ips.push(ip.addr)
          })
        })
      }
    }
    return (
      <Row gutter={16} className="detailInfo">
        <Col span="12">
          <Card>
            <div className="info-list textoverflow">云主机名称：{server.name} </div>
            <div className="info-list textoverflow">创建时间：{new Date(server.created).toLocaleString()} </div>
            <div className="info-list textoverflow">更新时间：{new Date(server.updated).toLocaleString()} </div>
            <div className="info-list textoverflow">CPU：{server.flavor.vcpus} C </div>
            <div className="info-list textoverflow">内存：{server.flavor.ram} M </div>
            <div className="info-list textoverflow">磁盘数量：{server['osExtendedVolumes:volumesAttached'].length} </div>
          </Card>
        </Col>
        <Col span="12">
          <Card>
            <div className="info-list textoverflow">云主机ID：{server.id} </div>
            <div className="info-list textoverflow">所属区域：{server['oSEXTAZ:availabilityZone']} </div>
            <div className="info-list textoverflow">IP地址：{ips.join(',')} </div>
          </Card>
        </Col>

      </Row>
    )
  }
}

class HostDetail extends Component {
  constructor(props) {
    super()
    this.state = {
      cpu: [{
        metrics:[]
      }],
      memory: [{
        metrics:[]
      }],
      incoming: [{
        metrics:[]
      }],
      outcoming: [{
        metrics:[]
      }],
      diskread: [{
        metrics: []
      }],
      diskwrite: [{
        metrics: []
      }]
    }
  }
  loadData() {

    const { getVMDetail, params, getVMMeters, location } = this.props
    getVMDetail(params.id)
    getVMMeters(params.id, 'cpu', {period: 60}, {
      success: {
        func: (res) => {
          let cpu = []
          if (res.meters) {
            cpu = res.meters.map(item => {
              return {
                value: item.max,
                timestamp: formatDate(item.periodEnd)
              }
            })
          }
          this.setState({
            cpu: [{
              metrics: cpu,
              containerName: params.name
            }]
          })
        }
      }
    })

    getVMMeters(params.id, 'memory', {period: 60}, {
      success: {
        func: (res) => {
          let memory = []
          if (res.meters) {
            memory = res.meters.map(item => {
              return {
                value: item.max * 1024 * 1024,
                timestamp: formatDate(item.periodEnd)
              }
            })

          }
          this.setState({
            memory: [{
              metrics: memory,
              containerName: params.name
            }]
          })
        }
      }
    })
    getVMMeters(params.id, 'incoming', {period:60}, {
      success: {
        func: (res) => {
          let incoming = []
          if (res.meters) {
            incoming = res.meters.map(item => {
              return {
                value: item.max,
                timestamp: formatDate(item.periodEnd)
              }
            })

          }
          this.setState({
            incoming: [{
              metrics: incoming,
              containerName: params.name
            }]
          })
        }
      }
    })
    getVMMeters(params.id, 'outgoing', {period: 60}, {
      success: {
        func: (res) => {
          let outgoing = []
          if (res.meters) {
            outgoing = res.meters.map(item => {
              return {
                value: item.max,
                timestamp: formatDate(item.periodEnd)
              }
            })

          }
          this.setState({
            outgoing: [{
              metrics: outgoing,
              containerName: params.name
            }]
          })
        }
      }
    })
    getVMMeters(params.id, 'diskread', {period: 60}, {
      success: {
        func: (res) => {
          let diskread = []
          if (res.meters) {
            diskread = res.meters.map(item => {
              return {
                value: item.max,
                timestamp: formatDate(item.periodEnd)
              }
            })

          }
          this.setState({
            diskread: [{
              metrics: diskread,
              containerName: params.name
            }]
          })
        }
      }
    })
    getVMMeters(params.id, 'diskwrite', {period: 60}, {
      success: {
        func: (res) => {
          let diskwrite = []
          if (res.meters) {
            diskwrite = res.meters.map(item => {
              return {
                value: item.max,
                timestamp: formatDate(item.periodEnd)
              }
            })
          }
          this.setState({
            diskwrite: [{
              metrics: diskwrite,
              containerName: params.name
            }]
          })
        }
      }
    })
  }
  componentWillMount() {
    this.loadData()
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
  getVMStatus(status) {
    if (!status) return ''
    switch (status) {
      case 'ACTIVE':
        return 'active'
      case 'BUILD':
        return 'build'
      case 'SHUTOFF':
        return 'shutoff'
      case 'ERROR':
        return 'error'
      default:
        return 'unkonow'
    }
  }
  getStatus(status) {
    status = this.getVMStatus(status)
    if (status == 'active') {
      return <span className="running"><i className="fa fa-circle"></i> 运行中</span>
    }
    if (status == 'build') {
      return <span className="padding"><i className="fa fa-circle"></i> 创建中</span>
    }
    if (status == 'shutoff') {
      return <span className="stop"><i className="fa fa-circle"></i> 已停止</span>
    }
    if (status == 'error') {
      return <span className="stop"><i className="fa fa-circle"></i> 异常</span>
    }
    return <span className="stop"><i className="fa fa-circle"></i> 未知</span>
  }
  render() {
    const { params, server } = this.props
    const showCpu =[]
    const showMemory = []
    const showNetworkRec = {}
    const showNetworkTrans = {}
    if(server.isFetcing || !server.result || !server.result.server) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    const serverDetail = server.result.server
    return (
      <QueueAnim  id="HostDetail" >
        <Title title={`${params.name}`} />
        <div className="clearfix">
          <span className="back" onClick={() => browserHistory.goBack()}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
        </div>
        <br />
        <div className="HostDetail" key="HostDetail">
          <Card className="top-status">
            <img src={hostImg} className="hostImg" />
            <ul className="host-status">
              <li>{params.name}</li>
              <li style={{marginTop: '20px'}}>运行状态：{this.getStatus(serverDetail.status)}</li>
            </ul>
          </Card>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="云主机详情" key="1">
                <DetailInfo server={serverDetail}/>
                <br />
              </TabPane>
              <TabPane tab="云主机监控" key="2">
                {/* <Metrics
                  cpu={{ data: this.state.cpu}}
                  memory={{ data: this.state.memory}}
                  networkReceived={{ data: this.state.incoming}}
                  networkTransmitted={{ data: this.state.outgoing}}
                  diskWrite={{data: this.state.diskwrite}}
                  diskRead={{data: this.state.diskread}}
                /> */}
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </QueueAnim>
    )

  }
}

function mapStateToProps(state, props) {
  const defaultServer = {
    isFetcing: false,
    result: []
  }
  const server = state.openstack.vmDetail || defaultServer
  return {
    server
  }
}

export default connect(mapStateToProps, {
  getVMDetail,
  getVMMeters
})(HostDetail)