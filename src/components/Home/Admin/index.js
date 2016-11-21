/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/16
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, } from 'antd'
import './style/Admin.less'
import ReactEcharts from 'echarts-for-react'
import { connect } from 'react-redux'
import { loadTeamDetail, loadTeamOperations } from '../../../actions/overview_team'



let cost = 100
let rest = 900
let option = {
  title: {
    text: '余额 :  '+rest+'T币\n\n消费 :  '+cost+'T币',
    x:'center',
    top: '40%',
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
    trigger: 'item',
    formatter: "{b}: {c}<br/> ({d}%)"
  },
  legend: {
    orient: 'vertical',
    x: '50%',
    top: 10,
    data:['余额','消费'],
    show: false
  },
  series: [
    {
      name:'本日该团队消费',
      type:'pie',
      radius: ['28', '40'],
      center: ['50%','20%'],
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
        {value:900, name:'余额'},
        {value:100, name:'消费'},
      ]
    }
  ]
}


class Admin extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }

  componentWillMount() {
    const { loadTeamDetail, loadTeamOperations } = this.props
    loadTeamDetail("t-aldakdsadssdsjkewr")
    loadTeamOperations("t-aldakdsadssdsjkewr")
  }

  render(){
    const teamDetail = this.props.teamDetail
    const teamOperations = this.props.teamOperations
    return (
      <div id='Admin'>
        <Row className="title">空间对应的团队</Row>
        <Row className="content" gutter={16}>
          <Col span={8} className='teamInf'>
            <Card title="团队信息总览" bordered={false} bodyStyle={{height:170}}>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    空间数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.spaceCnt}个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    镜像数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.imageCnt}个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    应用数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.appCnt}个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    编排数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.templateCnt}个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    服务数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.svcCnt}个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    存储卷数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.volumeCnt}个
                  </div>
                </Col>
              </Row>
              <Row className="teamInfItem" gutter={16}>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    容器数
                  </div>
                  <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.podCnt}个
                  </div>
                </Col>
                <Col span={12} className='tab'>
                  <div className='tabCell'>
                    <svg className="teamInfSvg" style={{margin:'0 5px'}}>
                      <use xlinkHref="#settingname" />
                    </svg>
                    构建项目数
                  </div>
                   <div style={{textAlign:'right'}} className='tabCell'>
                    {teamDetail.flowCnt}个
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={11} className='teamCost'>
            <Card title="本日该团队消费" bordered={false} bodyStyle={{height:170}}>
              <Col span={10} style={{height:170}}>
                  <ReactEcharts
                    notMerge={true}
                    option={option}
                  />
              </Col>
              <Col span={14} className='teamCostList'>
                <Row className="teamCostListTitle">
                  <Col span={16} style={{paddingLeft:40,height:40,lineHeight:'40px'}}>空间名称</Col>
                  <Col span={8} style={{height:40,lineHeight:'40px'}}>消费金额</Col>
                </Row>
                <Row className='teamCostListContent'>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                  <Row className="teamCostItem">
                    <Col span={16} style={{paddingLeft:40}}>zhaoxueyu</Col>
                    <Col span={8}>消费2T</Col>
                  </Row>
                </Row>
              </Col>
            </Card>
          </Col>
          <Col span={5} className='teamRecord'>
            <Card title="今日该团队记录" bordered={false} bodyStyle={{height:170, overflowY:'auto'}}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      创建应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {teamOperations.appCreate}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      修改应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {teamOperations.appModify}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      停止应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {teamOperations.appStop}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      启动应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {teamOperations.appStart}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      重新部署应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {teamOperations.appRedeploy}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      创建服务数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {teamOperations.svcCreate}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      删除服务数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {teamOperations.svcDelete}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      创建存储卷个数
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      1000个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="teamRecSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      删除存储卷个数
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      1000个
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state,props) {
  let teamDetailData = {
    spaceCnt: 0,
    appCnt: 0,
    svcCnt: 0,
    podCnt: 0,
    imageCnt: 0,
    templateCnt: 0,
    volumeCnt: 0,
    flowCnt: 0,
  }
  let teamOperationsData = {
    appCreate: 0,
    appModify: 0,
    svcCreate: 0,
    svcDelete: 0,
    appStop: 0,
    appStart: 0,
    appRedeploy: 0,
  }
  const {teamDetail, teamOperations} = state.overviewTeam
  if (teamDetail.result && teamDetail.result.data
      && teamDetail.result.data.data) {
    let data = teamDetail.result.data.data
    if (data.spaceCnt) {
      teamDetailData.spaceCnt = data.spaceCnt
    }
    if (data.appCnt) {
      teamDetailData.appCnt = data.appCnt
    }
    if (data.svcCnt) {
      teamDetailData.svcCnt = data.svcCnt
    }
    if (data.podCnt) {
      teamDetailData.podCnt = data.podCnt
    }
    if (data.imageCnt) {
      teamDetailData.imageCnt = data.imageCnt
    }
    if (data.templateCnt) {
      teamDetailData.templateCnt = data.templateCnt
    }
    if (data.volumeCnt) {
      teamDetailData.volumeCnt = data.volumeCnt
    }
    if (data.flowCnt) {
      teamDetailData.flowCnt = data.flowCnt
    }
  }
  if (teamOperations.result && teamOperations.result.data
      && teamOperations.result.data.data) {
        let data = teamOperations.result.data.data
        if (data.appCreate) {
          teamOperationsData.appCreate = data.appCreate
        }
        if (data.appModify) {
          teamOperationsData.appModify = data.appModify
        }
        if (data.svcCreate) {
          teamOperationsData.svcCreate = data.svcCreate
        }
        if (data.svcDelete) {
          teamOperationsData.svcDelete = data.svcDelete
        }
        if (data.appStop) {
          teamOperationsData.appStop = data.appStop
        }
        if (data.appStart) {
          teamOperationsData.appStart = data.appStart
        }
        if (data.appCreate) {
          teamOperationsData.appCreate = data.appCreate
        }
        if (data.appRedeploy) {
          teamOperationsData.appRedeploy = data.appRedeploy
        } 
      } 
  return {
    teamDetail: teamDetailData,
    teamOperations: teamOperationsData,
  }
}

export default connect(mapStateToProp, {
  loadTeamDetail,
  loadTeamOperations,
})(Admin)