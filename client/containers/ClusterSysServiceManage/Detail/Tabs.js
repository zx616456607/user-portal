/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2018-12-24
 *
*/

import React from 'react'
import { Tabs, Card } from 'antd'
import Instance from './Instance'
import Log from './Log'
import Monitor from './Monitor'
import Alarm from './Alarm'

const TabPane = Tabs.TabPane

export default class DetailTabs extends React.PureComponent {
  state = {
    active: this.props.location.query.active || 'instance',
  }

  render() {
    return (
      <Card>
        <Tabs
          onChange={active => this.setState({ active })}
          activeKey={this.state.active}>
          <TabPane tab="服务实例" key="instance">
            <Instance {...this.props}/>
          </TabPane>
          <TabPane tab="监控" key="monitor">
            <Monitor/>
          </TabPane>
          <TabPane tab="日志" key="log">
            <Log {...this.props}/>
          </TabPane>
          <TabPane tab="告警策略" key="alarm">
            <Alarm/>
          </TabPane>
        </Tabs>
      </Card>
    )
  }
}
