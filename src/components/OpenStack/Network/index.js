/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * network Tabs component
 *
 * v0.1 - 2017-9-14
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Tabs,Card } from 'antd'
import QueueAnim from 'rc-queue-anim'
import Title from '../../Title'
import Network from './Item'
import FloatIp from '../ElasticIp'
import Routers from './Router'
import './style/index.less'

export default class NetworkTabs extends Component {
  constructor(props) {
    super(props)
    let activeKey = 'network'
    const { location } = props
    if(location.query.activeTab) {
      activeKey = location.query.activeTab
    }
    this.state = {
      activeKey
    }
  }
  render() {
    return (
      <QueueAnim id="network-tabs">
        <div key="network-key">
          <Title title="网络" />
          <Tabs defaultActiveKey={this.state.activeKey} className="ref-tabs">
            <Tabs.TabPane key="network" tab="专有网络">
              <Network />
            </Tabs.TabPane>
            <Tabs.TabPane key="floatIp" tab="浮动IP">
              <FloatIp />
            </Tabs.TabPane>
            <Tabs.TabPane key="router" tab="路由器">
              <Routers />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </QueueAnim>
    )
  }
}
