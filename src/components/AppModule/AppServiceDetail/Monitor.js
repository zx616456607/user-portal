/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Service monitor
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import Metrics from '../../Metrics'
import TimeControl from '../../Metrics/TimeControl'

class Monitor extends Component {
  constructor(props) {
    super(props)
  }

  onTimeChange(e) {
    console.log(e.target.value)
  }

  render() {
    return (
      <div id="SerivceMonitor">
        <TimeControl onChange={this.onTimeChange} />
        <Metrics />
      </div>
    )
  }
}

Monitor.propTypes = {
  //
}

export default Monitor