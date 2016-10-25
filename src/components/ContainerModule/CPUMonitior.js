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
  componentWillMount(){
    /*this.props.loadMetricsCPU(this.props.cluster,this.props.containerName,{
     startTime: '2016-10-21T03:36:00Z'
     }).then(function (res) {
     console.log('res',res)
     let timeData = []
     let cpuValue = []
     let cpuData = res.response.result.data['cpu/usageRate']
     console.log('cpuData',cpuData)
     cpuData.map((item) => {
     timeData.push( tenxDateFormat(item.timestamp) )
     cpuValue.push(item.value/100000)
     })
     self.setState({
     option: {
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
     /!*toolbox: {
     feature: {
     dataZoom: {
     yAxisIndex: 'none'
     },
     restore: {},
     saveAsImage: {}
     }
     },*!/
     grid: [{
     left: 50,
     right: 50,
     }],
     xAxis : [
     {
     name : '流量',
     type : 'category',
     boundaryGap : false,
     axisLine: {onZero: true},
     data: timeData,
     splitLine: {
     show: true,
     lineStyle: {
     type: 'dashed'
     }
     }
     },
     ],
     yAxis : [
     {
     type : 'value',
     max : 100,
     axisLabel: {
     formatter: '{value} %'
     },
     splitLine: {
     lineStyle: {
     type: 'dashed'
     }
     },
     },
     ],
     series : [
     {
     name:'流量',
     type:'line',
     hoverAnimation: false,
     symbol:'none',
     itemStyle : {
     normal : {
     lineStyle:{
     color:'#00a0ea'
     }
     }
     },
     data: cpuValue
     },
     ],
     }
     })
     },function (error) {
     console.log(error)
     })*/
  }
  /*componentWillReceiveProps(nextProps){
    console.log('nextProps',nextProps);
    console.log('this.props',this.props);
    if(nextProps.changeTime !== this.props.changeTime){
      loadData(this.props,{ start: this.changeTime(nextProps.changeTime) })
    }
    console.log('change!!!!',this.changeTime(nextProps.changeTime));
    console.log('changeCPUDatawillprops',this.props.cpuData);
  }*/
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
      name: '流量',
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

