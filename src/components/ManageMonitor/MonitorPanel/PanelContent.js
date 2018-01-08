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
import { formatDate } from "../../../common/tools";

class PanelContent extends React.Component {
  constructor() {
    super()
    this.getTimeRange = this.getTimeRange.bind(this)
    this.state = {
      timeRange: [formatDate(new Date(Date.parse(new Date()) - (60 * 60 * 1000))), formatDate(new Date())]
    }
  }
  
  getTimeRange(timeRange) {
    this.setState({
      timeRange
    })
  }
  
  render() {
    const { timeRange } = this.state
    const { openModal, openChartModal, currentPanel, charts, isFetching, clusterID, getChartList, activeKey } = this.props
    const btnGroupFunc = {
      currentPanel,
      openModal, 
      openChartModal,
      onChange: this.getTimeRange,
      clusterID,
      getChartList,
      activeKey
    }
    const tempFunc = {
      openChartModal,
      currentPanel,
      clusterID,
      timeRange
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
          value={[timeRange[0], timeRange[1]]}
        />
        <div className="chartTempWrapper">
          {
            charts && charts.length ? 
              charts.map(item => <MonitorChartTemp {...Object.assign(tempFunc, {currentChart: item, key: item.id})}/>) 
              :
              [
                <div className="monitorNoData" key="monitorNoData"/>,
                <div className="noDataText" key="noDataText">您还没有监控图表，添加一个吧！
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