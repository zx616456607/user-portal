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

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the memory counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

export default class ChartComponent extends React.Component {
  render() {
    const { sourceData  } = this.props
    const { isFetching, data } = sourceData
    const option = new EchartsOption('')
    option.addYAxis('value', {
      formatter: '{value} 个'
    })
    option.setToolTipUnit(' 个')
    data && data.map((item) => {
      let timeData = []
      let values = []
      let dataArr = []
      item && item.metrics && item.metrics.length && item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.floor((metric.floatValue || metric.value)))
        dataArr.push([
          Date.parse(metric.timestamp),
          Math.floor((metric.floatValue || metric.value))
        ])
      })
      option.addSeries(dataArr, item.name)
      option.setXAxis('axisLabel', {
        formatter: value => formatDate(value, 'HH:mm')
      })
    })
    option.setGirdForDataCommon(data&&data.length)
    return (
      <ReactEcharts
        style={{ height: formatGrid(data&&data.length) }}
        notMerge={true}
        option={option}
        showLoading={isFetching}
      />
    )
  }
}