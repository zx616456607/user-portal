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
      formatter: '{value} KB'
    })
    networkReceived.data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        values.push((metric.value/1000000).toFixed(2))
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 上传`)
    })
    networkTransmitted.data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        values.push((metric.value/1000000).toFixed(2))
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 下载`)
    })
    return (
      <ReactEcharts
        notMerge={true}
        option={option}
        showLoading={networkReceived.isFetching || networkTransmitted.isFetching}
        />
    )
  }
}

Network.propTypes = {
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

Network.defaultProps = {
  networkReceived: {
    isFetching: false,
    data: []
  },
  networkTransmitted: {
    isFetching: false,
    data: []
  }
}

export default Network