/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import CPU from './CPU'
import Memory from './Memory'
import Network from './Network'

class Metrics extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <CPU />
        <Memory />
        <Network />
      </div>
    )
  }
}

Metrics.propTypes = {
  //
}

export default Metrics