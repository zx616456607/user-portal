/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index state
 *
 * v0.1 - 2016-11-08
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'

class TenxState extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div class="TenxState">
      </div>
    )
  }
}

TenxState.propTypes = {
  phase: PropTypes.oneOf(['Pending', 'Running', 'Unknown', 'Terminating', 'Starting', 'Stopping', 'Scaling', 'Restarting', 'Redeployment']),
  replicas: PropTypes.number,
  availableReplicas: PropTypes.number,
}

export default TenxState