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
import { Card, Icon, Spin, Row, Col, Tooltip } from 'antd'
import isEmpty from 'lodash/isEmpty'
import { getMonitorMetrics } from '../../../actions/manage_monitor'
import ChartComponent from './ChartComponent'
import { bytesToSize } from '../../../common/tools'

class MonitorChartTemp extends React.Component {
  constructor() {
    super()
    this.updateUnit = this.updateUnit.bind(this)
    this.state = {
      unit: '个'
    }
  }
  
  componentWillMount() {
    const { currentChart } = this.props
    this.getMetrics(this.props)
    this.setState({
      unit: currentChart.unit || '个'
    })
  }
  
  componentWillReceiveProps(nextProps) {
    const { timeRange: oldRange } = this.props
    const { timeRange: newRange } = nextProps
    if (oldRange[0] !== newRange[0] || oldRange[1] !== newRange[1]) {
      this.getMetrics(nextProps)
    }
  }
  
  getMetrics(props) {
    const { currentChart, getMonitorMetrics, clusterID, currentPanel, timeRange } = props
    const { content, metrics } = currentChart
    let parseContent = JSON.parse(content)
    let lbgroup = Object.keys(parseContent)[0]
    let services = parseContent[lbgroup]
    const query = {
      type: metrics,
      source: 'prometheus',
      start: new Date(timeRange[0]).toISOString(),
      end: new Date(timeRange[1]).toISOString()
    }
    getMonitorMetrics(currentPanel.iD, currentChart.id, clusterID, lbgroup, services, query)
  }
  
  updateUnit(bytes) {
    const { unit } = bytesToSize(bytes)
    this.setState({
      unit
    })
  }
  
  cardExtra() {
    const { openChartModal, currentPanel, currentChart } = this.props
    return [
      //<Icon key="salt" type="arrow-salt" />,
      <Icon key="setting" type="setting" onClick={() => openChartModal(currentPanel.iD, currentChart)}/>
    ]
  }
  
  renderType(chart) {
    const { type } = chart
    switch(type) {
      case 'nexport':
        return `网络出口/${chart.netExportName}`
      case 'node':
        return '节点'
      case 'service':
        return '服务'
      default:
        return '未知'
    }
  }
  
  render() {
    const { unit } = this.state
    const { currentChart, monitorMetrics  } = this.props
    return (
      <Card title={`${currentChart.name}（${unit}）`} className="chartBody" extra={this.cardExtra()}>
        {
          monitorMetrics.isFetching ?
            <div className="loadingBox">
              <Spin size="large"/>
            </div>
            :
            [
              <ChartComponent
                unit={unit}
                metrics={currentChart.metrics}
                updateUnit={this.updateUnit}
                className="monitorChart"
                sourceData={monitorMetrics}
              />,
              <Row className="cardFooter">
                <Tooltip
                  placement="topLeft"
                  title={this.renderType(currentChart)}
                  
                >
                  <Col span={12} className="textoverflow">{this.renderType(currentChart)}</Col>
                </Tooltip>
                <Tooltip
                  placement="topRight"
                  title={currentChart.metricsNickName}
                >
                  <Col span={12} className="textoverflow">{currentChart.metricsNickName}</Col>
                </Tooltip>
              </Row>
            ]
        }
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