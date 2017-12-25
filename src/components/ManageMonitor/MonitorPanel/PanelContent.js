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
import { connect } from 'react-redux'
import { Button, Spin } from 'antd'
import PanelBtnGroup from './PanelBtnGroup'
import MonitorChartTemp from './MonitorChartTemp'
import './style/PanelContent.less'
import { getChartList } from '../../../actions/manage_monitor'

class PanelContent extends React.Component {
  constructor() {
    super()
    this.startTime = new Date(new Date(new Date()
      .setDate(new Date().getDate() - 1))
      .setHours(0, 0, 0, 0))
  }
  
  render() {
    const { openModal, openChartModal, currentPanel, charts, isFetching, clusterID } = this.props
    const btnGroupFunc = {
      currentPanel,
      openModal, 
      openChartModal
    }
    const tempFunc = {
      openChartModal,
      currentPanel,
      clusterID
    }
    if (isFetching) {
      return <div className="loadingBox">
        <Spin size="large"/>
      </div>
    }
    return (
      <div>
        <PanelBtnGroup
          {...btnGroupFunc}
          value={[this.startTime, new Date()]}
          onOk={() => console.log('ok')}
        />
        <div className="chartTempWrapper">
          {
            charts && charts.length ? 
              charts.map(item => <MonitorChartTemp key={item.id} currentChart={item} {...tempFunc}/>) 
              :
              [
                <div className="monitorNoData"/>,
                <div className="noDataText">您还没有图表，添加一个吧！
                  <Button type="primary" size="large" onClick={() => openChartModal(currentPanel.iD, null)}>添加</Button>
                </div>
              ]
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { activeKey } = props
  const { manageMonitor } = state
  const { panelCharts } = manageMonitor
  const { charts, isFetching } = activeKey && panelCharts[activeKey] || { charts: {}, isFetching: true }
  return {
    charts,
    isFetching
  }
}

export default connect(mapStateToProps, {
  getChartList
})(PanelContent)