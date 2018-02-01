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

import { getLBDetail, deleteIngress, editLB } from '../../../actions/load_balance'

class LoadBalanceConfig extends React.Component {
  state = {
    tablePart: true,
  }
  
  componentWillMount() {
    const { getLBDetail, clusterID, location } = this.props
    const { name, displayName } = location.query
    getLBDetail(clusterID, name, displayName)
  }
  togglePart = (flag, data) => {
    this.setState({
      tablePart: flag,
      currentIngress: data
    })
  }
  
  render() {
    const { tablePart, currentIngress } = this.state
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
                lbDetail={lbDetail}
                togglePart={this.togglePart}
                deleteIngress={deleteIngress}
                getLBDetail={getLBDetail}
                clusterID={clusterID}
                location={location}
              />
              :
              <MonitorDetail
                currentIngress={currentIngress}
                togglePart={this.togglePart}
                clusterID={clusterID}
                location={location}
              />
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