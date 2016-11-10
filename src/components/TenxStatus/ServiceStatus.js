/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index status
 *
 * v0.1 - 2016-11-08
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import TenxStatus from './'

class ServiceStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { replicas, status } = this.props
    let { phase, availableReplicas, updatedReplicas, unavailableReplicas} = status
    let progress
    if (!availableReplicas) {
      availableReplicas = 0
    }
    if (!phase) {
      if (updatedReplicas && unavailableReplicas) {
        phase = 'Deploying'
        progress = { status: false }
      } else if (availableReplicas < 1) {
        phase = 'Stopped'
      } else {
        phase = 'Running'
      }
    }
    return (
      <div className="ServiceStatus">
        <TenxStatus
          phase={phase}
          progress={progress}
          status={{ replicas: parseInt(replicas), availableReplicas }} />
      </div>
    )
  }
}

ServiceStatus.propTypes = {
  status: PropTypes.object.isRequired
}

export default ServiceStatus