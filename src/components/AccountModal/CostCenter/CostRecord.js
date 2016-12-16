/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/30
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Icon, Button, DatePicker, Table, Select, Popover } from 'antd'
import './style/CostRecord.less'
import PopSelect from '../../PopSelect'
import PopContent from '../../PopSelect/Content'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import { loadConsumptionDetail, loadConsumptionTrend, loadSpaceSummaryInDay, loadSpaceSummary } from '../../../actions/consumption'
import TeamCost from './TeamCost'
import ReactEcharts from 'echarts-for-react'
import { formatDate } from '../../../common/tools'
import moment from 'moment'

const MonthPicker = DatePicker.MonthPicker
const Option = Select.Option

let spaceCostArr = []
for(let i=1;i<32;i++){
  spaceCostArr.push(i)
}

class CostRecord extends Component{
  constructor(props){
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.transformDate = this.transformDate.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleTableChange = this.handleTableChange.bind(this)

    this.state = {
      spacesVisible: false,
      currentSpaceName: '我的空间',
      currentTeamName: '',
      currentNamespace: '',
      filteredInfo: null,
      sortedInfo: null,
      consumptionDetailCurrentPage: 1, // start from 1
      consumptionDetailPageSize: 10,
      consumptionDetailTimeBegin: '',
      consumptionDetailTimeEnd: '',
      consumptionSpaceSummaryDate: '',
      consumptionSpaceSummaryInDayDate: '',
      consumptionDetailDate: '',
    }
  }
  handleSpaceChange(space) {
    this.setState({
      spacesVisible: false,
      currentSpaceName: space.spaceName,
      currentTeamName: space.teamName,
      currentNamespace: space.namespace,
      consumptionDetailCurrentPage: 1,
    })
    const {
      loadConsumptionDetail,
      loadConsumptionTrend,
      loadSpaceSummaryInDay,
      loadSpaceSummary,
    } = this.props
    const {
      consumptionDetailTimeBegin,
      consumptionDetailTimeEnd,
      consumptionSpaceSummaryDate,
      consumptionSpaceSummaryInDayDate,
    } = this.state
    loadConsumptionDetail(space.namespace, 0, this.state.consumptionDetailPageSize, consumptionDetailTimeBegin, consumptionDetailTimeEnd)
    loadConsumptionTrend(space.namespace)
    loadSpaceSummaryInDay(space.namespace, consumptionSpaceSummaryInDayDate)
    loadSpaceSummary(space.namespace, consumptionSpaceSummaryDate)
  }
  transformDate(data){
    function _addZero(text) {
      return text.toString().length === 2 ? text : `0${text}`
    }

    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()
    if (data) {
      return (y + '-' + _addZero(m) + '-' + _addZero(d))
    }
    return (y+'-'+_addZero(m))
  }
  handleTableChange(pagination, filters, sorter){
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }
  handleFilter(value,option,e){
    let filterValue = ''
    switch(value){
      case 'containter':
       filterValue = '容'
       break
      default :
       filterValue = ''
       break
    }
    this.setState({
      filteredInfo: {
        svcType: [filterValue]
      }
    })
  }
  
