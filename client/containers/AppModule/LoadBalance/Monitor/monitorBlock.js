/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * monitor loadBabanlce
 *
 * @author lvjunfeng
 * @date 2018-12-19
 *
*/

import React from 'react'
import { Icon, Tooltip } from 'antd'
import './style/monitor.less'

const MonitorBlock = ({ title, tip, content, unit }) => (
  <div className="monitorBlock">
    <div className="monitorHeader">
      { title }
      {
        tip ?
          <Tooltip title={tip}>
            <Icon type="exclamation-circle-o" />
          </Tooltip>
          : null
      }
    </div>
    <div className="monitorCont">
      <div className="monitorNum">
        { content !== undefined ? Math.round(content * 100) / 100 : 'N/A' }
        { content !== undefined ? <div className="unit">{unit}</div> : null }
      </div>
    </div>
  </div>
)

export default MonitorBlock
