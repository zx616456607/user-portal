/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/1
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Card, Row, Col, DatePicker } from 'antd'
import './style/TeamCost.less'
import ReactEcharts from 'echarts-for-react'

const MonthPicker = DatePicker.MonthPicker


export default class TeamCost extends Component{
  constructor(props){
    super(props)
    this.transformDate = this.transformDate.bind(this)
    this.state = {
      
    }
  }
  transformDate(){
    let date = new Date
    let y = date.getFullYear()
    let m = date.getMonth()+1
    return (y+'-'+m)
  }
  render(){
    const { currentTeamName, currentSpaceName } = this.props
    
    let teamCostTitle = (
      <div className="teamCostTitle">
        <span>空间{currentSpaceName}对应的团队{currentTeamName}该月消费详情</span>
        <MonthPicker style={{float: 'right'}} defaultValue={this.transformDate()}/>
      </div>
    )
    let teamCostPie ={
      title: {
        trigger: 'item',
        formatter: "{b} : {c}<br/> ({d}%)"
      },
      color: ['#46b2fa','#2abe84'],
      lengend: {
        orient : 'vertical',
        left : '60%',
        top : '30%',
        data: [{name:'余额'}, {name:'消费'}],
        formatter: function (name) {
          if(name === '余额'){
            return name + ': ' + restValue + 'T币'
          } else {
            return name + ': ' + costValue + 'T币'
          }
        },
        textStyle: {
          fontSize: 14,
        },
        itemGap: 15,
        itemWidth: 10,
        itemHeight: 10,
      },
      series: {
        type: 'pie',
        selectedMode: 'single',
        center: ['50%','50%'],
        radius: '45%',
        data: [{name: '余额',value:70},{name: '消费',value: 30,selected: true}],
        itemStyle: {
          normal: {
            borderWidth: 0.2,
            borderColor: '#ffffff'
          },
        }
      },
    }
    let teamCostLine = {
      
    }
    return (
      <div id='TeamCost'>
        <Card title={teamCostTitle}>
          <Row>
            <Col span={6}>
             <ReactEcharts
              notMerge={true}
              option={teamCostPie}

             />
            </Col>
            <Col span={18}>
              
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}