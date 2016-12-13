/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User balance - Standard
 *
 * v0.1 - 2016-12-13
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

class UserBalance extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="UserBalance">
        账户余额，<Link to="/account/balance/pay">充值</Link>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  //
})(UserBalance)
