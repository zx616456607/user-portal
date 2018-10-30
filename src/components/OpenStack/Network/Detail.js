/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * network detail component
 *
 * v0.1 - 2017-7-15
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Button, Input, Modal, Card, Tabs, Row, Col, Icon } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Link,browserHistory } from 'react-router'
import Title from '../../Title'
import { getNetWorksDetail, getSubnetsDetail} from '../../../actions/openstack/networks'
import { connect } from 'react-redux'
// import TimeControl from '../../Metrics/TimeControl'
import networkImg from '../../../assets/img/integration/network.png'
import { formatDate } from '../../../common/tools'
import '../style/HostDetail.less'

class NetworkDetail extends Component {
  constructor(props) {
    super()
  }
  componentWillMount() {
    const { params, getSubnetsDetail, location } = this.props
    const project = location.query.project
    if(!project) {
      return
    }
    this.props.getNetWorksDetail(params.id, {project},{
      success: {
        func: (res) => {
          if(res.network) {
            const subnet = res.network.subnets
            if(subnet && subnet.length > 0) {
              getSubnetsDetail(subnet[0], {project})
            }
          }
        },
        isAsync: true
      }
    })
  }
  render() {
    const { params, networkDetail, subnet } = this.props
    const getStatus = () => {
      if (!networkDetail.status) return (<span className="running"> 未知</span>)
      switch (networkDetail.status) {
        case 'ACTIVE':
          return <span className="running"> 可用</span>
        case 'BUILD':
          return <span className="running"> 可用</span>
        case 'SHUTOFF':
          return <span className="running"> 可用</span>
        default:
          return <span className="running"> 未知</span>
      }
    }

    return (
      <QueueAnim id="HostDetail" >
        <Title title={`${params.name}`} />
        <Row>
          <span className="back" onClick={() => browserHistory.goBack()}>
            <span className="backjia"></span>
            <span className="btn-back">返回</span>
          </span>
        </Row>
        <br />
        <div className="HostDetail" key="HostDetail">
          <Card className="top-status">
            <img src={networkImg} className="hostImg" />
            <ul className="host-status">
              <li style={{fontSize:18}}>{params.name}</li>
              <li>运行状态：{getStatus()}</li>
              <li>创建时间：{formatDate(networkDetail.createdAt)}</li>
            </ul>
          </Card>
          <Card>
            <div className="title"><div className="text">网络基本信息</div></div>
            <Row gutter={16} className="detailInfo">
              <Col span="12">
                <Card>
                  <div className="info-list textoverflow">名称：{networkDetail.name} </div>
                  <div className="info-list textoverflow">状态：{getStatus()} </div>
                  <div className="info-list textoverflow">网段：{subnet.cidr} </div>
                </Card>
              </Col>
              <Col span="12">
                <Card>
                  <div className="info-list textoverflow">ID：{networkDetail.id} </div>
                  <div className="info-list textoverflow">创建时间：{formatDate(networkDetail.createdAt)} </div>
                  <div className="info-list textoverflow">备注：{networkDetail.description} </div>
                </Card>
              </Col>
            </Row>

          </Card>
        </div>
      </QueueAnim>
    )

  }
}

function mapToStateProps(state, props) {
  const { netDetail, subnet } = state.openstack
  let networkDetail = {}
  let isFetching
  if (netDetail && netDetail.result) {
    networkDetail = netDetail.result.network
    isFetching = netDetail.isFetching
  }
  let sn = {}
  if (subnet && subnet.result && subnet.result.subnet) {
    sn = subnet.result.subnet
  }
  return {
    isFetching,
    networkDetail,
    subnet: sn
  }
}

export default connect(mapToStateProps, {
  getNetWorksDetail,
  getSubnetsDetail
})(NetworkDetail)