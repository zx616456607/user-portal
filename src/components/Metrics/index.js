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
    const { cpu, memory, networkReceived, networkTransmitted } = this.props
    return (
      <div>
        <CPU cpu={cpu} />
        <Memory memory={memory} />
        <Network networkReceived={networkReceived}
          networkTransmitted={networkTransmitted}
        />
      </div>
    )
  }
}

Metrics.propTypes = {
  cpu: PropTypes.object.isRequired,
  memory: PropTypes.object.isRequired,
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

export default Metrics