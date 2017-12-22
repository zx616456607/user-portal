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
import { Card, Button, Icon } from 'antd'
import EchartsOption from '../../Metrics/EchartsOption'
import { getMonitorMetrics } from '../../../actions/manage_monitor'

class MonitorChartTemp extends React.Component {
  
  componentDidMount() {
    const { currentChart, getMonitorMetrics, clusterID } = this.props
    const { content, metrics } = currentChart
    let parseContent = JSON.parse(content)
    let lbgroup = Object.keys(parseContent)[0]
    let services = parseContent[lbgroup]
    const query = {
      type: metrics,
      source: 'prometheus',
      start: '2017-12-21T06%3A13%3A11.070Z'
    }
    getMonitorMetrics(clusterID, lbgroup, services, query)
  }
  cardExtra() {
    const { openChartModal, currentPanel, currentChart } = this.props
    return [
      <Icon key="salt" type="arrow-salt" />,
      <Icon key="setting" type="setting" onClick={() => openChartModal(currentPanel.iD, currentChart)}/>
    ]
  }
  render() {
    const { currentChart, clusterID } = this.props
    return (
      <Card title={currentChart.name} className="chartBody" extra={this.cardExtra()}>
        
      </Card>
    )
  }
}

function mapStateToProps(state) {
  return {
    
  }
}

export default connect(mapStateToProps, {
  getMonitorMetrics
})(MonitorChartTemp)