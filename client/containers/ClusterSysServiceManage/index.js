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

class ClusterSysServiceManage extends React.PureComponent {
  renderAlarm = () => {
    return (
      <div className="cards">
        {
          [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ].map(i =>
            <AlarmCard cluster={this.props.cluster} key={i}/>
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
