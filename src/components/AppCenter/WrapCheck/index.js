/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Check page
 *
 * v0.1 - 2017-11-18
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Button, Table, Dropdown, Menu, Modal, Form, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import classNames from 'classnames'
import AppCheck from './AppCheck'
import ImageCheck from './ImageCheck'
import './style/index.less'
import { getWrapPublishList, passWrapPublish, refuseWrapPublish } from '../../../actions/app_center'
const TabPane = Tabs.TabPane;

export default class CheckPage extends React.Component {
  constructor(props) {
    super(props)
    this.tabChange = this.tabChange.bind(this)
    this.state = {
      activeKey: 'image'
    }
  }
  tabChange(activeKey) {
    this.setState({
      activeKey
    })
  }
  render() {
    const { activeKey } = this.state
    return(
      <QueueAnim>
        <Tabs key="checkPage" type="card" onChange={this.tabChange} className="checkPage" activeKey={activeKey}>
          <TabPane tab="镜像审核" key="image">
            <ImageCheck activeKey={activeKey}/>
          </TabPane>
          <TabPane tab="应用包审核" key="app">
            <AppCheck activeKey={activeKey}/>
          </TabPane>
        </Tabs>
      </QueueAnim>
    )
  }
}