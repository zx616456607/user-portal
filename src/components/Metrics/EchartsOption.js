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

import ColorHash from 'color-hash'
const colorHash = new ColorHash()

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
      align: 'left',
      left: 50,
      right: 50
    }
    this.grid = [{
      left: 70,
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
      },
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
      // symbol: 'none',
      symbolSize: '5',
      itemStyle: {
        normal: {
          color: '#00a0ea'
        }
      },
      data: []
    }
    if (data) {
      seriesItem.data = data
    }
    if (name) {
      seriesItem.name = name
      seriesItem.itemStyle.normal.color = colorHash.hex(name)
      this.legend.data.push(name)
    }
    if (itemStyle) {
      seriesItem.itemStyle = itemStyle
    }
    if (type) {
      seriesItem.type = type
    }
    this.series.push(seriesItem)
  }
  
  setGirdForDataNetWork(count) {
    //for network grid format
    let clientWidth = document.body.clientWidth;
    let num = (count - 4)/2;
    let windowResizeChange = 0;
    if(clientWidth >= 1600) {
      windowResizeChange = -50;
    }
    if(clientWidth >= 1800) {
      windowResizeChange = -100;
    }
    let initTop = 85 + num * 20 + windowResizeChange;
    this.grid = [{
      top: initTop,
      left: 70,
      right: 70,
    }]
  }
  
  setGirdForDataCommon(count) {
    //for memory and cpu grid format
    let clientWidth = document.body.clientWidth;
    let num = (count - 4)/2;
    let windowResizeChange = 0;
    if(clientWidth > 1600) {
      windowResizeChange = -50;
    }
    if(clientWidth >= 1800) {
      windowResizeChange = -60;
    }
    let initTop = 85 + num * 15 + windowResizeChange;
    this.grid = [{
      top: initTop,
      left: 70,
      right: 70,
    }]
  }
}

module.exports = EchartsOption