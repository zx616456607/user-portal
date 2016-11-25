/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/18
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Card, Timeline, Popover } from 'antd'
import './style/MySpace.less'
import ReactEcharts from 'echarts-for-react'
import { connect } from 'react-redux'
import { loadSpaceOperations, loadSpaceCICDStats, loadSpaceImageStats, loadSpaceTemplateStats, loadSpaceWarnings } from '../../../actions/overview_space'

let imageOption = {
  series: [{
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    min: 0,
    max: 100,
    splitNumber: 1,
    radius: '155%',
    center: ['50%', 'bottom'],
    pointer: {
      show: false,
      width: 0
    },
    axisLine: {
      lineStyle: {
        width: 16,
        color: [[0.3, "#13c563"], [0.32,'#fff'],[1, "#46b2fa"]]
      }
    },
    splitLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel : {
      show: false,
    }
  }]
}
let layoutOption = {
  series: [{
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    min: 0,
    max: 100,
    splitNumber: 1,
    radius: '155%',
    center: ['50%', 'bottom'],
    pointer: {
      show: false,
      width: 0
    },
    axisLine: {
      lineStyle: {
        width: 16,
        color: [[0.3, "#13c563"], [0.32,'#fff'],[1, "#46b2fa"]]
      }
    },
    splitLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel : {
      show: false,
    }
  }]
}

