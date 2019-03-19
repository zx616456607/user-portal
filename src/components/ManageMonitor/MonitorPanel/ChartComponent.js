/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Monitor chart component
 *
 * v0.1 - 2017-12-22
 * @author zhangxuan
 */

import React, { PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from '../../Metrics/EchartsOption'
import { formatDate, formatMetricValue } from "../../../common/tools"

const exceptByte = ['M', 'kb/s']
export default class ChartComponent extends React.Component {
  render() {
    const { sourceData, className, unit, type  } = this.props
    const { isFetching, data } = sourceData
    const option = new EchartsOption('', (data || []).length)
    option.addYAxis('value', {
      formatter: '{value}'
    })
    option.setToolTipUnit(` ${unit}`)
    option.setServiceFlag(type === 'service')
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
        if (exceptByte.includes(unit)) {
          defaultValue = formatMetricValue(defaultValue, unit)
        }
        dataArr.push([
          Date.parse(metric.timestamp),
          defaultValue
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

ChartComponent.propTypes = {
  unit: PropTypes.string.isRequired, // 单位
  metrics: PropTypes.string.isRequired, // 监控指标
  type: PropTypes.oneOf(['service', 'nexport']).isRequired, // 服务或者网络出口
  updateUnit: PropTypes.func, // 单位转换函数
  sourceData: PropTypes.object.isRequired, // 监控数据
}
