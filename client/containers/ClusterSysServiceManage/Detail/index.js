/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * ClusterSysServiceManage Container
 *
 * @author Songsz
 * @date 2018-12-20
 *
*/

import React from 'react'
import { browserHistory } from 'react-router'
import ReturnButton from '@tenx-ui/return-button/lib'
import QueueAnmi from 'rc-queue-anim'
import './style/index.less'
import Title from '../../../../src/components/Title'
import { Card, Spin, Tabs } from 'antd'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { connect } from 'react-redux'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import queryString from 'query-string'
import { getSysList } from '../../../actions/sysServiceManage'
import Instance from './Instance'
import Log from './Log'
import Monitor from './Monitor/index'
import AlarmStrategy from '../../../../src/components/ManageMonitor/AlarmStrategy'
import classnames from 'classnames'

const TabPane = Tabs.TabPane

const mapState = state => {
  let query = {}
  if (window.location.search) {
    query = queryString.parse(window.location.search.substring(1))
  }
  return {
    clusterID: query.clusterID,
    isFetching: getDeepValue(state, 'sysServiceManage.services.isFetching'.split('.')),
  }
}

@connect(mapState, {
  getSysList,
})
class ClusterSysServiceManageDetail extends React.PureComponent {
  state = {
    data: {},
    active: this.props.location.query.active || 'instance',
  }
  async componentDidMount() {
    const res = await this.props.getSysList(this.props.clusterID)
    const data = (getDeepValue(res, 'response.result.data'.split('.')) || []).filter(item => item.name === this.props.location.query.name)[0]
    if (!data) return
    this.setState({ data })
  }
  returnSysServiceManage = () => {
    const { clusterID, goBack } = this.props.location.query
    if (clusterID && !goBack) {
      browserHistory.replace(`/cluster?clusterID=${clusterID}&from=sysServiceManageDetail`)
      return
    }
    if (goBack === 'alarmSetting') {
      browserHistory.replace(`/cluster/alarmSetting?forceCluster=${clusterID}`)
      return
    }
    browserHistory.goBack()
  }
  renderTab = () => {
    const { data } = this.state
    if (!data.name) return null
    const pods = data.pods || []
    return (
      <Card>
        <Tabs
          onChange={active => this.setState({ active })}
          activeKey={this.state.active}>
          <TabPane tab="服务实例" key="instance">
            <Instance {...this.props} {...data}/>
          </TabPane>
          <TabPane tab="监控" key="monitor">
            <Monitor podList={pods} {...this.props}/>
          </TabPane>
          <TabPane tab="日志" key="log">
            <Log service={data.name} {...this.props} />
          </TabPane>
          <TabPane tab="告警策略" key="alarm">
            <AlarmStrategy
              systemService={this.state.data.name}
              cluster={this.props.clusterID}
            />
          </TabPane>
        </Tabs>
      </Card>
    )
  }
  render() {
    const { location: { query }, isFetching } = this.props
    const { data } = this.state
    if (!query.clusterID || !query.name) this.returnSysServiceManage()
    const success = data.status === 'Running'
    return (
      <QueueAnmi className="clusterSysServiceManageDetail">
        <div key="rtn">
          <Title title="系统服务详情"/>
          <ReturnButton onClick={this.returnSysServiceManage}>返回</ReturnButton>
          <span className="first-title rtnBtn">系统服务详情</span>
        </div>
        <Card className="baseInfo" key="baseInfo">
          <TenxIcon className="leftIcon" type="AppsO" size={60} />
          <Spin spinning={isFetching}>
            <div className="right">
              <div className="name">{data.name}</div>
              <div className="status">
                <span>状态：</span>
                {
                  !isFetching &&
                  <span className={classnames({
                    statusSuccess: success,
                    statusError: !success,
                  })}><TenxIcon type="Circle"/>{success ? '运行中' : '异常'}</span>
                }
              </div>
              <div className="detail">实例数：{(data.pods || []).length}</div>
            </div>
          </Spin>
        </Card>
        { this.renderTab() }
      </QueueAnmi>
    )
  }
}

export default ClusterSysServiceManageDetail
