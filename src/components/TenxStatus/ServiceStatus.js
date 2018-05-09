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
import { getServiceStatus } from '../../common/status_identify'

class ServiceStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { service, smart } = this.props
    const status = getServiceStatus(service)
    const { phase, progress, replicas, readyReplicas } = status
    return (
      <TenxStatus
        phase={phase}
        progress={progress}
        status={{ replicas: parseInt(replicas), readyReplicas }}
        smart={smart} />
    )
  }
}

ServiceStatus.propTypes = {
  service: PropTypes.object.isRequired,
  smart: PropTypes.bool,
}

export default ServiceStatus