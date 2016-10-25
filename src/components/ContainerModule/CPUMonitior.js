/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/25
 * @author ZhaoXueYu
 */

import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from '../Metrics/EchartsOption'
import { formateDate, tenxDateFormat } from '../../common/tools'

class CPUMonitior extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const option = new EchartsOption('CPU')
    const { CPU } = this.props
    const { isFetching, data } = CPU
    console.log('CPU--------------------------------')
    console.log(CPU)
    option.addYAxis()
    data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        values.push(metric.value)
      })
      option.setXAxisData(timeData)
      option.addSeries(metric.value, item.containerName)
    })
    return (
      <ReactEcharts option={option} showLoading={isFetching} />
    )
  }
}

export default CPUMonitior

