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
import { Row, Col, Card, Icon, Button, DatePicker, Table, Select } from 'antd'
import './style/CostRecord.less'
import PopSelect from '../../PopSelect'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import { loadConsumptionDetail } from '../../../actions/consumption'
import TeamCost from './TeamCost'
import ReactEcharts from 'echarts-for-react'
import { formatDate } from '../../../common/tools'

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
      filteredInfo: null,
      sortedInfo: null,
      consumptionDetailCurrentPage: 1, // start from 1
      consumptionDetailPageSize: 10,
    }
  }
  handleSpaceChange(space) {
    this.setState({
      spacesVisible: false,
      currentSpaceName: space.spaceName,
      currentTeamName: space.teamName,
    })
  }
  transformDate(){
    function _addZero(text) {
      return text.toString().length === 2 ? text : `0${text}`
    }
    let date = new Date
    let y = date.getFullYear()
    let m = date.getMonth()+1
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
      case 'test':
       filterValue = 'test'
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
    } = this.props
    loadUserTeamspaceList(loginUser.info.userID||userDetail.userID,{ size: 100 }, {
      success: {
        func:()=>{
        },
        isAsync: true
      }
    })
    loadConsumptionDetail(0, this.state.consumptionDetailPageSize)
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
    } = this.props
    let {
      spacesVisible,
      currentSpaceName,
      currentTeamName,
      filteredInfo,
      sortedInfo,
    } = this.state
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    let spaceMonthCost = {
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
            return name + ': ' + 70 + 'T币'
          } else if (name === '消费') {
            return name + ': ' + 30 + 'T币'
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
            {value:70, name:'余额'},
            {value:30, name:'消费'},
          ]
        }
      ]
    }
    let spaceCostSixMonths = {
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
        data: ['2016-01','2016-01','2016-01','2016-01','2016-01','2016-01',],
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
        data: [10,20,30,40,50,60],
        symbolSize: 8,
        
      },]
    }
    let spaceCostTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}该月消费</span>
        <div style={{flex: 'auto'}}>
          <MonthPicker style={{float: 'right'}} defaultValue={this.transformDate()}/>
        </div>
      </div>
    )
    let spaceCostDetailTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}该月消费详情</span>
        <div style={{flex: 'auto'}}>
          <MonthPicker style={{float: 'right'}} defaultValue={this.transformDate()}/>
        </div>
      </div>
    )
    let spaceTableTitle = (
      <div className="teamCostTitle">
        <span>{currentSpaceName}消费明细</span>
        <MonthPicker style={{marginLeft: 40}} defaultValue={this.transformDate()}/>
        <div style={{flex: 'auto'}}>
          <Select defaultValue="all" style={{ width: 120, float: 'right'}}
                  onSelect={(value,option) => this.handleFilter(value,option)}>
            <Option value="all">全部</Option>
            <Option value="containter">容器服务</Option>
            <Option value="test">test</Option>
          </Select>
        </div>
      </div>
    )
    let spaceCostBar = {
      color: ['#3398DB'],
      tooltip : {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        formatter: this.transformDate()+'-{b}<br/>消费 {c}T',
        /*position: function (point, params, dom) {
         return [point[0]-25, '10%'];
         },*/
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
          data : spaceCostArr,
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
          data: spaceCostArr,
        }
      ]
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
    let TableSpaceCostDetail  = [
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
      },
      {
        title: '备注',
        dataIndex: 'ps',
        key: 'ps',
      },
    ]
    let pagination = {
      current: _this.state.consumptionDetailCurrentPage,
      total: consumptionDetail.total,
      showSizeChanger: true,
      onShowSizeChange(current, pageSize) {
        loadConsumptionDetail(0, pageSize)
        _this.setState({
          consumptionDetailPageSize: pageSize,
          consumptionDetailCurrentPage: 1,
        })
      },
      onChange(current) {
        const pageSize = _this.state.consumptionDetailPageSize
        loadConsumptionDetail((current-1) * pageSize, pageSize)
        _this.setState({
          consumptionDetailCurrentPage: current,
        })
      },
    }
    return (
      <div id='CostRecord'>
        <Card style={{marginBottom: '20px'}}>
          <i className='fa fa-cube' style={{marginRight:'10px',fontSize: '14px'}}/>
          <div style={{display:'inline-block'}}>
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
        </Card>
        {
          (loginUser.info.role === 1 && currentTeamName)?
          <TeamCost currentSpaceName = {currentSpaceName} currentTeamName={currentTeamName}/>:
          <div></div>
        }
        <Row gutter={16} style={{marginBottom: '20px'}}>
          <Col span={12} className='teamCost'>
            <Card title={spaceCostTitle} bordered={false} bodyStyle={{height:170}}>
              <Col span={10} style={{height:170}}>
                  <ReactEcharts
                    notMerge={true}
                    option={spaceMonthCost}
                    style={{height:170}}
                  />
              </Col>
              <Col span={14} className='teamCostList'>
                <Row className="teamCostListTitle">
                  <Col span={16} style={{paddingLeft:40,height:40,lineHeight:'40px'}}>
                    <svg className="headercluster">
                      <use xlinkHref="#headercluster"/>
                    </svg>
                    集群名称
                  </Col>
                  <Col span={8} style={{height:40,lineHeight:'40px'}}>
                    <svg className="headercluster">
                      <use xlinkHref="#headercluster"/>
                    </svg>
                    消费金额
                  </Col>
                </Row>
                <Row className='teamCostListContent'>
                  {
                    [1,2,3,4,5,6].map(() => {
                      return (
                        <Row className="teamCostItem">
                          <Col span={16} style={{paddingLeft:40}}>item.teamname</Col>
                          <Col span={8} style={{paddingLeft:10}}>111T</Col>
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
                option = {spaceCostSixMonths}
                notMerge = {true}
                style = {{height: 170}}
              />
            </Card>
          </Col>
        </Row>
        <Row style={{marginBottom: '20px'}}>
          <Card title={spaceCostDetailTitle}>
            <ReactEcharts
              notMerge={true}
              option={spaceCostBar}
              style={{height: '170px'}}
             />
          </Card>
        </Row>
        <Row style={{marginBottom: '100px'}} className='SpaceCostDetailTab'>
          <Card title={spaceTableTitle}>
            <Table columns={TableSpaceCostDetail} dataSource={costData} pagination={pagination} onChange={this.handleTableChange}/>
          </Card>
        </Row>
      </div>
    )
  }
}
function mapStateToProps (state,props) {
  const { current, loginUser } = state.entities
  const { teamspaces,userDetail } = state.user
  const { detail } = state.consumption
  
  return {
    current,
    loginUser,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    userDetail: (userDetail.result ? userDetail.result.data: {}),
    consumptionDetail: (detail.result ? detail.result.data : {}), 
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  loadLoginUserDetail,
  loadConsumptionDetail,
})(CostRecord) 