/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CICD component
 *
 * v0.1 - 2016-10-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import ICICDSider from '../../components/CICDSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/CICD.less'

export default class CICD extends Component {
  render() {
    const { children } = this.props
    return (
      <div id="CICD">
        <QueueAnim
          className="CICDSiderAnimate"
          key="CICDSiderAnimate"
          type="left"
          >
          <div className="CICDMenu" key="imageSider">
            <ICICDSider />
          </div>
        </QueueAnim>
        <div className="CICDContent">
          {children}
        </div>
      </div>
    )
  }
}

CICD.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}