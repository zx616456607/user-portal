/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Monitor panel content
 *
 * v0.1 - 2017-12-20
 * @author zhangxuan
 */

import React from 'react'
import PanelBtnGroup from './PanelBtnGroup'
import MonitorChartTemp from './MonitorChartTemp'
import './style/PanelContent.less'

export default class PanelContent extends React.Component {
  constructor() {
    super()
    this.startTime = new Date(new Date(new Date()
      .setDate(new Date().getDate() - 1))
      .setHours(0, 0, 0, 0))
  }
  render() {
    const { btnGroupFunc, currentPanel } = this.props
    return (
      <div>
        <PanelBtnGroup
          currentPanel={currentPanel}
          btnGroupFunc={btnGroupFunc}
          value={[this.startTime, new Date()]}
          onOk={() => console.log('ok')}
        />
        <div className="chartTempWrapper">
          <MonitorChartTemp
            title="面板1"
          />
          <MonitorChartTemp
            title="面板2"
          />
          <MonitorChartTemp
            title="面板3"
          />
          <MonitorChartTemp
            title="面板4"
          />
        </div>
      </div>
    )
  }
}