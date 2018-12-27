/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * Log Component
 *
 * @author Songsz
 * @date 2018-12-12
 *
*/

import React from 'react'
import './style/Log.less'
import ContainerLogs from '../../../src/components/ContainerModule/ContainerLogs'

class Log extends React.PureComponent {

  render() {
    // const height = true ? window.screen.height : this.props.height
    const height = this.props.height
    const { logShow: { key, clusterID, name } } = this.props
    return (
      <div className="terminalNLog_Log" style={{ height, background: '#2a2a2a' }} id="VMWrapTermLog_log">
        <ContainerLogs
          visible={!!key}
          func={{
            closeModal: () => this.props.setPropsState({ logShow: {} }),
          }}
          cluster={clusterID}
          containerName={name}
        />
      </div>
    )
  }
}

export default Log
