/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Monitor chart template
 *
 * v0.1 - 2017-12-20
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Card, Icon } from 'antd'
import { getMonitorMetrics } from '../../../actions/manage_monitor'
import ChartComponent from './ChartComponent'

class MonitorChartTemp extends React.Component {
  
  componentDidMount() {
    const { currentChart, getMonitorMetrics, clusterID, currentPanel } = this.props
    const { content, metrics } = currentChart
    let parseContent = JSON.parse(content)
    let lbgroup = Object.keys(parseContent)[0]
    let services = parseContent[lbgroup]
    const query = {
      type: metrics,
      source: 'prometheus',
      start: '2017-12-21T06%3A13%3A11.070Z'
    }
    getMonitorMetrics(currentPanel.iD, currentChart.id, clusterID, lbgroup, services, query)
  }
  cardExtra() {
    const { openChartModal, currentPanel, currentChart } = this.props
    return [
      <Icon key="salt" type="arrow-salt" />,
      <Icon key="setting" type="setting" onClick={() => openChartModal(currentPanel.iD, currentChart)}/>
    ]
  }
  render() {
    const { currentChart, monitorMetrics  } = this.props
    return (
      <Card title={currentChart.name} className="chartBody" extra={this.cardExtra()}>
        <ChartComponent
          sourceData={monitorMetrics}
        />
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const { manageMonitor } = state
  const { currentPanel, currentChart } = props
  const monitorID =  currentPanel.iD + currentChart.id
  const { monitorMetrics } = manageMonitor
  return {
    monitorMetrics: monitorMetrics[monitorID] || { data: [], isFetching: true }
  }
}

export default connect(mapStateToProps, {
  getMonitorMetrics
})(MonitorChartTemp)