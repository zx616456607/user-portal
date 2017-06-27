/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Notification header
 *
 * v0.1 - 2017-06-27
 * @author Zhangpc
 */

import React from 'react'
import { Badge } from 'antd'
import { connect } from 'react-redux'
import './style/Header.less'

class Header extends React.Component {
  render() {
    const { notification } = this.props
    const { count } = notification
    return (
      <div className="notification-header">
        <div className="header-left">
          {this.props.message}
        </div>
        {
          count > 0 && (
            <div className="header-right">
              <Badge count={count} />
            </div>
          )
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { notifications } = state
  return {
    notification: notifications[props.id] || {}
  }
}

export default connect(mapStateToProps, {
  //
})(Header)
