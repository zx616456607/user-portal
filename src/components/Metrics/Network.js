/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Network metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'

class Network extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('网络')
    const { networkReceived, networkTransmitted } = this.props
    option.addYAxis('value', {
      formatter: '{value} B'
    })
    const networkReceivedStyle = {
      normal: {
        lineStyle: {
          color: '#00a0ea'
        }
      }
    }
    const networkTransmittedStyle = {
      normal: {
        lineStyle: {
          color: '#aaaa'
        }
      }
    }
    networkReceived.data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        values.push(metric.value)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 上传`, networkReceivedStyle)
    })
    networkTransmitted.data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        values.push(metric.value)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 下载`, networkTransmittedStyle)
    })
    return (
      <ReactEcharts option={option} showLoading={networkReceived.isFetching || networkTransmitted.isFetching} />
    )
  }
}

Network.propTypes = {
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

export default Network