  componentWillMount() {
    const {
      loadTeamClustersList,
      loadLoginUserDetail,
      loadUserTeamspaceList,
      loginUser,
      userDetail,
      teamspaces,
      loadConsumptionDetail,
      loadConsumptionTrend,
      loadSpaceSummaryInDay,
      loadSpaceSummary,
    } = this.props
    loadUserTeamspaceList(loginUser.info.userID||userDetail.userID||'default',{ size: 100 }, {
      success: {
        func:()=>{
        },
        isAsync: true
      }
    })
    loadConsumptionDetail(this.state.currentNamespace, 0, this.state.consumptionDetailPageSize)
    loadConsumptionTrend(this.state.currentNamespace)
    loadSpaceSummaryInDay(this.state.currentNamespace)
    loadSpaceSummary(this.state.currentNamespace)
  }
  render(){
    const _this = this
    const {
      current,
      loginUser,
      teamspaces,
      teamClusters,
      consumptionDetail,
      loadConsumptionDetail,
      loadSpaceSummary,
      loadSpaceSummaryInDay,
      consumptionTrend,
      spaceSummaryInDay,
      spaceSummary,
      standard,
    } = this.props
    let {
      spacesVisible,
      currentSpaceName,
      currentTeamName,
      currentNamespace,
      filteredInfo,
      sortedInfo,
    } = this.state
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    let getSpaceCostSixMonths = function() {
      let xAxisData = []
      let yAxisData = []
      for (let i = 5; i >= 0; i--) {
        const month = moment().subtract(i, 'months').format('YYYY-MM')
        xAxisData.push(month)
      }
      xAxisData.map(month => {
        let find = false
        for (const item of consumptionTrend) {
          if (item.time == month) {
            yAxisData.push(item.cost/100)
            find = true
            continue
          }
        }
        if (!find) {
          yAxisData.push(0.00)
        }
      })
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          },
          formatter: '{b}<br/>消费 {c}T',
          textStyle: {
            color: '#46b2fa',
            fontSize: 12,
          },
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#46b2fa',
        },
        color: ['#6cc1fa'],
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLine: {onZero: true},
          boundaryGap: false,
          axisTick: {
            alignWithLabel: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            },
          },
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            },
          },
        },
        grid: {
          top: 20,
          bottom: 30,
        },
        series: [{
          type: 'line',
          data: yAxisData,
          symbolSize: 8,
        },]
      }
    }
    let onCurrentSpaceSummaryDateChange = function (date) {
      let time = moment(date).format('YYYY-MM-DD 00:00:00')
      if (time == 'Invalid date') {
        return
      }
      _this.setState({
        consumptionSpaceSummaryDate:time,
      })
      loadSpaceSummary(_this.state.currentNamespace, time)
    }

    let onCurrentSpaceSummaryInDayDateChange = function (date) {
      let time = moment(date).format('YYYY-MM-DD 00:00:00')
      if (time == 'Invalid date') {
        return
      }
      _this.setState({
        consumptionSpaceSummaryInDayDate:time,
      })
      loadSpaceSummaryInDay(_this.state.currentNamespace, time)
    }

    let onConsumptionDetailDateChange = function (date, dateString) {
      let timeBegin = moment(date).format('YYYY-MM-DD 00:00:00')
      let timeEnd = moment(date).add(1, 'days').format('YYYY-MM-DD 00:00:00')
      if (timeBegin == 'Invalid date' || timeEnd == 'Invalid date') {
        return
      }
      loadConsumptionDetail(_this.state.currentNamespace, 0, _this.state.consumptionDetailPageSize, timeBegin, timeEnd)
      // set state
      _this.setState({
        consumptionDetailCurrentPage: 1,
        consumptionDetailTimeBegin: timeBegin,
        consumptionDetailTimeEnd: timeEnd,
        consumptionDetailDate: timeBegin,
      })
    }
    let spaceCostTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}该月消费</span>
        <div className='dataPicker'>
          <MonthPicker defaultValue={this.transformDate(false)} onChange={onCurrentSpaceSummaryDateChange} />
        </div>
      </div>
    )
    let spaceCostDetailTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}该月消费详情</span>
        <div className='dataPicker'>
          <MonthPicker defaultValue={this.transformDate(false)} onChange={onCurrentSpaceSummaryInDayDateChange} />
        </div>
      </div>
    )
    let spaceTableTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}消费明细</span>
        <DatePicker style={{float: 'left',marginLeft: '40px'}} defaultValue={this.transformDate(true)} onChange={onConsumptionDetailDateChange} />
        <div className='dataPicker'>
          <Select defaultValue="all" style={{ width: 120, float: 'left',marginLeft: '40px'}}
                  onSelect={(value,option) => this.handleFilter(value,option)}>
            <Option value="all">全部</Option>
            <Option value="containter">容器服务</Option>
          </Select>
        </div>
      </div>
    )
    let getSpaceCostBar = function() {
      let xAxisData = spaceCostArr
      let yAxisData = []
      if (!spaceSummaryInDay.isFetching && spaceSummaryInDay.month != '') {
        let days = []
        let firstDay = `${spaceSummaryInDay.month}-01`
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
          for (const item of spaceSummaryInDay.items) {
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
    let convertDetailItems = function(itemsRaw) {
      if (!Array.isArray(itemsRaw)) {
        return []
      }
      let items = JSON.parse(JSON.stringify(itemsRaw))
      const typeMap = {
        '1': '容器服务',
        '3': '主机服务',
        '4': '存储服务',
      }
      items.map(function(item) {
        item.type = typeMap[item.type]
        item.unitPrice = (item.unitPrice / 100).toFixed(2) + 'T'
        item.amount = (item.amount / 100).toFixed(2) + 'T'
        item.startTime = formatDate(item.startTime)
      })
      return items
    }
    let costData = convertDetailItems(consumptionDetail.consumptions)
    
    let pagination = {
      current: _this.state.consumptionDetailCurrentPage,
      total: consumptionDetail.total,
      showSizeChanger: true,
      onShowSizeChange(current, pageSize) {
        loadConsumptionDetail(_this.state.currentNamespace, 0, pageSize)
        _this.setState({
          consumptionDetailPageSize: pageSize,
          consumptionDetailCurrentPage: 1,
        })
      },
      onChange(current) {
        const pageSize = _this.state.consumptionDetailPageSize
        loadConsumptionDetail(_this.state.currentNamespace, (current-1) * pageSize, pageSize, _this.state.consumptionDetailTimeBegin, _this.state.consumptionDetailTimeEnd)
        _this.setState({
          consumptionDetailCurrentPage: current,
        })
      },
    }
    //table列配置
    let getTableColumn = function(mode) {
      if (!standard) {
        return [
          {
            title: '消费ID',
            dataIndex: 'id',
            key: 'id',
            className: 'firstCol',
          },
          {
            title: '服务名称',
            dataIndex: 'consumptionName',
            key: 'consumptionName',
          },
          {
            title: '服务类型',
            dataIndex: 'type',
            key: 'type',
            filters: [
              { text: '容器服务', value: '容' },
            ],
            filteredValue: filteredInfo.svcType,
            onFilter: (value, record) => record.svcType.indexOf(value) === 0,
          },
          {
            title: '单价',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
          },
          {
            title: '消费金额',
            dataIndex: 'amount',
            key: 'amount',
          },
          {
            title: '生效时间',
            dataIndex: 'startTime',
            key: 'startTime',
          },
          {
            title: '消费时长',
            dataIndex: 'continueTime',
            key: 'continueTime',
          },
          {
            title: '集群',
            dataIndex: 'clusterName',
            key: 'clusterName',
          }
        ]
      }
      return [
        {
          title: '消费ID',
          dataIndex: 'id',
          key: 'id',
          className: 'firstCol',
        },
        {
          title: '服务名称',
          dataIndex: 'consumptionName',
          key: 'consumptionName',
        },
        {
          title: '服务类型',
          dataIndex: 'type',
          key: 'type',
          filters: [
            { text: '容器服务', value: '容' },
          ],
          filteredValue: filteredInfo.svcType,
          onFilter: (value, record) => record.svcType.indexOf(value) === 0,
        },
        {
          title: '单价',
          dataIndex: 'unitPrice',
          key: 'unitPrice',
        },
        {
          title: '消费金额',
          dataIndex: 'amount',
          key: 'amount',
        },
        {
          title: '生效时间',
          dataIndex: 'startTime',
          key: 'startTime',
        },
        {
          title: '消费时长',
          dataIndex: 'continueTime',
          key: 'continueTime',
        },
        {
          title: '地域',
          //dataIndex: 'local',
          //key: 'local',
        }
      ]
    }
    return (
      <div id='CostRecord'>
        <Card className='selectSpace'>
          {
            standard ?
            <div>
              <i className='fa fa-cube'/>
              <div className='popSelect'>
                <Popover
                  title='选择团队帐户'
                  trigger='click'
                  content={
                    <PopContent
                      list={teamspaces}
                      onChane={this.handleSpaceChange}
                      loading={false}
                    />
                  }
                >
                  <span>我的团队 <Icon type='down' style={{ fontSize: '8px' }}/></span>
                </Popover>
                
              </div>
            </div>:
            <div>
              <i className='fa fa-cube'/>
              <div className='popSelect'>
                <PopSelect
                  title="选择项目空间"
                  btnStyle={false}
                  special={true}
                  visible={spacesVisible}
                  list={teamspaces}
                  loading={false}
                  onChange={this.handleSpaceChange}
                  selectValue={ currentSpaceName }
                />
              </div>
            </div>
          }
        </Card>
        {
          (loginUser.info.role === 1 && currentTeamName)?
          <TeamCost currentSpaceName = {currentSpaceName} currentTeamName={currentTeamName} currentNamespace={currentNamespace} />:
          <div></div>
        }
        <Row gutter={16} className='currentMonth'>
          <Col span={12} className='teamCost'>
            <Card title={spaceCostTitle} bordered={false} bodyStyle={{height:170}}>
              <Col span={10}>
                  <ReactEcharts
                    notMerge={true}
                    option={getSpaceMonthCost(spaceSummary.balance, spaceSummary.consumption)}
                    style={{height:170}}
                  />
              </Col>
              <Col span={14} className='teamCostList'>
                <Row>
                  <Col span={16} style={{paddingLeft:40}} className="teamCostListTitle">
                    <svg className="headerclusterSvg">
                      <use xlinkHref="#headercluster"/>
                    </svg>
                    集群名称
                  </Col>
                  <Col span={8} className="teamCostListTitle">
                    <svg className="headerclusterSvg">
                      <use xlinkHref="#headercluster"/>
                    </svg>
                    消费金额
                  </Col>
                </Row>
                <Row className='teamCostListContent'>
                  {
                    spaceSummary.clusterConsumptions.map((item) => {
                      return (
                        <Row className="teamCostItem">
                          <Col span={16} style={{paddingLeft:40}}>{item.name}</Col>
                          <Col span={8} style={{paddingLeft:10}}>{ isNaN(item.sum) ? item.sum : item.sum/100 + 'T'}</Col>
                        </Row>
                      )
                    })
                  }
                </Row>
              </Col>
            </Card>
          </Col>
          <Col span={12}>
            <Card title='近6个月的消费走势' bodyStyle={{padding:0}}>
              <ReactEcharts
                option = {getSpaceCostSixMonths()}
                notMerge = {true}
                style = {{height: 170}}
              />
            </Card>
          </Col>
        </Row>
        <Row className='currentMonthDetail'>
          <Card title={spaceCostDetailTitle}>
            <ReactEcharts
              notMerge={true}
              option={getSpaceCostBar()}
              style={{height: '170px'}}
              showLoading={spaceSummaryInDay.isFetching}
             />
          </Card>
        </Row>
        <Row className='SpaceCostDetailTab'>
          <Card title={spaceTableTitle}>
            <Table columns={getTableColumn(standard)} dataSource={costData} pagination={pagination} onChange={this.handleTableChange}/>
          </Card>
        </Row>
      </div>
    )
  }
}


function getSpaceMonthCost(balance, cost) {
    balance = (balance || 0) / 100
    cost = (cost || 0) / 100
    return {
      color: ['#46b2fa', '#2abe84'],
      backgroundColor: '#fff',
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: "{b}: {c}<br/> ({d}%)"
      },
      legend: {
        show: true,
        orient: 'vertical',
        x: 'center',
        top: '65%',
        data:['余额','消费'],
        formatter: function (name) {
          if(name === '余额'){
            return name + ': ' + balance + 'T币'
          } else if (name === '消费') {
            return name + ': ' + cost + 'T币'
          }
        },
        textStyle: {
          fontSize: 14,
        },
        itemGap: 8,
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name:'本日该团队消费',
          type:'pie',
          radius: ['28', '40'],
          center: ['50%','40%'],
          avoidLabelOverlap: false,
          itemStyle: {
            normal: {
              borderWidth: 2,
              borderColor: '#ffffff',
            },
            emphasis: {
              borderWidth: 0,
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          hoverAnimation: false,
          selectedOffset: 10,
          label: {
            normal: {
              show: false,
              position: 'center'
            },
            emphasis: {
              show: true,
              formatter: function (param) {
                return param.percent.toFixed(0) + '%';
              },
              textStyle: {
                fontSize: '14',
                fontWeight: 'normal'
              }
            }
          },
          labelLine: {
            normal: {
              show: true
            }
          },
          data:[
            {value:balance, name:'余额'},
            {value:cost, name:'消费'},
          ]
        }
      ]
    }
}

function mapStateToProps (state,props) {
  const { current, loginUser } = state.entities
  const { teamspaces,userDetail } = state.user
  const { detail, trend, spaceSummaryInDay, spaceSummary } = state.consumption
  let spaceSummaryData = {
    isFetching: spaceSummary.isFetching,
    balance: (spaceSummary.result ? (spaceSummary.result.data.balance ? spaceSummary.result.data.balance : 0) : 0),
    consumption: (spaceSummary.result ? (spaceSummary.result.data.totalConsumption ? spaceSummary.result.data.totalConsumption : 0) : 0),
    clusterConsumptions: (spaceSummary.result ? (spaceSummary.result.data.clusterConsumption ? spaceSummary.result.data.clusterConsumption : []) : []),
  }
  if (spaceSummaryData.clusterConsumptions.length == 0) {
    spaceSummaryData.clusterConsumptions = [{
      name: '-',
      sum: '-',
    }]
  }
  return {
    current,
    loginUser,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    userDetail: (userDetail.result ? userDetail.result.data: {}),
    consumptionDetail: (detail.result ? detail.result.data : {}),
    consumptionTrend: (trend.result ? trend.result.data : []),
    spaceSummaryInDay: {
      isFetching: spaceSummaryInDay.isFetching,
      items: (spaceSummaryInDay.result ? (spaceSummaryInDay.result.data.detail ? spaceSummaryInDay.result.data.detail : []) : []),
      month: (spaceSummaryInDay.result ? (spaceSummaryInDay.result.data.month ? spaceSummaryInDay.result.data.month : '') : ''),
    },
    spaceSummary: spaceSummaryData,
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  loadLoginUserDetail,
  loadConsumptionDetail,
  loadConsumptionTrend,
  loadSpaceSummaryInDay,
  loadSpaceSummary,
})(CostRecord)