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
    } else {
      this.setState({
        percent: 5
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
      if (percent >= 100) {
        clearInterval(this.progressInterval)
        delete this.progressInterval
        return
      }
      percent += 5
      this.setState({
        percent
      })
    }, 50) // After one second, the progress will up to 100%
  }

  getReplicasElement() {
    const { status } = this.props
    if (!status || this.isProcess(this.props)) {
      return
    }
    let replicasText
    const { availableReplicas, replicas, text } = status
    const exclamationIcon = (
      <Icon type="exclamation-circle-o" style={{ marginLeft: 5, color: 'orange' }} />
    )
    if (text) {
      replicasText = text
      if (availableReplicas < replicas) {
        replicasText = (
          <span>
            {text}{exclamationIcon}
          </span>
        )
      }
    } else if (availableReplicas === 0) {
      replicasText = (
        <span> All stopped</span>
      )
    } else if (availableReplicas < replicas) {
      replicasText = (
        <span>
          Section running{exclamationIcon}
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
    const { phase, creationTimestamp } = this.props
    if (!creationTimestamp) {
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
    if (smart) {
      return (
        <span className="TenxStatus">
          <span className={phase}>
            <i className="fa fa-circle" /> {phase}
          </span>
        </span>
      )
    }
    let phaseElement = (
      <div>
        <i className="fa fa-circle" /> {phase}
      </div>
    )
    let progressElement
    if (this.isProcess(this.props)) {
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
    'Starting', 'Pending', 'Deploying',
    'Stopping',
    'Terminating',
    'Scaling',
    'Restarting',
    'Redeploying', 'Rebuilding',

    'Unknown', 'Succeeded',
    'Stopped',
    'Running',
  ]).isRequired,
  progress: PropTypes.shape({
    status: PropTypes.bool,
    percent: PropTypes.number,
  }),
  status: PropTypes.shape({
    replicas: PropTypes.number,
    availableReplicas: PropTypes.number,
    text: PropTypes.string,
  }),
  creationTimestamp: PropTypes.string,
}

TenxStatus.defaultProps = {
  //
};

export default TenxStatus