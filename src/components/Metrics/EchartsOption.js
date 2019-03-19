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

import randomcolor from 'randomcolor'
import { formatDate, serviceNameCutForMetric } from "../../common/tools";

export default class EchartsOption {
  // 标题, 颜色数量(即线的条数), 颜色种子
  constructor(text, count = 20, seed = 'seed') {
    this.title = {
      text,
      left: 20,
      textStyle: {
        fontWeight: 'normal',
      }
    }
    this.indexCount = 0
    this.count = count
    this.colorList = randomcolor({
      seed,
      count,
    })
    this.toolbox = {
      show: false
    }
    this.tooltipUnit = ''
    this.isNexport = false
    this.tooltip = {
      trigger: 'axis',
      formatter: (params) => {
        let res = `${formatDate(params[0]['data'][0], 'MM-DD HH:mm:ss')}<br/>`
        params.forEach(item => {
          let name = item.seriesName
          res += `${name} : ${item.data[1]}${this.tooltipUnit}<br/>`
        })
        return res
      },
      axisPointer: {
        animation: false
      }
    }
    this.legend = {
      type: 'scroll',
      data: [],
      left: '10%',
      right: '5%',
      top: 'top',
      orient: 'horizontal'
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

  setXAxis(key, option) {
    this.xAxis[key] = option
  }

  setGrid(grid) {
    this.grid = grid
  }
  setXAxisMinAndMax(min, max) {
    min && (this.xAxis.min = min)
    max && (this.xAxis.max = max)
  }

  setToolTipUnit(unit) {
    this.tooltipUnit = unit
  }

  setServiceFlag(flag) {
    this.isService = flag
  }

  setTooltip(key, value) {
    this.tooltip[key] = value
  }

  setXAxisData(data) {
    this.xAxis.data = data
  }

  addYAxis(type, axisLabel, min, max) {
    const yAxisItem = {
      type: 'value',
      position: 'left',
      axisLabel: {
        formatter: '{value} %'
      },
      min,
      max,
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
    if (min) {
      yAxisItem.min = min
    }
    if (max) {
      yAxisItem.max = max
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
      if (this.isService) {
        // 统计类型为服务时，监控面板的图例显示容易重叠，先去掉名称中的数字串
        name = serviceNameCutForMetric(name)
      }
      seriesItem.name = name
      seriesItem.itemStyle.normal.color = this.colorList[this.indexCount++]
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
