/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/** Option class for echarts
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */
'use strict'

class EchartsOption {
  constructor(text) {
    this.title = {
      text,
      x: 'left',
      textStyle: {
        fontWeight: 'normal',
      }
    }
    this.tooltip = {
      trigger: 'axis',
      axisPointer: {
        animation: false
      }
    }
    this.legend = {
      data: [],
      x: 'top'
    }
    this.grid = [{
      left: 50,
      right: 50,
    }]
    this.xAxis = {
      name: '',
      type: 'category',
      boundaryGap: false,
      axisLine: { onZero: true },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      },
      data: []
    }
    this.yAxis = []
    this.series = []
  }

  setXAxis(xAxis) {
    this.xAxis = xAxis
  }

  setXAxisData(data) {
    this.xAxis.data = data
  }

  addYAxis(type, axisLabel) {
    const yAxisItem = {
      type: 'value',
      axisLabel: {
        formatter: '{value} %'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    }
    if (type) {
      yAxisItem.type = type
    }
    if (axisLabel) {
      yAxisItem.axisLabel = axisLabel
    }
    this.yAxis.push(yAxisItem)
  }

  addSeries(data, name, itemStyle, type) {
    const seriesItem = {
      name: '',
      type: 'line',
      hoverAnimation: false,
      symbol: 'none',
      itemStyle: {
        normal: {
          lineStyle: {
            color: '#00a0ea'
          }
        }
      },
      data: []
    }
    if (data) {
      seriesItem.data = data
    }
    if (name) {
      seriesItem.name = name
    }
    if (itemStyle) {
      seriesItem.itemStyle = itemStyle
    }
    if (type) {
      seriesItem.type = type
    }
    this.series.push(seriesItem)
  }
}

module.exports = EchartsOption