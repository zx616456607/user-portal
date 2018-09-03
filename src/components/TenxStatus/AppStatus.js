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
import { injectIntl } from 'react-intl'
import { getAppStatus } from '../../common/status_identify'
import intlMsg from './Intl'

class AppStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { app, smart, intl } = this.props
    let { status, services } = app
    const { formatMessage } = intl
    if (!status) {
      status = getAppStatus(services)
    }
    status.text = `${formatMessage(intlMsg.AppReplicasMsg, { total: services.length + '' })}`
    return (
      <TenxStatus
        phase={status.phase}
        status={status}
        smart={smart} />
    )
  }
}

AppStatus.propTypes = {
  app: PropTypes.object.isRequired,
  smart: PropTypes.bool,
}

export default injectIntl(AppStatus, {
  withRef: true,
})
