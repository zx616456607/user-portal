/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Create Alarm component
 *
 * v0.1 - 2017-3-20
 * @author Baiyu
 */

import React, { Component } from 'react'
import { Radio } from 'antd'

class AlarmModal extends Component {
  render() {
    return (
      <div className="AlarmModal">
        <div className="topStep">
          <span className="step">1 参数设置</span>
          <span className="step">2 告警规则</span>
          <span className="step">3 告警行为</span>
        </div>
        <div className="alarmContent">
          <div className="stepOne">
            <div className="sendEmail">
              <span className="key">发送通知</span>

            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AlarmModal