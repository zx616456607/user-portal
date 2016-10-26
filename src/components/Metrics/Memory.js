/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Memory metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'

class Memory extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('内存')
    const { memory } = this.props
    const { isFetching, data } = memory
    option.addYAxis('value', {
      formatter: '{value} M'
    })
    data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        values.push(metric.value)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, item.containerName)
    })
    return (
      <ReactEcharts option={option} showLoading={isFetching} />
    )
  }
}

Memory.propTypes = {
  memory: PropTypes.object.isRequired,
}

export default Memory