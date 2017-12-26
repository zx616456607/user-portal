/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Monitor chart component
 *
 * v0.1 - 2017-12-22
 * @author zhangxuan
 */

import React from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from '../../Metrics/EchartsOption'
import { formatDate } from "../../../common/tools"

export default class ChartComponent extends React.Component {
  render() {
    const { sourceData, className  } = this.props
    const { isFetching, data } = sourceData
    const option = new EchartsOption('')
    option.addYAxis('value', {
      formatter: '{value}'
    })
    option.setToolTipUnit(' 个')
    let minValue = 'dataMin'
    option.setGrid([{
      top: 50,
      left: 50,
      right: 20,
      bottom: 25
    }])
    data && data.map((item) => {
      let dataArr = []
      item && item.metrics && item.metrics.length && item.metrics.map((metric) => {
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.floor(metric.floatValue || metric.value)
        ])
      })
      option.addSeries(dataArr, item.name)
      option.setXAxis('axisLabel', {
        formatter: value => formatDate(value, 'HH:mm')
      })
    })
    option.setXAxisMinAndMax(minValue)
    return (
      <ReactEcharts
        className={className}
        notMerge={true}
        option={option}
        showLoading={isFetching}
      />
    )
  }
}