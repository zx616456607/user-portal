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

class ContainerStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { status, creationTimestamp, deletionTimestamp, smart } = this.props
    let { phase, progress } = status
    if (deletionTimestamp) {
      phase = 'Terminating'
    }
    return (
      <div className="ContainerStatus">
        <TenxStatus
          phase={phase}
          progress={progress}
          creationTimestamp={creationTimestamp}
          smart={smart} />
      </div>
    )
  }
}

ContainerStatus.propTypes = {
  status: PropTypes.object.isRequired,
  creationTimestamp: PropTypes.string,
  deletionTimestamp: PropTypes.string,
  smart: PropTypes.bool,
}

export default ContainerStatus