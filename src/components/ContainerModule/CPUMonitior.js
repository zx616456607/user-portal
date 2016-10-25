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
import cloneDeep from 'lodash/cloneDeep'
import { formateDate, tenxDateFormat } from '../../common/tools'

const CPUOption = {
  title: {
    text: '处理器',
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

class CPUMonitior extends Component {
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render() {
    const { CPU } = this.props
    let cpuData = {
      timeData: [],
      cpuValue: [],
    }
    if (CPU && CPU.result) {
      CPU.result.data['cpu/usageRate'].map((item) => {
        // cpuData.timeData.push( tenxDateFormat(item.timestamp) )
        cpuData.timeData.push(new Date(item.timestamp))
        cpuData.cpuValue.push(item.value*10000000000)
      })
    }
    console.log('cpuData', cpuData);
    const CPUData = cloneDeep(CPUOption)
    CPUData.xAxis = {
      name: '',
      type: 'category',
      boundaryGap: false,
      axisLine: {onZero: true},
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      },
      data: cpuData.timeData
    }
    CPUData.yAxis = [
      {
        type: 'value',
        // max: 100,
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
    CPUData.series = [
      {
        name: '流量',
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
        data: cpuData.cpuValue
      },
    ]
    console.log('changeCPUData',CPUData);
    return (
      <ReactEcharts ref='echartsInstance'
                    option={ CPUData }/>
    )
  }
}

export default CPUMonitior

