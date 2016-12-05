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
import TeamCost from './TeamCost'
import ReactEcharts from 'echarts-for-react'

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
    this.state = {
      spacesVisible: false,
      currentSpaceName: '我的空间',
      currentTeamName: '',
    }
  }
  handleSpaceChange(space) {
    this.setState({
      spacesVisible: false,
      currentSpaceName: space.spaceName,
      currentTeamName: space.teamName,
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
    } = this.props
    loadUserTeamspaceList(loginUser.info.userID||userDetail.userID,{ size: 100 }, {
      success: {
        func:()=>{
          console.log('teamspaces',teamspaces)
        },
        isAsync: true
      }
    })
  }
  transformDate(){
    let date = new Date
    let y = date.getFullYear()
    let m = date.getMonth()+1
    return (y+'-'+m)
  }
  render(){
    const {
      current,
      loginUser,
      teamspaces,
      teamClusters,
    } = this.props
    let {
      spacesVisible,
      currentSpaceName,
      currentTeamName,
    } = this.state
    let spaceMonthCost = {
      title: {
        show: false,
        text: '余额 :  '+70+'T币\n\n消费 :  '+30+'T币',
        x:'center',
        top: '65%',
        textStyle:{
          color :'#6c6c6c',
          fontStyle: 'normal',
          fontWeight: 'normal',
          fontSize: '14',
        }
      },
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
      },
      color: ['#6cc1fa'],
      xAxis: {
        type: 'category',
        data: ['2016-01','2016-01','2016-01','2016-01','2016-01','2016-01',],
        axisLine: {onZero: true},
        boundaryGap: false,
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
        <span>{currentSpaceName}该月消费详情</span>
        <MonthPicker style={{marginLeft: 40}} defaultValue={this.transformDate()}/>
        <div style={{flex: 'auto'}}>
          <Select defaultValue="all" style={{ width: 120, float: 'right'}}>
            <Option value="all">全部</Option>
            <Option value="containter">容器服务</Option>
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
        formatter: '{b} : {c}%',
        position: function (point, params, dom) {
          return [point[0]-25, '10%'];
        },
        extraCssText: '::after: {content:""}'
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
    let costData = [

    ]
    let TableSpaceCostDetail  = [
      {
        title: '消费ID',
        dataIndex: 'id',
        key: 'id',
        className: 'firstCol',
      },
      {
        title: '服务名称',
        dataIndex: 'svcName',
        key: 'svcName',
      },
      {
        title: '服务类型',
        dataIndex: 'svcType',
        key: 'svcType',
      },
      {
        title: '单价',
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: '消费金额',
        dataIndex: 'cost',
        key: 'cost',
      },
      {
        title: '生效时间',
        dataIndex: 'time',
        key: 'time',
      },
      {
        title: '消费时长',
        dataIndex: 'long',
        key: 'long',
      },
      {
        title: '集群',
        dataIndex: 'cluster',
        key: 'cluster',
      },
      {
        title: '备注',
        dataIndex: 'ps',
        key: 'ps',
      },
    ]
    let pagination = {
      total: costData.length,
      showSizeChanger: true,
      onShowSizeChange(current, pageSize) {
        console.log('Current: ', current, '; PageSize: ', pageSize);
      },
      onChange(current) {
        console.log('Current: ', current);
      },
    }
    console.log('---------------------------')
    console.log('current: ',current)
    console.log('loginUser: ',loginUser)
    console.log('teamspaces: ',teamspaces)
    console.log('teamClusters: ',teamClusters)
    console.log('currentSpaceName: ',currentSpaceName)
    console.log('currentTeamName: ',currentTeamName)
    console.log('---------------------------')
    return (
      <div id='CostRecord'>
        <Card style={{marginBottom: '20px'}}>
          <i className='fa fa-cube' style={{marginRight:'10px'}}/>
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
                  <Col span={16} style={{paddingLeft:40,height:40,lineHeight:'40px'}}>空间名称</Col>
                  <Col span={8} style={{height:40,lineHeight:'40px'}}>消费金额</Col>
                </Row>
                <Row className='teamCostListContent'>
                  {
                    [1,2,3,4,5,6].map(() => {
                      return (
                        <Row className="teamCostItem">
                          <Col span={16} style={{paddingLeft:40}}>item.teamname</Col>
                          <Col span={8} style={{paddingLeft:10}}>消费 111T</Col>
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
            <Table columns={TableSpaceCostDetail} dataSource={costData} pagination={pagination}/>
          </Card>
        </Row>
      </div>
    )
  }
}
function mapStateToProps (state,props) {
  const { current, loginUser } = state.entities
  const { teamspaces,userDetail } = state.user
  console.log('current',current)

  return {
    current,
    loginUser,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    userDetail: (userDetail.result ? userDetail.result.data: {})
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  loadLoginUserDetail,
})(CostRecord) 