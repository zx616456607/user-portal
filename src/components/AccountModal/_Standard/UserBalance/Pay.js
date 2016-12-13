/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User pay - Standard
 *
 * v0.1 - 2016-12-13
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class UserPay extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="UserPay">充值</div>
    )
  }
}

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  //
})(UserPay)
