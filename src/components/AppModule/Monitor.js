/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * App monitor
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import Metrics from '../Metrics'

class Monitor extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Metrics />
    )
  }
}

Monitor.propTypes = {
  //
}

export default Monitor