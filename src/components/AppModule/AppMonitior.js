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
import { Button, } from 'antd';
import "./style/AppMonitior.less"
import ReactEcharts from 'echarts-for-react';
import { formateDate, tenxDateFormat } from '../../common/tools'
const ButtonGroup = Button.Group;

export default class AppMonitior extends Component {
  constructor(props){
    super(props)
    this.handleOneHour = this.handleOneHour.bind(this)
    this.handleSixHours = this.handleSixHours.bind(this)
    this.handleOneDay = this.handleOneDay.bind(this)
    this.handleOneWeek = this.handleOneWeek.bind(this)
    this.handleOneMonth = this.handleOneMonth.bind(this)
    this.state = {
      option: {},
    }
  }
  componentWillMount(){
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
    let timeData = []
    let cpuValue = []
    let cpuData = cpuDataObj.data.metrics
    cpuData.map((item) => {
      timeData.push( tenxDateFormat(item.timestamp) )
      cpuValue.push(item.value/100000)
    })
    this.setState({
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
        /*toolbox: {
         feature: {
         dataZoom: {
         yAxisIndex: 'none'
         },
         restore: {},
         saveAsImage: {}
         }
         },*/
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
  }
  changeTime(hours,day,week,month){
    let d =  new Date()
    const nDate = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds()
    }
    let now = d.getFullYear()+'-'+_addZero(nDate.month)+'-'+_addZero(nDate.day)+'T'+
      _addZero(nDate.hour-hours)+':'+_addZero(nDate.minute)+':'+_addZero(nDate.second)+'Z'
    console.log('now',now);
  }
  handleOneHour(){
    function _addZero(text) {
      return text.toString().length === 2 ? text : `0${text}`
    }
    this.setState({
      option: {
        xAxis: [{
          data: ['2016-11-11 11:11:11'],
        }]
      }
    })
  }
  handleSixHours(){
    
  }
  handleOneDay(){
    
  }
  handleOneWeek(){
    
  }
  handleOneMonth(){
    
  }
  render() {
    return (
      <div id="AppMonitior">
        <div className="cpu">
          <div className="cpuControl">
            <ButtonGroup>
              <Button type="ghost" size="large" onClick={this.handleOneHour}>1小时</Button>
              <Button type="ghost" size="large" onClick={this.handleSixHours}>6小时</Button>
              <Button type="ghost" size="large" onClick={this.handleOneDay}>1天</Button>
              <Button type="ghost" size="large" onClick={this.handleOneWeek}>1周</Button>
              <Button type="ghost" size="large" onClick={this.handleOneMonth}>1月</Button>
            </ButtonGroup>
          </div>
          <ReactEcharts ref='echartsInstance'
                        option={ this.state.option }/>
        </div>
      </div>
    )
  }
}
AppMonitior.propTypes = {
  
}