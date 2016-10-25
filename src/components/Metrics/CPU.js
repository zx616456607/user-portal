/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * CPU metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'

class CPU extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('CPU')
    const { cpu } = this.props
    const { isFetching, data } = cpu
    option.addYAxis()
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

CPU.propTypes = {
  cpu: PropTypes.object.isRequired,
}

export default CPU