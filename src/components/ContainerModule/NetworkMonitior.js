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

const networkOption = {
  title: {
    text: '网络',
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
class NetworkMonitior extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    const { networkReceived, networkTransmitted, } = this.props
    const NetworkData = cloneDeep(networkOption)
    console.log('networkReceived-=-=-=-=-=-=-',networkReceived);
    console.log('networkTransmitted-=-=-=-=-=-=-',networkTransmitted);
    let networkReceivedData = {
      timeData: [],
      value: [],
    }
    let networkTransmittedData = {
      timeData: [],
      value: [],
    }
    if (networkReceived && networkReceived.result) {
      networkReceived.result.data['network/rxRate'].map((item) => {
        networkReceivedData.timeData.push(item.timestamp)
        networkReceivedData.value.push(item.value)
      })
    }
    if (networkTransmitted && networkTransmitted.result) {
      networkTransmitted.result.data['network/txRate'].map((item) => {
        networkTransmittedData.timeData.push(item.timestamp)
        networkTransmittedData.value.push(item.value)
      })
    }
    NetworkData.xAxis = {
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
      data: networkReceivedData.timeData
    }
    
    NetworkData.yAxis = [
      {
        type: 'value',
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
    NetworkData.series = [
      {
        name: '上传',
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
        data: networkTransmittedData.value
      },
      {
        name: '下载',
        type: 'line',
        hoverAnimation: false,
        symbol: 'none',
        itemStyle: {
          normal: {
            lineStyle: {
              color: '#aaaa'
            }
          }
        },
        data: networkReceivedData.value
      },
    ]
    return (
      <ReactEcharts ref='echartsInstance'
                    option={ NetworkData }/>
    )
  }
}

export default NetworkMonitior