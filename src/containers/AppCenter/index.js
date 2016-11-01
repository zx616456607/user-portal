/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import ImageCenterSider from '../../components/AppCenterSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/AppCenter.less'

export default class ImageCenter extends Component {
  render() {
    const { children } = this.props
    return (
      <div id="AppCenter">
        <QueueAnim
          className="ImageCenterSiderAnimate"
          key="ImageCenterSiderAnimate"
          type="left"
          >
          <div className="imageMenu" key="imageSider">
            <ImageCenterSider />
          </div>
        </QueueAnim>
        <div className="imageContent">
          {children}
        </div>
      </div>
    )
  }
}

ImageCenter.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}