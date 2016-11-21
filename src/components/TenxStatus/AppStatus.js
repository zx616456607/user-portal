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
import { injectIntl, defineMessages } from 'react-intl'
import { getAppStatus } from '../../common/status_identify'

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
    const status = getAppStatus(services)
    status.text = `${formatMessage(messages.AppReplicasMsg, { total: services.length })}`
    return (
      <TenxStatus
        phase={phase || status.phase}
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