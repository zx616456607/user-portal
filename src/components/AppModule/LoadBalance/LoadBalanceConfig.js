/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance config
 *
 * v0.1 - 2018-01-15
 * @author zhangxuan
 */

import React from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import BaseInfo from './BaseInfo'
import MonitorTable from './MonitorTable'
import MonitorDetail from './MonitorDetail'
import './style/LoadBalanceConfig.less'
import Title from '../../Title'
import TcpUdpDetail from './TcpUdpDetail'
import { getDeepValue } from "../../../../client/util/util";
import { getLBDetail, deleteIngress, editLB } from '../../../actions/load_balance'
import { toQuerystring } from '../../../common/tools';

class LoadBalanceConfig extends React.Component {
  state = {
    tablePart: true,
    activeKey: 'HTTP',
  }

  componentWillMount() {
    const { getLBDetail, clusterID, location } = this.props
    const { name, displayName } = location.query
    getLBDetail(clusterID, name, displayName)
  }
  togglePart = (flag, data, type) => {
    this.setState({
      tablePart: flag,
      currentIngress: data,
      activeKey: type,
    })
  }

  renderDetail = () => {
    const { activeKey, currentIngress } = this.state
    const { clusterID, location, lbDetail } = this.props
    switch (activeKey) {
      case 'HTTP':
        return <MonitorDetail
          currentIngress={currentIngress}
          togglePart={this.togglePart}
          clusterID={clusterID}
          location={location}
          lbDetail={lbDetail}
        />
      case 'TCP':
      case 'UDP':
        return <TcpUdpDetail
          currentIngress={currentIngress}
          type={activeKey}
          clusterID={clusterID}
          location={location}
          togglePart={this.togglePart}
          lbDetail={lbDetail}
        />
      default:
        return
    }
  }

  changeTabs = activeKey => {
    this.setState({
      activeKey,
    })
    switch (activeKey) {
      case 'monitor':
      case 'log':
        const name = getDeepValue(this.props.lbDetail.deployment, ['metadata', 'name' ])
        return window.open(`/app-stack/Deployment?redirect=/Deployment/${name}/${activeKey}`)
    }
  }

  render() {
    const { tablePart, activeKey } = this.state
    const { clusterID, location, lbDetail, deleteIngress, getLBDetail, editLB } = this.props
    return (
      <QueueAnim className="loadBalanceConfig">
        <Title title="配置负载均衡器"/>
        <div className="configHeader" key="configHeader">
          <span
            className="back"
            onClick={() => browserHistory.push(`/app_manage/load_balance`)}
          >
              <span className="backjia"/>
              <span className="btn-back">返回</span>
            </span>
          <span className="headerTitle">
            配置负载均衡器
          </span>
        </div>
        <BaseInfo
          key="baseInfo"
          lbDetail={lbDetail}
          clusterID={clusterID}
          getLBDetail={getLBDetail}
          editLB={editLB}
          location={location}
        />
        <div key="tableAndDetail">
          {
            tablePart ?
              <MonitorTable
                togglePart={this.togglePart}
                changeTabs={this.changeTabs}
                {...{
                  lbDetail,
                  deleteIngress,
                  getLBDetail,
                  clusterID,
                  location,
                  activeKey
                }}
              />
              : this.renderDetail()
          }
        </div>
      </QueueAnim>
    )
  }
}

const mapStateToProps = state => {
  const { entities, loadBalance } = state
  const { clusterID } = entities.current.cluster
  const { loadBalanceDetail } = loadBalance
  const { data: lbDetail } = loadBalanceDetail
  return {
    clusterID,
    lbDetail
  }
}

export default connect(mapStateToProps, {
  getLBDetail,
  deleteIngress,
  editLB
})(LoadBalanceConfig)
