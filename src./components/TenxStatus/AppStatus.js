/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * App status
 *
 * v0.1 - 2016-11-10
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import TenxStatus from './'
import { TENX_MARK } from '../../constants'
import { injectIntl, defineMessages } from 'react-intl'

const messages = defineMessages({
  AppReplicasMsg: {
    id: 'TenxStatus.AppReplicasMsg',
    defaultMessage: '共{total}个服务',
  }
})

class AppStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { services, phase, smart, intl } = this.props
    const { formatMessage } = intl
    let status = {
      replicas: services.length,
      availableReplicas: 0,
      text: `${formatMessage(messages.AppReplicasMsg, { total: services.length })}`
    }
    services.map(service => {
      let replicas = service.spec.replicas || service.metadata.annotations[`${TENX_MARK}/replicas`]
      let { availableReplicas, updatedReplicas } = service.status
      if (replicas > 0 && (availableReplicas > 0 || updatedReplicas > 0)) {
        status.availableReplicas++
      }
    })
    if (!phase) {
      if (status.availableReplicas === 0) {
        phase = 'Stopped'
      } else if (status.availableReplicas > 0) {
        phase = 'Running'
      } else {
        phase = 'Unknown'
      }
    }
    return (
      <TenxStatus
        phase={phase}
        status={status}
        smart={smart} />
    )
  }
}

AppStatus.propTypes = {
  services: PropTypes.array.isRequired,
  phase: PropTypes.string,
  smart: PropTypes.bool,
}

export default injectIntl(AppStatus, {
  withRef: true,
})