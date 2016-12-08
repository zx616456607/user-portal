/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux main app file - Standard
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Sider from '../../../components/Sider/Standard'
import App from '../'

class StandardApp extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <App siderStyle='bigger' Sider={Sider} {...this.props} />
    )
  }
}

// For transfer redux props to App component
function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  //
})(StandardApp)
