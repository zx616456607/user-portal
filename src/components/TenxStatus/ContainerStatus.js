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

class TenxStatus extends Component {
  constructor(props) {
    super(props)
  }

  getReplicasElement() {
    const { replicas } = this.props
    if (!replicas) {
      return
    }
    let replicasText
    const { current, desire } = replicas
    if (current === 0) {
      replicasText = (
        <span>All stopped</span>
      )
    } else if (current < desire) {
      replicasText = (
        <span>
          Section running
          <Icon type="exclamation-circle-o" style={{ color: 'yellow' }} />
        </span>
      )
    } else {
      replicasText = (
        <span>All running</span>
      )
    }
    return (
      <div>
        {`${current}/${desire} `}
        {replicasText}
      </div>
    )
  }

  getCreationTimestampElement() {
    const { creationTimestamp } = this.props
    const date = new Date(creationTimestamp)
    return (
      <div>
        Running for {moment().from(date, true)}
      </div>
    )
  }

  render() {
    const {
      phase,
      progress,
    } = this.props
    let phaseElement = (
      <div>
        <i className="fa fa-circle" /> {phase}
      </div>
    )
    let progressElement
    if (progress) {
      phaseElement = (
        <div>
          {phase}
        </div>
      )
      progressElement = (
        <Progress strokeWidth={5} showInfo={false} status="active" />
      )
    }
    return (
      <div class="TenxStatus">
        <div class={phase}>
          {phaseElement}
          {progressElement}
        </div>
        <div className="text">
          {this.getReplicasElement()}
          {this.getCreationTimestampElement()}
        </div>
      </div>
    )
  }
}

TenxStatus.propTypes = {
  phase: PropTypes.oneOf([
    'Pending', 'Running', 'Unknown',
    'Terminating', 'Starting', 'Stopping',
    'Scaling', 'Restarting', 'Redeploymenting',
    'rebuilding',
  ]).isRequired,
  progress: PropTypes.shape({
    percent: PropTypes.number,
  }),
  replicas: PropTypes.shape({
    desire: PropTypes.number,
    current: PropTypes.number,
  }),
  creationTimestamp: PropTypes.string,
}

export default TenxStatus