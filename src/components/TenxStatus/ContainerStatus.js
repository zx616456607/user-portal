/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Container status
 *
 * v0.1 - 2016-11-08
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import TenxStatus from './'
import { getContainerStatus } from '../../common/status_identify'

class ContainerStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { container, smart } = this.props
    const { metadata } = container
    const { creationTimestamp, deletionTimestamp } = metadata
    let { phase, progress } = getContainerStatus(container)
    if (deletionTimestamp) {
      phase = 'Terminating'
    }
    return (
      <TenxStatus
        phase={phase}
        progress={progress}
        creationTimestamp={creationTimestamp}
        smart={smart} />
    )
  }
}

ContainerStatus.propTypes = {
  container: PropTypes.object.isRequired,
  // status: PropTypes.object.isRequired,
  // creationTimestamp: PropTypes.string,
  // deletionTimestamp: PropTypes.string,
  smart: PropTypes.bool,
}

export default ContainerStatus