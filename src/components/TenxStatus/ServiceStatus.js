/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Service status
 *
 * v0.1 - 2016-11-08
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import TenxStatus from './'
import { TENX_MARK } from '../../constants'

class ServiceStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { service, smart } = this.props
    const { status, metadata } = service
    const replicas = service.spec.replicas || metadata.annotations[`${TENX_MARK}/replicas`]
    let {
      phase,
      availableReplicas,
      updatedReplicas,
      unavailableReplicas,
      observedGeneration,
    } = status
    let progress
    if (!availableReplicas) {
      availableReplicas = 0
    }
    if (!phase) {
      if (observedGeneration >= metadata.generation && replicas === updatedReplicas) {
        availableReplicas = updatedReplicas
        phase = 'Running'
      } else if (updatedReplicas && unavailableReplicas) {
        phase = 'Deploying'
        progress = { status: false }
      } else if (availableReplicas < 1) {
        phase = 'Stopped'
      } else {
        phase = 'Running'
      }
    }
    return (
      <TenxStatus
        phase={phase}
        progress={progress}
        status={{ replicas: parseInt(replicas), availableReplicas }}
        smart={smart} />
    )
  }
}

ServiceStatus.propTypes = {
  /*status: PropTypes.object.isRequired,
  replicas: PropTypes.number,*/
  service: PropTypes.object.isRequired,
  smart: PropTypes.bool,
}

export default ServiceStatus