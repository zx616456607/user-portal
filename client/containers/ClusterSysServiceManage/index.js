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
import { Card, Button, Tooltip, Spin } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import AlarmCard from './AlarmCard'
import { getSysList } from '../../actions/sysServiceManage'
import { connect } from 'react-redux'
import { getDeepValue } from '../../util/util'

const mapState = state => ({
  serviceList: getDeepValue(state, 'sysServiceManage.services.data'.split('.')) || {},
  isFetching: getDeepValue(state, 'sysServiceManage.services.isFetching'.split('.')),
})

@connect(mapState, { getSysList })
class ClusterSysServiceManage extends React.Component {
  async componentDidMount() {
    this.refresh()
  }
  refresh = () => {
    this.props.clusterID && this.props.getSysList(this.props.clusterID)
  }
  render() {
    const { clusterID, isFetching } = this.props
    const list = this.props.serviceList[clusterID] || []
    return (
      <QueueAnim>
        <Card key="card" className="clusterSysServiceManage">
          <div className="actions">
            <Tooltip title="全局告警：下面列表中任意一个组件状态异常，将会触发告警">
              <Button size="large" className="alarmBtn" icon="notification" type="primary">全局告警</Button>
            </Tooltip>
            <Button onClick={this.refresh} size="large"><i className="fa fa-refresh" />&nbsp;&nbsp;刷新</Button>
          </div>
          <Spin spinning={list && isFetching}>
            <div className="cards">
              {list.map((item, i) =>
                <AlarmCard data={item} clusterID={clusterID} key={i}/>
              )}
            </div>
          </Spin>
        </Card>
      </QueueAnim>
    )
  }
}

export default ClusterSysServiceManage
