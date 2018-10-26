/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Load Balancer Component
 *
 * v0.1 - 2017-07-21
 * @author Zhangcz
 */

import React from 'react'
import QueueAnim from 'rc-queue-anim'
import { Tabs, Card } from 'antd'
// import UnderConstruction from '../../UnderConstruction/index'
import './style/index.less'
import ServiceLoadBalancer from './NewLoadBalancer'
import GlobalBalancer from './GlobalBalancer'
import { browserHistory } from 'react-router'

const TabPane = Tabs.TabPane

export default class LoadBalancer extends React.Component {
  constructor(props){
    super(props)
  }
  state = {
    activeKey:'service'
  }
  componentWillMount() {
    const { query } = this.props.location
    if (query.activeKey) {
      this.setState({activeKey:query.activeKey})
    }
  }
  changeActive(key) {
    this.setState({activeKey: key})
    if (key ==='service') {
      browserHistory.push('/base_station/load_balancer')
    }
  }
  render() {
    const { location } = this.props
    return (
      <QueueAnim
        className='AppList'
      >
        <div id='load_balancer_Tab' key='load_balancer_Tab'>
          <Tabs activeKey={this.state.activeKey} onChange={(key)=> this.changeActive(key)} className="ref-tabs">
            <TabPane tab="服务器负载均衡" key='service'>
              <ServiceLoadBalancer />
            </TabPane>
            <TabPane tab="全局负载均衡" key='global'>
              <GlobalBalancer />
            </TabPane>
          </Tabs>
        </div>
      </QueueAnim>
    )
  }
}
