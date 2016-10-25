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
import {  } from '../../actions/metrics'
import cloneDeep from 'lodash/cloneDeep'
import { formateDate, tenxDateFormat } from '../../common/tools'

const memoryOption = {
  title: {
    text: '内存',
    // subtext: '处理器使用情况',
    x: 'left',
    textStyle: {
      fontWeight: 'normal',
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      animation: false
    }
  },
  legend: {
    data:[],
    x: 'top'
  },
  grid: [{
    left: 50,
    right: 50,
  }],
}
class MemoryMonitior extends Component {
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render() {
    const { memory, } = this.props
    let memoryData = {
      timeData: [],
      memoryValue: [],
    }
    console.log('memory===========',memory);
    if (memory && memory.result) {
      memory.result.data['memory/usage'].map((item) => {
        // memoryData.timeData.push( tenxDateFormat(item.timestamp) )
        memoryData.timeData.push(item.timestamp)
        memoryData.memoryValue.push(item.value*100)
      })
    }
    console.log('memoryData', memoryData);
    const MemoryData = cloneDeep(memoryOption)
    MemoryData.xAxis = {
      name: '内存',
      type: 'category',
      boundaryGap: false,
      axisLine: {onZero: true},
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      },
      data: memoryData.timeData
    }
    MemoryData.yAxis = [
      {
        type: 'value',
        // max: 1000,
        axisLabel: {
          formatter: '{value} %'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
      },
      
    ]
    MemoryData.series = [
      {
        name: '内存',
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
        data: memoryData.memoryValue
      },
      
    ]
    console.log('changeCPUData',MemoryData);
    return (
      <ReactEcharts ref='echartsInstance'
                    option={ MemoryData }/>
    )
  }
}

export default MemoryMonitior