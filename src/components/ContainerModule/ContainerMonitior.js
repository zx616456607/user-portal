/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/19
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Radio, } from 'antd';
import "./style/ContainerMonitior.less"
import ReactEcharts from 'echarts-for-react';
import { formateDate, tenxDateFormat } from '../../common/tools'
import { connect } from 'react-redux'
import { DEFAULT_CLUSTER, METRICS_CPU} from '../../constants'
import { loadMetricsCPU } from '../../actions/metrics'
import cloneDeep from 'lodash/cloneDeep'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
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
function loadData(props, query) {
  const { cluster, containerName, loadMetricsCPU } = props
  loadMetricsCPU(cluster, containerName, query)
}

class ContainerMonitior extends Component {
  constructor(props){
    super(props)
    this.handleOneHour = this.handleOneHour.bind(this)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.state = {
      dateData: []
    }
  }
  componentWillMount(){
    const { cpuData } = this.props
    const self = this
    console.log('this.props',this.props);
    let cpuDataObj = {
      "cluster":"cce1c71ea85a5638b22c15d86c1f61df",
      "containerName":"atest-adssad-701507304-5t040",
      "data": {
        "metrics":[
          {"timestamp":"2016-10-21T03:36:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:37:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:38:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:39:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:40:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:41:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:42:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:43:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:44:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:45:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:46:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:47:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:48:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:49:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:50:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:51:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:52:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:53:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:54:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:55:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:56:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:57:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:58:00Z","value":5455872},
          {"timestamp":"2016-10-21T03:59:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:00:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:01:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:02:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:03:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:04:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:05:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:06:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:07:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:08:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:09:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:10:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:11:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:12:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:13:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:14:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:15:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:16:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:17:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:18:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:19:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:20:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:21:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:22:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:23:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:24:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:25:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:26:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:27:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:28:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:29:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:30:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:31:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:32:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:33:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:34:00Z","value":5455872},
          {"timestamp":"2016-10-21T04:35:00Z","value":5455872}],
        "latestTimestamp": "0001-01-01T00:00:00Z",
        "statusCode":200
      }}
    loadData(this.props, { start: this.changeTime(0) })
    console.log('cpuData.timeData------------------------')
    console.log(cpuData.timeData)
    
    this.setState({
      dateData: cpuData.timeData
    })
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
  changeTime (hours) {
    function _addZero(text) {
      return text.toString().length === 2 ? text : `0${text}`
    }
    let d =  new Date()
    d.setHours(d.getHours() -hours)
    let now = d.getFullYear()+'-'+_addZero((d.getMonth() + 1))+'-'+_addZero(d.getDate())+'T'+
      _addZero(d.getHours())+':'+_addZero(d.getMinutes())+':'+_addZero(d.getSeconds())+'Z'
    return now
  }
  handleOneHour() {
    loadData(this.props, { start: this.changeTime(0) })
    console.log(this.props);
  }
  handleTimeChange(e) {
    const { cpuData } = this.props
    const { value } = e.target
    const start = this.changeTime(value)
    loadData(this.props, { start })
    this.setState({
      dateData: cpuData.timeData
    })
  }
  render() {
    const { cpuData } = this.props
    const { dateData } = this.state
    const CPUData = cloneDeep(CPUOption)
    CPUData.xAxis = {
      name : '流量',
      type : 'category',
      boundaryGap : false,
      axisLine: {onZero: true},
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      },
      data:dateData
    }
    CPUData.yAxis = [
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
    ]
    CPUData.series = [
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
        data: cpuData.cpuValue
      },
    ]
    console.log('CPUDataCPUDataCPUDataCPUData0',CPUData);
    return (
      <div id="ContainerMonitior">
        <div className="cpu">
          <div className="cpuControl">
            <RadioGroup defaultValue="1" size="large" onChange={this.handleTimeChange}>
              <RadioButton value="1">1小时</RadioButton>
              <RadioButton value="6">6小时</RadioButton>
              <RadioButton value="24">1天</RadioButton>
              <RadioButton value="168">1周</RadioButton>
              <RadioButton value="672">1月</RadioButton>
            </RadioGroup>
          </div>
          <ReactEcharts ref='echartsInstance'
                        option={ CPUData }/>
        </div>
      </div>
    )
  }
}
ContainerMonitior.propTypes = {
  
}
function mapStateToProps(state, props) {
  const {
    CPU,
    memory
  } = state.metrics.containers
  let cpuData = {
    timeData: [],
    cpuValue: [],
  }
  if (CPU && CPU.result) {
      CPU.result.data['cpu/usageRate'].map((item) => {
      cpuData.timeData.push( tenxDateFormat(item.timestamp) )
      cpuData.cpuValue.push(item.value/100000)
    })
  }
  console.log('cpuData',cpuData)
  console.log('containers--------------------')
  console.log(CPU)
  return {
    cpuData,
    memory,
  }
}
export default connect(mapStateToProps, {
  loadMetricsCPU
})(ContainerMonitior)