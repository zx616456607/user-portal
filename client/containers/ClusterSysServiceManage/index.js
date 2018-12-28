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
import { Card, Button, Tooltip } from 'antd'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import AlarmCard from './AlarmCard'
import { getSysList } from '../../actions/sysServiceManage'
import { connect } from 'react-redux'
import { getDeepValue } from '../../util/util'
import queryString from 'query-string'

const mapState = state => ({
  clusterID: getDeepValue(state, 'entities.current.cluster.clusterID'.split('.'))
    || queryString.parse(window.location.search.substring(1)).clusterID,
  serviceList: getDeepValue(state, 'sysServiceManage.services.list'.split('.')) || [],
})

@connect(mapState, { getSysList })
class ClusterSysServiceManage extends React.PureComponent {
  async componentDidMount() {
    await this.props.getSysList(this.props.clusterID)
  }

  renderAlarm = () => {
    return (
      <div className="cards">
        {
          this.props.serviceList.map((item, i) =>
            <AlarmCard data={item} cluster={this.props.cluster} key={i}/>
          )
        }
      </div>
    )
  }
  render() {
    return (
      <QueueAnim>
        <Card key="card" className="clusterSysServiceManage">
          <div className="actions">
            <Tooltip title="全局告警：下面列表中任意一个组件状态异常，将会触发告警">
              <Button size="large" className="alarmBtn" icon="notification" type="primary">全局告警</Button>
            </Tooltip>
            <Button size="large"><i className="fa fa-refresh" />&nbsp;&nbsp;刷新</Button>
          </div>
          {this.renderAlarm()}
        </Card>
      </QueueAnim>
    )
  }
}

export default ClusterSysServiceManage
