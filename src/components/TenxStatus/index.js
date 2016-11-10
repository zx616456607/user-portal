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
import { Progress, Icon } from 'antd'
import moment from 'moment'
import './style/TenxStatus.less'

const PROGRESS_PHASES = [
  'Pending',
  'Terminating', 'Starting', 'Stopping',
  'Scaling', 'Restarting', 'Redeploying',
  'Rebuilding',
]
let progressInterval

class TenxStatus extends Component {
  constructor(props) {
    super(props)
    this.setProgressPercent = this.setProgressPercent.bind(this)
    let percent = props.progress && props.progress.percent
      ? props.progress.percent
      : 5
    this.state = {
      percent
    }
  }

  componentWillReceiveProps(nextProps) {
    const { progress } = nextProps
    if (progress && progress.percent) {
      this.setState({
        percent: progress.percent
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.progressInterval)
    delete this.progressInterval
  }

  isProcess(props) {
    const {
      phase,
      progress,
    } = props
    if (progress && progress.status === false) {
      return false
    }
    if (progress || PROGRESS_PHASES.indexOf(phase) > -1) {
      return true
    }
    return false
  }

  setProgressPercent(percent) {
    this.progressInterval = setInterval(() => {
      if (percent >= 95) {
        clearInterval(this.progressInterval)
        delete this.progressInterval
      }
      percent += 5
      this.setState({
        percent
      })
    }, 100)
  }

  getReplicasElement() {
    const { status, smart } = this.props
    if (smart || !status || this.isProcess(this.props)) {
      return
    }
    let replicasText
    const { availableReplicas, replicas } = status
    if (availableReplicas === 0) {
      replicasText = (
        <span> All stopped</span>
      )
    } else if (availableReplicas < replicas) {
      replicasText = (
        <span>
          Section running
          <Icon type="exclamation-circle-o" style={{ marginLeft: 5, color: 'orange' }} />
        </span>
      )
    } else {
      replicasText = (
        <span>All running</span>
      )
    }
    return (
      <div>
        {`${availableReplicas}/${replicas} `}
        {replicasText}
      </div>
    )
  }

  getCreationTimestampElement() {
    const { phase, creationTimestamp, smart } = this.props
    if (smart || !creationTimestamp) {
      return
    }
    const date = new Date(creationTimestamp)
    if (phase === 'Succeeded') {
      return (
        <div>
          Succeeded {moment().fromNow(date)}
        </div>
      )
    }
    if (phase === 'Running') {
      return (
        <div>
          Running for {moment().from(date, true)}
        </div>
      )
    }
    return
  }

  render() {
    const {
      phase,
      progress,
      smart,
      deletionTimestamp,
    } = this.props
    const {
      percent
    } = this.state
    let phaseElement = (
      <div>
        <i className="fa fa-circle" /> {deletionTimestamp ? 'Terminating' : phase}
      </div>
    )
    let progressElement
    if (!smart && this.isProcess(this.props)) {
      phaseElement = (
        <div>
          {phase}
        </div>
      )
      progressElement = (
        <Progress
          strokeWidth={8}
          showInfo={false}
          status="active"
          percent={percent} />
      )
      if (!this.progressInterval) {
        this.setProgressPercent(percent)
      }
    }
    return (
      <div className="TenxStatus">
        <div className={phase}>
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
  smart: PropTypes.bool,
  phase: PropTypes.oneOf([
    'Pending', 'Running', 'Unknown',
    'Terminating', 'Starting', 'Stopping',
    'Scaling', 'Restarting', 'Redeploying',
    'Rebuilding', 'Succeeded', 'Stopped',
    'Deploying',
  ]).isRequired,
  progress: PropTypes.shape({
    status: PropTypes.bool,
    percent: PropTypes.number,
  }),
  status: PropTypes.shape({
    replicas: PropTypes.number,
    availableReplicas: PropTypes.number,
  }),
  creationTimestamp: PropTypes.string,
}

TenxStatus.defaultProps = {
  //
};

export default TenxStatus