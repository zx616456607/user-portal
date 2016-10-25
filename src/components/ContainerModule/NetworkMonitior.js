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

const networkOption = {
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
class NetworkMonitior extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  
  render(){
    const {networkReceived, networkTransmitted,} = this.props
    const NetworkData = cloneDeep(networkOption)
    return (
      <ReactEcharts ref='echartsInstance'
                    option={ NetworkData }/>
    )
  }
}