class MySpace extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }

  componentWillMount() {
    const { loadSpaceOperations, loadSpaceCICDStats, loadSpaceImageStats, loadSpaceTemplateStats, loadSpaceWarnings } = this.props
    loadSpaceOperations()
    loadSpaceCICDStats()
    loadSpaceImageStats()
    loadSpaceTemplateStats()
    loadSpaceWarnings()
  }

  render(){
    const {spaceOperations, spaceCICDStats, spaceImageStats, spaceTemplateStats, spaceWarnings } = this.props
    return (
      <div id='MySpace'>
        <Row className="title" style={{marginTop: 40}}>我的空间</Row>
        <Row className="content" gutter={16} style={{marginBottom: 100}}>
          <Col span={6}>
            <Card title="镜像仓库" bordered={false} bodyStyle={{height:175,padding:'0',position:'relative'}}>
              <ReactEcharts
                notMerge={true}
                option={imageOption}
                style={{height:'90px'}}
              />
              <div style={{position:'absolute',top:'66px',width:'100%',textAlign:'center'}}>{spaceImageStats.publicNumber+spaceImageStats.privateNumber}个</div>
              <Row style={{textAlign:'center',height:40,lineHeight:'40px',padding:'0 24px',fontSize: '14px'}}>
                <Col span={12}>公有{spaceImageStats.publicNumber}个</Col>
                <Col span={12}>私有{spaceImageStats.privateNumber}个</Col>
              </Row>
              <Row style={{height:40,lineHeight:'40px',borderTop:'1px solid #e2e2e2',padding:'0 24px',fontSize:'12px'}}>
                服务状态:
                <div style={{float:'right'}}>
                  <svg className="stateSvg">
                    <use xlinkHref="#settingname" />
                  </svg>
                  健康
                </div>
              </Row>
            </Card>
            <Card title="编排概况" bordered={false} bodyStyle={{height:175,padding:'0',position:'relative'}} style={{marginTop: 10}}>
              <ReactEcharts
                notMerge={true}
                option={layoutOption}
                style={{height:'90px'}}
              />
              <div style={{position:'absolute',top:'66px',width:'100%',textAlign:'center'}}>{spaceTemplateStats.public+spaceTemplateStats.private}个</div>
              <Row style={{textAlign:'center',height:40,lineHeight:'40px',padding:'0 24px'}}>
                <Col span={12}>公有{spaceTemplateStats.public}个</Col>
                <Col span={12}>私有{spaceTemplateStats.private}个</Col>
              </Row>
            </Card>
          </Col>
          <Col span={6} className='cdid'>
            <Card title="CI/CD" bordered={false} bodyStyle={{height:175,padding:0}}>
              <Row style={{height:130}}>
                <Col span={12} style={{height:130}}></Col>
                <Col className='cicdInf' span={12}>
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>
                        构建成功
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {spaceCICDStats.succeedNumber}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>
                        构建失败
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {spaceCICDStats.failedNumber}个
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>
                        正在构建
                      </td>
                      <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                        {spaceCICDStats.runningNumber}个
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{height:40,lineHeight:'40px',borderTop:'1px solid #e2e2e2',padding:'0 24px'}}>
                服务状态:
                <div style={{float:'right'}}>
                  <svg className="stateSvg">
                    <use xlinkHref="#settingname" />
                  </svg>
                  健康
                </div>
              </Row>
            </Card>
            <Card title="今日该集群记录" bordered={false} bodyStyle={{height:175, overflowY:'auto'}} style={{marginTop: 10,fontSize:'13px'}}>
              <table className="clusterTab">
                <tbody>
                <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      创建应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {spaceOperations.appCreate}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      修改应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {spaceOperations.appModify}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      停止应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {spaceOperations.appStop}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      启动应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {spaceOperations.appStart}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      重新部署应用数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {spaceOperations.appRedeploy}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      创建服务数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {spaceOperations.svcCreate}个
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <svg className="stateSvg">
                        <use xlinkHref="#settingname" />
                      </svg>
                      删除服务数量
                    </td>
                    <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                      {spaceOperations.svcDelete}个
                    </td>
                  </tr>
                <tr>
                  <td>
                    <svg className="stateSvg">
                      <use xlinkHref="#settingname" />
                    </svg>
                    创建存储卷个数
                  </td>
                  <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                    {spaceOperations.volumeCreate}个
                  </td>
                </tr>
                <tr>
                  <td>
                    <svg className="stateSvg">
                      <use xlinkHref="#settingname" />
                    </svg>
                    删除存储卷个数
                  </td>
                  <td style={{textAlign:'right',paddingRight:10,fontSize:'14px'}}>
                     {spaceOperations.volumeDelete}个
                  </td>
                </tr>
                </tbody>
              </table>
            </Card>
          </Col>
          <Col span={6} className='log'>
            <Card title="审计日志" bordered={false} bodyStyle={{height:410}}>
              <Timeline style={{height:374,padding: '24px'}}>
                <Timeline.Item dot={<svg className="stateSvg"><use xlinkHref="#settingname" /></svg>}>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
                <Timeline.Item>
                  <div className="logItem">
                    <div className="logTitle">停用应用</div>
                    <div className="logInf">
                      刚刚
                      <div className="logTime">持续一秒</div>
                    </div>
                  </div>
                </Timeline.Item>
              </Timeline>
              <Row style={{height:40,lineHeight:'40px',borderTop:'1px solid #e2e2e2',padding:'0 24px',fontSize:'12px'}}>
                查看更多 >>
              </Row>
            </Card>
          </Col>
          <Col span={6} className='warn'>
            <Card title="告警" bordered={false} bodyStyle={{height:410}}>
              <Timeline className="warnList">
                {
                  spaceWarnings.map((item,index) => {
                    return (
                      <Timeline.Item dot={
                        index === 0?
                        <svg className="stateSvg"><use xlinkHref="#settingname" /></svg>:
                          <div className="warnDot"></div>
                      }>
                        <div className={index === 0?"warnItem fistWarn":'warnItem'}>
                          <Row className="itemTitle">{item.reason}</Row>
                          <Row className="itemTitle">{item.involvedObject.kind}: {item.involvedObject.name}</Row>
                          <Row className="itemInf">{item.metadata.creationTimestamp}</Row>
                        </div>
                      </Timeline.Item>
                    )
                  })
                }
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state,props) {
  let spaceOperationsData = {
    appCreate: 0,
    appModify: 0,
    svcCreate: 0,
    svcDelete: 0,
    appStop: 0,
    appStart: 0,
    appRedeploy: 0,
    volumeCreate: 0,
    volumeDelete: 0,
  }
  let spaceCICDStatsData = {
    succeedNumber: 0,
    runningNumber: 0,
    failedNumber: 0,
  }
  let spaceImageStatsData = {
    publicNumber: 0, 
    privateNumber: 0,
  }
  let spaceTemplateStatsData = {
    public: 0, 
    private: 0,
  }
  let spaceWarningsData = []
  const {spaceOperations, spaceCICDStats, spaceImageStats, spaceTemplateStats, spaceWarnings} = state.overviewSpace
  if (spaceOperations.result && spaceOperations.result.data
      && spaceOperations.result.data.data) {
    if (spaceOperations.result.data.data.app) {
      let data = spaceOperations.result.data.data.app
      if (data.appCreate) {
        spaceOperationsData.appCreate = data.appCreate
      }
      if (data.appModify) {
        spaceOperationsData.appModify = data.appModify
      }
      if (data.svcCreate) {
        spaceOperationsData.svcCreate = data.svcCreate
      }
      if (data.svcDelete) {
        spaceOperationsData.svcDelete = data.svcDelete
      }
      if (data.appStop) {
        spaceOperationsData.appStop = data.appStop
      }
      if (data.appStart) {
        spaceOperationsData.appStart = data.appStart
      }
      if (data.appCreate) {
        spaceOperationsData.appCreate = data.appCreate
      }
      if (data.appRedeploy) {
        spaceOperationsData.appRedeploy = data.appRedeploy
      } 
    }
    if (spaceOperations.result.data.data.volume) {
      let data = spaceOperations.result.data.data.volume
      if (data.volumeCreate) {
        spaceOperationsData.volumeCreate = data.volumeCreate
      }
      if (data.volumeDelete) {
        spaceOperationsData.volumeDelete = data.volumeDelete
      }
    }
  }
  if (spaceCICDStats.result && spaceCICDStats.result.data &&
      spaceCICDStats.result.data.results && spaceCICDStats.result.data.results.flowBuild) {
    let data = spaceCICDStats.result.data.results.flowBuild
    spaceCICDStatsData.succeedNumber = data.succeedNumber
    spaceCICDStatsData.runningNumber = data.runningNumber
    spaceCICDStatsData.failedNumber = data.failedNumber
  } 
  if (spaceImageStats.result && spaceImageStats.result.data) {
    let data = spaceImageStats.result.data
    spaceImageStatsData.publicNumber = data.publicNumber
    spaceImageStatsData.privateNumber = data.privateNumber
  } 
  if (spaceTemplateStats.result && spaceTemplateStats.result.data
      && spaceTemplateStats.result.data.data) {
    let data = spaceTemplateStats.result.data.data
    spaceTemplateStatsData.public = data.public
    spaceTemplateStatsData.private = data.private
  }
  if (spaceWarnings.result && spaceWarnings.result.data
      && spaceWarnings.result.data.data) {
    let data = spaceWarnings.result.data.data
    data.map(warning => {
      let warningData = {
        metadata: {
          creationTimestamp: "",
        }, 
        involvedObject: {
          kind: "",
          name: "",
        },
        reason: "",
        message: "",
      }
      warningData.metadata.creationTimestamp = warning.metadata.creationTimestamp
      warningData.involvedObject.kind = warning.involvedObject.kind
      warningData.involvedObject.name = warning.involvedObject.name
      warningData.reason = warning.reason
      warningData.message = warning.message
      spaceWarningsData.push(warningData)
    })
  }
  return {
    spaceOperations: spaceOperationsData,
    spaceCICDStats: spaceCICDStatsData,
    spaceImageStats: spaceImageStatsData,
    spaceTemplateStats: spaceTemplateStatsData,
    spaceWarnings: spaceWarningsData,
  }
}

export default connect(mapStateToProp, {
  loadSpaceOperations,
  loadSpaceCICDStats,
  loadSpaceImageStats,
  loadSpaceTemplateStats,
  loadSpaceWarnings,
})(MySpace)