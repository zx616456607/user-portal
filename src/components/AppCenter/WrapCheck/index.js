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
import Title from '../../Title'
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
    const { location } = this.props
    const { activeKey } = this.state
    const imageComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': activeKey === "image"
    })
    const appComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': activeKey === "app"
    })
    return(
      <QueueAnim className="checkPage">
        <Title title="发布审核"/>
        <ul className='tabs_header_style' key="btns">
          <li className={imageComposeStyle}
              onClick={this.tabChange.bind(this, "image")}
          >
            镜像审核
          </li>
          <li className={appComposeStyle}
              onClick={this.tabChange.bind(this, "app")}
          >
            应用包审核
          </li>
        </ul>
        {activeKey === "image" ? <ImageCheck key="imageBody" activeKey={activeKey} location={location} /> : null}
        {activeKey === "app" ? <AppCheck key="appBody" activeKey={activeKey} /> : null}
      </QueueAnim>
    )
  }
}