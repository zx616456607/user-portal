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
import { formatDate } from "../../common/tools";

class EchartsOption {
  constructor(text) {
    this.title = {
      text,
      left: 20,
      textStyle: {
        fontWeight: 'normal',
      }
    }
    this.toolbox = {
      show: false
    }
    this.tooltip = {
      trigger: 'axis',
      formatter: (params) => {
        let res = `${formatDate(params[0]['data'][0], 'MM-DD HH:mm:ss')}<br/>`
        params.forEach(item => {
          let name = item.seriesName
          name = name.split('-')
          name.splice(1, 1)
          name = name.join('-')
          res += `${name} : ${item.data[1]}<br/>`
        })
        return res
      },
      axisPointer: {
        animation: false
      }
    }
    this.legend = {
      data: [],
      right: 50,
      left: 80,
      orient: 'horizontal',
      formatter: (name)=> {
        let item = name.substring(0,name.indexOf('-'))
        return item + name.substr(name.lastIndexOf('-'))
      }
    }
    this.grid = [{
      top: 70,
      left: 100,
      right: 50
    }]
    this.xAxis = {
      name: '',
      type: 'value',
      max: 'dataMax',
      boundaryGap: false,
      axisLine: { onZero: true },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: value => formatDate(value, 'MM-DD HH:mm:ss')
      },
      data: []
    }
    this.yAxis = []
    this.series = []
  }

  setXAxis(xAxis) {
    this.xAxis = xAxis
  }
  
  setXAxisMin(min) {
    this.xAxis.min = min
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
      showSymbol: false,
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
      seriesItem.itemStyle.normal.color = colorHash.hex(name.substr(name.lastIndexOf('-') + 1))
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

  setGirdForDataNetWork(count,events) {
    //for network grid format
    let clientWidth = document.getElementById(events) ? document.getElementById(events).clientWidth : document.body.clientWidth
    if(count < 4) {
      return;
    }
    let num = (count - 4)/2;
    let windowResizeChange = 0;
    if(clientWidth > 800) {
      windowResizeChange = -10;
    }
    if(clientWidth > 1300) {
      windowResizeChange = -30
    }
    if(clientWidth > 1600) {
      windowResizeChange = -50;
    }
    let initTop = Math.max(num * 25 + windowResizeChange ,60);
    this.grid = [{
      top: initTop,
      left: 100,
      right: 50
    }]

  }

  setGirdForDataCommon(count,events) {
    //for memory and cpu grid format
    let clientWidth = document.body.clientWidth;
    if(count < 4) {
      return;
    }
    let num = (count - 4)/2;
    let windowResizeChange = 0;
    if(clientWidth > 1600) {
      windowResizeChange = -50;
    }
    if(clientWidth >= 1800) {
      windowResizeChange = -60;
    }
    let initTop = Math.max(60 + num * 15 + windowResizeChange,60);
    this.grid = [{
      top: initTop,
      left: 100,
      right: 50,
    }]
  }
}

module.exports = EchartsOption