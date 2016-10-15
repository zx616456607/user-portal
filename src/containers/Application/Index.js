/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppList component
 *
 * v0.1 - 2016-09-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import AppSider from '../../components/ApplicationSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/Application.less'

export default class Application extends Component {
  render() {
    const { children } = this.props
    return (
      <div id="Application">
        <QueueAnim
          className="appSiderAnimate"
          key="appSiderAnimate"
          type="left"
          >
          <div className="appMenu" key="appSider">
            <AppSider />
          </div>
        </QueueAnim>
        <div className="appContent">
          {children}
        </div>
      </div>
    )
  }
}

Application.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}