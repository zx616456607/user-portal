/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import SettingSider from '../../components/SettingSider'
import QueueAnim from 'rc-queue-anim'
import './style/setting.less'

export default class Setting extends Component {
  render() {
    const { children } = this.props
    return (
      <div id="Setting">
        <QueueAnim
          className="settingAnimate"
          key="settingAnimate"
          type="left"
        >
          <div className="settingMenu" key="settingSider">
            <SettingSider />
          </div>
        </QueueAnim>
        <div className="settingContent">
          {children}
        </div>
      </div>
    )
  }
}

Setting.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}