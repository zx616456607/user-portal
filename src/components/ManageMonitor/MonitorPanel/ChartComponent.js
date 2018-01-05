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
import { decamelize } from 'humps'
import EchartsOption from '../../Metrics/EchartsOption'
import { formatDate, bytesToSize } from "../../../common/tools"

export default class ChartComponent extends React.Component {
  
  componentWillMount() {
    const { updateUnit, sourceData, metrics } = this.props
    const { data } = sourceData
    let reg = /byte/
    if (reg.test(metrics)) {
      let maxValue = 0
      data && data.forEach(item => {
        item && item.metrics && item.metrics.length && item.metrics.forEach(metric => {
          if (metric.floatValue > maxValue) {
            maxValue = metric.floatValue
          }
        })
      })
      updateUnit && updateUnit(maxValue)
    }
  }
  render() {
    const { sourceData, className, unit  } = this.props
    const { isFetching, data } = sourceData
    const option = new EchartsOption('')
    option.addYAxis('value', {
      formatter: '{value}'
    })
    option.setToolTipUnit(` ${unit}`)
    option.setTooltip('position', function (pos, params, dom, rect, size) {
      // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
      let obj = {top: 60};
      let leftPart = pos[0] < size.viewSize[0] / 2
      obj[['left', 'right'][+leftPart]] = leftPart ? (size.viewSize[0] - (1.5 * pos[0]) - 120) : (pos[0] / 2)
      return obj;
    })
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
        let defaultValue = metric.floatValue || metric.value
        if (unit === 'byte') {
          const { value } = bytesToSize(defaultValue, unit)
          defaultValue = value
        }
        dataArr.push([
          Date.parse(metric.timestamp),
          defaultValue
        ])
      })
      option.addSeries(dataArr, decamelize(item.name, { separator: '-' }))
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