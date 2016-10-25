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
import { Radio, } from 'antd'
import { connect } from 'react-redux'
import "./style/ContainerMonitior.less"
import CPUMonitior from './CPUMonitior'
import MemoryMonitior from './MemoryMonitior'
import NetworkMonitior from './NetworkMonitior'
import { loadMetricsCPU, loadMetricsMemory, loadMetricsNetworkReceived, loadMetricsNetworkTransmitted, } from '../../actions/metrics'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function loadData(props, query) {
  const { cluster, containerName, loadMetricsCPU, loadMetricsMemory, loadMetricsNetworkReceived, loadMetricsNetworkTransmitted } = props
  loadMetricsCPU(cluster, containerName, query)
  loadMetricsMemory(cluster, containerName, query)
  loadMetricsNetworkReceived(cluster, containerName, query)
  loadMetricsNetworkTransmitted(cluster, containerName, query)
}

class ContainerMonitior extends Component {
  constructor(props){
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
  }
  changeTime (hours) {
    let d =  new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }
  handleTimeChange(e) {
    const {value} = e.target
    const start = this.changeTime(value)
    loadData(this.props, { start })
  }
  componentWillMount(){
    loadData(this.props, { start: this.changeTime(0) })
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
  render() {
    const { CPU, memory, networkReceived, networkTransmitted } = this.props
    console.log('propsMemory=====',memory);
    return (
      <div id="ContainerMonitior">
        <div className="cpu">
          <div className="timeControl">
            <RadioGroup defaultValue="1" size="large" onChange={this.handleTimeChange}>
              <RadioButton value="1">1小时</RadioButton>
              <RadioButton value="6">6小时</RadioButton>
              <RadioButton value="24">1天</RadioButton>
              <RadioButton value="168">1周</RadioButton>
              <RadioButton value="672">1月</RadioButton>
            </RadioGroup>
          </div>
          <CPUMonitior CPU = { CPU }/>
        </div>
        <div className="memory">
          <MemoryMonitior memory={ memory } />
        </div>
        <div className="network">
          <NetworkMonitior networkReceived={ networkReceived } networkTransmitted={ networkTransmitted }/>
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
    memory,
    networkReceived,
    networkTransmitted,
  } = state.metrics.containers
  console.log('CPU--------------------')
  console.log(CPU)
  console.log('memory--------------------')
  console.log(memory)
  return {
    CPU,
    memory,
    networkReceived,
    networkTransmitted,
  }
}
export default connect(mapStateToProps, {
  loadMetricsCPU,
  loadMetricsMemory,
  loadMetricsNetworkReceived,
  loadMetricsNetworkTransmitted,
})(ContainerMonitior)