/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux main app file for no auth
 *
 * v0.1 - 2017-02-10
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Intercom from 'react-intercom'
import { getCookie } from '../../common/tools'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
const standardFlag = mode === standard
const user = {
  user_id: getCookie('intl_locale.sig'), // When the user refreshes the page, the record is not lost
  name: 'Logged-out Visitors'
}

class NoAuthApp extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { children } = this.props
    return (
      <div>
        {children}
        {standardFlag && <Intercom appID='okj9h5pl' { ...user } />}
      </div>
    )
  }
}

NoAuthApp.propTypes = {
  // Injected by React Router
  children: PropTypes.node,
}

function mapStateToProps(state, props) {
  return {
    //
  }
}

export default connect(mapStateToProps, {
  //
})(NoAuthApp)