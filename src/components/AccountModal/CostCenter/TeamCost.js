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
import { connect } from 'react-redux'
import ReactEcharts from 'echarts-for-react'
import { loadTeamSummary } from '../../../actions/consumption'
import moment from 'moment'

const MonthPicker = DatePicker.MonthPicker
let teamCostArr = []
for(let i=1;i<32;i++){
  teamCostArr.push(i)
}

class TeamCost extends Component{
  constructor(props){
    super(props)
    this.transformDate = this.transformDate.bind(this)
    this.onChange = this.onChange.bind(this)
    this.state = {
      summaryDate: '',
    }
  }
  transformDate(){
    let date = new Date
    let y = date.getFullYear()
    let m = date.getMonth()+1
    return (y+'-'+m)
  }  
  componentWillMount() {
    const {
      loadTeamSummary,
      currentNamespace,
    } = this.props
    loadTeamSummary(currentNamespace)
  }

  componentWillReceiveProps(nextProps) {
    const { currentNamespace, loadTeamSummary } = nextProps
    if (currentNamespace === this.props.currentNamespace) {
      return
    }
    loadTeamSummary(currentNamespace, this.state.summaryDate)
  }

  onChange(date) {
    let time = moment(date).format('YYYY-MM-DD 00:00:00')
    if (time == 'Invalid date') {
      return
    }
    this.setState({
      summaryDate: time,
    })
    const {
      loadTeamSummary,
      currentNamespace,
    } = this.props
    loadTeamSummary(currentNamespace, time)
  }

  render(){
    const _this = this
    const {
      currentTeamName,
      currentSpaceName,
      teamSummary,
      currentNamespace,
    } = this.props
    let teamCostTitle = (
      <div className="teamCostTitle">
        <span>空间{currentSpaceName}对应的团队{currentTeamName}该月消费详情</span>
        <MonthPicker style={{float: 'right',marginLeft:'40px'}} defaultValue={this.transformDate()} onChange={this.onChange} />
      </div>
    )

    let getTeamCostPie = function (){
      let cost = 0
      let balance = 0
      if (!teamSummary.isFetching) {
        cost = teamSummary.consumption / 100
        balance = teamSummary.balance / 100
      }
      return {
        tooltip: {
          trigger: 'item',
          formatter: "{b} : {c}<br/> ({d}%)"
        },
        color: ['#46b2fa','#2abe84'],
        legend: {
          orient : 'vertical',
          left : 'center',
          bottom : '0',
          data: [{name:'余额'}, {name:'消费'}],
          formatter: function (name) {
            if(name === '余额'){
              return name + ': ' + balance + 'T币'
            } else {
              return name + ': ' + cost + 'T币'
            }
          },
          textStyle: {
            fontSize: 14,
          },
          itemGap: 10,
          itemWidth: 10,
          itemHeight: 10,
        },
        series: [{
          name:'',
          type: 'pie',
          selectedMode: 'single',
          selectedOffset: 5,
          center: ['50%','63px'],
          radius: '45%',
          data: [
            {name: '余额',value: balance},
            {name: '消费',value: cost, selected: true}
          ],
          itemStyle: {
            normal: {
              borderWidth: 0,
              borderColor: '#ffffff'
            },
            emphasis: {
            }
          }
        }]
      }
    }
    let getTeamCostBar = function (){
      let xAxisData = teamCostArr
      let yAxisData = []
      if (!teamSummary.isFetching && teamSummary.month != '') {
        let days = []
        let firstDay = `${teamSummary.month}-01`
        let lastDay = moment(firstDay).add(1, 'months').format('YYYY-MM-DD')
        for (let i = 0; i < 31; i++) {
          const day = moment(firstDay).add(i, 'days').format('YYYY-MM-DD')
          if (day < lastDay) {
            days.push(day)
          }
          else {
            break
          }
        }
        days.map(day => {
          let find = false
          for (const item of teamSummary.items) {
            if (item.time == day) {
              yAxisData.push(item.cost/100)
              find = true
              continue
            }
          }
          if (!find) {
            yAxisData.push(0.00)
          }
        })
        // modify days ['2016-12-01', '2016-12-02' ...] to [1, 2 ...]
        for (let i = 0; i < days.length; i++) {
          days[i] = parseInt(days[i].substr(8))
        }
        xAxisData = days
      }
      return {
        color: ['#3398DB'],
        tooltip : {
          trigger: 'axis',
          axisPointer : {
            type : 'shadow'
          },
          formatter: _this.transformDate()+'-{b}<br/>消费 {c}T',
          textStyle: {
            color: '#46b2fa',
            fontSize: 12,
          },
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#46b2fa',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
          height: 150
        },
        xAxis : [
          {
            type : 'category',
            data : xAxisData,
            splitLine: {
              "show": false
            },
            axisTick: {
              "show": false
            },
            splitArea: {
              "show": false
            },
            axisLabel: {
              "interval": 0,
            },
          }
        ],
        yAxis : [
          {
            type : 'value',
            max: 100,
            splitNumber: 2,
            interval: 50,
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              },
            },
          }
        ],
        series : [
          {
            name:'',
            type:'bar',
            barWidth: 16,
            data: yAxisData,
          }
        ]
      }
    }
    return (
      <div id='TeamCost'>
        <Card title={teamCostTitle}>
          <Row>
            <Col span={6}>
             <ReactEcharts
              notMerge={true}
              option={getTeamCostPie()}
              style={{height: '170px'}}
             />
            </Col>
            <Col span={18}>
              <ReactEcharts
              notMerge={true}
              option={getTeamCostBar()}
              style={{height: '170px'}}
             />
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}

function mapStateToProps (state,props) {
  const { teamSummary } = state.consumption
  let summaryData = {
    balance: 0,
    consumption: 0,
    items: [],
    month: '',
  }
  if (!teamSummary.isFetching) {
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.balance) {
      summaryData.balance = teamSummary.result.data.balance
    }
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.totalConsumption) {
      summaryData.consumption = teamSummary.result.data.totalConsumption
    }
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.detail) {
      summaryData.items = teamSummary.result.data.detail
    }
    if (teamSummary.result && teamSummary.result.data && teamSummary.result.data.month) {
      summaryData.month = teamSummary.result.data.month
    }
  }
  return {
    teamSummary: summaryData,
  }
}
export default connect (mapStateToProps,{
  loadTeamSummary,
})(TeamCost) 