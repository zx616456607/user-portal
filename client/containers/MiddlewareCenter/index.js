/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Middleware center
 *
 * @author zhangxuan
 * @date 2018-09-06
 */
import React from 'react'
import { connect } from 'react-redux'
import './style/index.less'

@connect()
class MiddlewareCenter extends React.PureComponent {
  state = {
    containerSiderStyle: 'normal',
  }

  render() {
    const { children } = this.props
    return (
      <div id="MiddlewareCenter">
        <div
          className="middlewareContent CommonSecondContent"
        >
          {children}
        </div>
      </div>
    )
  }
}

export default MiddlewareCenter
