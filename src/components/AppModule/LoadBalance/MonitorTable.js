/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Load balance monitor table
 *
 * v0.1 - 2018-01-16
 * @author zhangxuan
 */

import React from 'react'
import { Tabs, Icon } from 'antd'
import { connect } from 'react-redux'
import { loadServiceDetail } from '../../../actions/services'
import './style/MonitorTable.less'
import AppServiceEvent from '../AppServiceDetail/AppServiceEvent'
import WhitelistTable from './WhitelistTable'
import InstanceTopology from '../../../../client/containers/AppModule/LoadBalance/instanceTopology'
import MonitorLoadBalance from '../../../../client/containers/AppModule/LoadBalance/Monitor'
import * as balanceActions  from '../../../actions/load_balance'
import Listener from '../../../../client/containers/AppModule/LoadBalance/Listener'
import LBDetailConfig from '../../../../client/containers/AppModule/LoadBalance/LBDetailConfig'

const TabPane = Tabs.TabPane

class MonitorTable extends React.Component {

  render() {
    const { togglePart, lbDetail, changeTabs, activeKey, clusterID, name, location,
      ingress, httpLoading, listenerType } = this.props
    return (
      <div className="monitorTable layout-content">
        <Tabs
          activeKey={activeKey}
          onChange={changeTabs}
        >
          <TabPane tab={'监听器'} key={'listener'}>
            <Listener
              {...{
                togglePart,
                ingress,
                httpLoading,
                location,
                lbDetail,
                clusterID,
                listenerType,
              }}
            />
          </TabPane>
          <TabPane tab={'配置管理'} key={'config'}>
            <LBDetailConfig
              {...{
                clusterID,
                name,
                lbDetail,
                location,
              }}
            />
          </TabPane>
          <TabPane tab="白名单" key="WHITELIST">
            <WhitelistTable
              type="WHITELIST"
              {...{ clusterID, name, lbDetail, location }}
            />
          </TabPane>
          <TabPane tab="实例拓扑" key="topo">
            <InstanceTopology key="topo" detail={lbDetail} />
          </TabPane>
          <TabPane tab='监控' key="monitor">
            {
              activeKey ==='monitor' &&
                <MonitorLoadBalance
                  {...{ clusterID, location }}
                />
            }
          </TabPane>
          <TabPane tab={<span>日志 <Icon type="export" /></span>} key="log">
            &nbsp;&nbsp;&nbsp;已在新窗口中打开
          </TabPane>
          <TabPane tab="事件" key="event">
            <AppServiceEvent serviceName={this.props.name} cluster={this.props.clusterID} type={'replicaset'} serviceDetailmodalShow={true}/>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
function mapStateToProps({
  loadBalance: { httpIngress: { data, isFetching } },
}, props) {
  const { lbDetail, clusterID } = props
  const name = lbDetail && lbDetail.deployment.metadata.name
  return {
    clusterID,
    ingress: data,
    httpLoading: isFetching,
    name
  }

  return state
}
export default connect(mapStateToProps, {
  loadServiceDetail,
  getHttpIngress: balanceActions.getHttpIngress,
})(MonitorTable)
