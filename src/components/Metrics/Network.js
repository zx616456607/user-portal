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

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the network counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

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
    option.setGirdForDataNetWork(networkTransmitted.data.length + networkReceived.data.length)
    return (
      <ReactEcharts
        style={{ height: formatGrid(networkTransmitted.data.length + networkReceived.data.length) }}
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