/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import './style/Index.less'
import CPU from './CPU'
import Memory from './Memory'
import Network from './Network'
import Disk from './Disk'
import Tcp from './Tcp'

class Metrics extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {
      cpu, memory, networkReceived, networkTransmitted,
      events, diskReadIo, diskWriteIo, scope, diskHide,
      tcpListen, tcpEst, tcpClose, tcpTime, showTcp, hideInstantBtn,
      isService,
    } = this.props
    return (
      <div className="metrics" style={{marginTop:12}}>
        <CPU
          {...{
            cpu,
            events,
            scope,
            hideInstantBtn,
            isService,
          }}
        />
        <Memory
          {...{
            memory,
            events,
            scope,
            hideInstantBtn,
            isService,
          }}
        />
        <Network
          {...{
            networkReceived,
            networkTransmitted,
            events,
            scope,
            hideInstantBtn,
            isService,
          }}
        />
        {
          !diskHide &&
            <Disk
              {...{
                diskReadIo,
                diskWriteIo,
                events,
                scope,
                hideInstantBtn,
                isService,
              }}
            />
        }
        {
          showTcp &&
            <Tcp
              {...{
                tcpListen,
                tcpEst,
                tcpClose,
                tcpTime,
                events,
                scope,
                hideInstantBtn,
                isService,
              }}
            />
        }
      </div>
    )
  }
}

Metrics.propTypes = {
  cpu: PropTypes.object.isRequired,
  memory: PropTypes.object.isRequired,
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

export default Metrics
