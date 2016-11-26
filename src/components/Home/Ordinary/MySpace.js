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
import { Row, Col, Card, Timeline, Popover, Spin } from 'antd'
import './style/MySpace.less'
import ReactEcharts from 'echarts-for-react'
import { connect } from 'react-redux'
import { getOperationLogList } from '../../../actions/manage_monitor'
import { calcuDate } from "../../../common/tools"
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Link } from 'react-router'
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
   const { loadSpaceOperations, loadSpaceCICDStats, loadSpaceImageStats, loadSpaceTemplateStatst, loadSpaceWarnings, getOperationLogList } = this.props
    loadSpaceWarnings()
    loadSpaceOperations()
    loadSpaceCICDStats()
    loadSpaceImageStats()
    loadSpaceTemplateStats()
    let {} = this.props
    let { namespace, teamspace } = this.props
    if(teamspace != 'default') namespace = teamspace
    getOperationLogList({
      from: 0,
      size: 100,
      namespace: namespace
    })
  }
  componentDidMount() {

  }
  getOperationLog() {
    const logs = this.props.auditLog
    if (!logs.logs || logs.logs.records.length <= 0) {
      return <div></div>
    }
    const ele = []
    let index = 0
    logs.logs.records.forEach(item => {
         if(!item.operationType) return
         if(index > 5) return
         if(index === 0) {
           return ele.push(
             <Timeline.Item
               
             >
               <div className="logItem">
                 <div className="logTitle">{`${operationalFormat(item.operationType, this)}${resourceFormat(item.resourceType, this) || ''}${item.resourceName}`}</div>
                 <div className="logInf">
                 {calcuDate(item.time)}
                <div className="logTime"> {`持续${duringTimeFormat(new Date(item.duration) - 0, this)}`}</div>
                 </div>
               </div>
             </Timeline.Item>
           )
         }
         ele.push(<Timeline.Item >
           <div className="logItem">
             <div className="logTitle">{`${operationalFormat(item.operationType, this)}${resourceFormat(item.resourceType, this) || ''}${item.resourceName}`}}</div>
             <div className="logInf">
               {calcuDate(item.time)}
               <div className="logTime"> {`持续${duringTimeFormat(new Date(item.duration) - 0, this)}`}</div>
             </div>
           </div>
         </Timeline.Item>)
         index++
      })

    return (
      <Card title="审计日志" bordered={false} bodyStyle={{ height: 410 }}>
        <Timeline style={{ height: 374, padding: '24px' }}>
          {ele}
        </Timeline>
        <Row style={{ height: 40, lineHeight: '40px', borderTop: '1px solid #e2e2e2', padding: '0 24px', fontSize: '12px' }}>
          <Link to="/manange_monitor">查看更多 >></Link>
      </Row>
      </Card>
    )
  }

  render(){
    const {spaceOperations, spaceCICDStats, spaceImageStats, spaceTemplateStats, spaceWarnings } = this.props
    let isFetchingAuditLog = true
    if (this.props.auditLog) {
      isFetchingAuditLog  = this.props.auditLog.isFetching
    }
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
            <Card title="今日该空间记录" bordered={false} bodyStyle={{height:175, overflowY:'auto'}} style={{marginTop: 10,fontSize:'13px'}}>
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
          { isFetchingAuditLog ? <div className="loadingBox"><Spin size="large"></Spin></div>: this.getOperationLog()}
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
                          <Row className="itemInf">{calcuDate(item.metadata.creationTimestamp)}</Row>
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
    cluster: state.entities.current.cluster.clusterID,
    namespace: state.entities.current.space.namespace,
    teamspace: state.entities.current.team.teamId,
    auditLog: state.manageMonitor.operationAuditLog.logs,
    spaceWarnings: spaceWarningsData,
  }
}

MySpace = injectIntl(MySpace, {
  withRef: true,
})
export default connect(mapStateToProp, {
  loadSpaceOperations,
  loadSpaceCICDStats,
  loadSpaceImageStats,
  loadSpaceTemplateStats,
  getOperationLogList,
  loadSpaceWarnings,
})(MySpace)
 
const menusText = defineMessages({
  headTitle: {
    id: 'ManageMonitor.operationalAudit.headTitle',
    defaultMessage: '操作审计 | 时速云',
  },
  title: {
    id: 'ManageMonitor.operationalAudit.title',
    defaultMessage: '操作审计',
  },
  time: {
    id: 'ManageMonitor.operationalAudit.time',
    defaultMessage: '时间',
  },
  status: {
    id: 'ManageMonitor.operationalAudit.status',
    defaultMessage: '状态',
  },
  during: {
    id: 'ManageMonitor.operationalAudit.during',
    defaultMessage: '持续时间',
  },
  event: {
    id: 'ManageMonitor.operationalAudit.event',
    defaultMessage: '操作类型',
  },
  obj: {
    id: 'ManageMonitor.operationalAudit.obj',
    defaultMessage: '对象及类型',
  },
  env: {
    id: 'ManageMonitor.operationalAudit.env',
    defaultMessage: '环境',
  },
  cluster: {
    id: 'ManageMonitor.operationalAudit.cluster',
    defaultMessage: '集群',
  },
  user: {
    id: 'ManageMonitor.operationalAudit.user',
    defaultMessage: '发起者',
  },
  Create: {
    id: 'ManageMonitor.operationalAudit.Create',
    defaultMessage: '添加',
  },
  Get: {
    id: 'ManageMonitor.operationalAudit.Get',
    defaultMessage: '请求',
  },
  List: {
    id: 'ManageMonitor.operationalAudit.List',
    defaultMessage: '获取',
  },
  Update: {
    id: 'ManageMonitor.operationalAudit.Update',
    defaultMessage: '更新',
  },
  Delete: {
    id: 'ManageMonitor.operationalAudit.Delete',
    defaultMessage: '删除',
  },
  Start: {
    id: 'ManageMonitor.operationalAudit.Start',
    defaultMessage: '开始',
  },
  Stop: {
    id: 'ManageMonitor.operationalAudit.Stop',
    defaultMessage: '结束',
  },
  Restart: {
    id: 'ManageMonitor.operationalAudit.Restart',
    defaultMessage: '重启',
  },
  Pause: {
    id: 'ManageMonitor.operationalAudit.Pause',
    defaultMessage: '停止',
  },
  Resume: {
    id: 'ManageMonitor.operationalAudit.Resume',
    defaultMessage: '继续',
  },
  BatchDelete: {
    id: 'ManageMonitor.operationalAudit.BatchDelete',
    defaultMessage: '批量删除',
  },
  BatchStart: {
    id: 'ManageMonitor.operationalAudit.BatchStart',
    defaultMessage: '批量开始',
  },
  BatchStop: {
    id: 'ManageMonitor.operationalAudit.BatchStop',
    defaultMessage: '批量停止',
  },
  BatchRestart: {
    id: 'ManageMonitor.operationalAudit.BatchRestart',
    defaultMessage: '批量重启',
  },
  QuickRestart: {
    id: 'ManageMonitor.operationalAudit.QuickRestart',
    defaultMessage: '快速重启',
  },
  CheckExist: {
    id: 'ManageMonitor.operationalAudit.CheckExist',
    defaultMessage: '检测存在',
  },
  Format: {
    id: 'ManageMonitor.operationalAudit.Format',
    defaultMessage: '格式化',
  },
  Expand: {
    id: 'ManageMonitor.operationalAudit.Expand',
    defaultMessage: '扩张',
  },
  Unknown: {
    id: 'ManageMonitor.operationalAudit.Unknown',
    defaultMessage: '其它',
  },
  selectObject: {
    id: 'ManageMonitor.operationalAudit.selectObject',
    defaultMessage: '选择操作对象',
  },
  selectEvent: {
    id: 'ManageMonitor.operationalAudit.selectEvent',
    defaultMessage: '选择操作类型',
  },
  selectStatus: {
    id: 'ManageMonitor.operationalAudit.selectStatus',
    defaultMessage: '选择状态',
  },
  Instance: {
    id: 'ManageMonitor.operationalAudit.Instance',
    defaultMessage: '实例',
  },
  InstanceEvent: {
    id: 'ManageMonitor.operationalAudit.InstanceEvent',
    defaultMessage: '实例事件',
  },
  InstanceLog: {
    id: 'ManageMonitor.operationalAudit.InstanceLog',
    defaultMessage: '实例日志',
  },
  InstanceMetrics: {
    id: 'ManageMonitor.operationalAudit.InstanceMetrics',
    defaultMessage: '实例指标',
  },
  InstanceContainerMetrics: {
    id: 'ManageMonitor.operationalAudit.InstanceContainerMetrics',
    defaultMessage: '实例容器指标',
  },
  Service: {
    id: 'ManageMonitor.operationalAudit.Service',
    defaultMessage: '服务',
  },
  ServiceInstance: {
    id: 'ManageMonitor.operationalAudit.ServiceInstance',
    defaultMessage: '服务实例',
  },
  ServiceEvent: {
    id: 'ManageMonitor.operationalAudit.ServiceEvent',
    defaultMessage: '服务事件',
  },
  ServiceLog: {
    id: 'ManageMonitor.operationalAudit.ServiceLog',
    defaultMessage: '服务日志',
  },
  ServiceK8sService: {
    id: 'ManageMonitor.operationalAudit.ServiceK8sService',
    defaultMessage: 'k8s服务',
  },
  ServiceRollingUpgrade: {
    id: 'ManageMonitor.operationalAudit.ServiceRollingUpgrade',
    defaultMessage: '服务弹性伸缩',
  },
  ServiceManualScale: {
    id: 'ManageMonitor.operationalAudit.ServiceManualScale',
    defaultMessage: '服务手动伸缩',
  },
  ServiceAutoScale: {
    id: 'ManageMonitor.operationalAudit.ServiceAutoScale',
    defaultMessage: '服务自动伸缩',
  },
  ServiceQuota: {
    id: 'ManageMonitor.operationalAudit.ServiceQuota',
    defaultMessage: '服务Quota',
  },
  ServiceHaOption: {
    id: 'ManageMonitor.operationalAudit.ServiceHaOption',
    defaultMessage: '服务HaOption',
  },
  ServiceDomain: {
    id: 'ManageMonitor.operationalAudit.ServiceDomain',
    defaultMessage: '服务域名',
  },
  App: {
    id: 'ManageMonitor.operationalAudit.App',
    defaultMessage: '应用',
  },
  AppService: {
    id: 'ManageMonitor.operationalAudit.AppService',
    defaultMessage: '应用服务',
  },
  AppOperationLog: {
    id: 'ManageMonitor.operationalAudit.AppOperationLog',
    defaultMessage: '应用操作日志',
  },
  AppExtraInfo: {
    id: 'ManageMonitor.operationalAudit.AppExtraInfo',
    defaultMessage: '应用外部信息',
  },
  AppTopology: {
    id: 'ManageMonitor.operationalAudit.AppTopology',
    defaultMessage: '应用拓补',
  },
  Config: {
    id: 'ManageMonitor.operationalAudit.Config',
    defaultMessage: '配置',
  },
  ConfigGroup: {
    id: 'ManageMonitor.operationalAudit.ConfigGroup',
    defaultMessage: '配置组',
  },
  Node: {
    id: 'ManageMonitor.operationalAudit.Node',
    defaultMessage: '主机',
  },
  NodeMetrics: {
    id: 'ManageMonitor.operationalAudit.NodeMetrics',
    defaultMessage: '主机指标',
  },
  ThirdPartyRegistry: {
    id: 'ManageMonitor.operationalAudit.ThirdPartyRegistry',
    defaultMessage: '第三方容器',
  },
  Volume: {
    id: 'ManageMonitor.operationalAudit.Volume',
    defaultMessage: '存储',
  },
  VolumeConsumption: {
    id: 'ManageMonitor.operationalAudit.VolumeConsumption',
    defaultMessage: '存储使用',
  },
  allstatus: {
    id: 'ManageMonitor.operationalAudit.allstatus',
    defaultMessage: '所有状态',
  },
  running: {
    id: 'ManageMonitor.operationalAudit.running',
    defaultMessage: '运行中',
  },
  success: {
    id: 'ManageMonitor.operationalAudit.success',
    defaultMessage: '完成',
  },
  failed: {
    id: 'ManageMonitor.operationalAudit.failed',
    defaultMessage: '失败',
  },
  search: {
    id: 'ManageMonitor.operationalAudit.search',
    defaultMessage: '立即查询',
  },
  microsecond: {
    id: 'ManageMonitor.operationalAudit.microsecond',
    defaultMessage: '微秒',
  },
  millisecond: {
    id: 'ManageMonitor.operationalAudit.millisecond',
    defaultMessage: '毫秒',
  },
  second: {
    id: 'ManageMonitor.operationalAudit.second',
    defaultMessage: '秒',
  },
  minute: {
    id: 'ManageMonitor.operationalAudit.minute',
    defaultMessage: '分',
  },
  hour: {
    id: 'ManageMonitor.operationalAudit.hour',
    defaultMessage: '时',
  },
  objType: {
    id: 'ManageMonitor.operationalAudit.objType',
    defaultMessage: '类型：',
  },
  objName: {
    id: 'ManageMonitor.operationalAudit.objName',
    defaultMessage: '对象：',
  },
  allResource: {
    id: 'ManageMonitor.operationalAudit.allResource',
    defaultMessage: '所有对象',
  },
});

function duringTimeFormat(time, scope) {
  //this function for format duringtime
  const { formatMessage } = scope.props.intl;
  time = time / 1000;
  time = time.toFixed(0);
  if(time > 1000) {
    time = time / 1000;
    time = time.toFixed(0);
    if(time > 1000){
      time = time / 60;
      time = time.toFixed(0);
      if(time > 60) {
        time = time / 60;
        time = time.toFixed(0);
        //hour
        return (time + ' ' + formatMessage(menusText.hour) )
      } else {
        //min
        return (time + ' ' + formatMessage(menusText.minute) )
      }
    } else {
      //s
      return (time + ' ' + formatMessage(menusText.second) )
    }
  } else {
    //ms
    return (time + ' ' + formatMessage(menusText.millisecond) )
  }
}

function resourceFormat(resourceType, scope) {
  //this function for format resource type to show user
  const { formatMessage } = scope.props.intl;
  if(!resourceType) return ''
  switch(resourceType + '') {
    case '1':
      return formatMessage(menusText.Instance)
      break;
    case '2':
      return formatMessage(menusText.InstanceEvent)
      break;
    case '3':
      return formatMessage(menusText.InstanceLog)
      break;
    case '4':
      return formatMessage(menusText.InstanceMetrics)
      break;
    case '5':
      return formatMessage(menusText.InstanceContainerMetrics)
      break;
    case '6':
      return formatMessage(menusText.Service)
      break;
    case '7':
      return formatMessage(menusText.ServiceInstance)
      break;
    case '8':
      return formatMessage(menusText.ServiceEvent)
      break;
    case '9':
      return formatMessage(menusText.ServiceLog)
      break;
    case '10':
      return formatMessage(menusText.ServiceK8sService)
      break;
    case '11':
      return formatMessage(menusText.ServiceRollingUpgrade)
      break;
    case '12':
      return formatMessage(menusText.ServiceManualScale)
      break;
    case '13':
      return formatMessage(menusText.ServiceAutoScale)
      break;
    case '14':
      return formatMessage(menusText.ServiceQuota)
      break;
    case '15':
      return formatMessage(menusText.ServiceHaOption)
      break;
    case '16':
      return formatMessage(menusText.ServiceDomain)
      break;
    case '17':
      return formatMessage(menusText.App)
      break;
    case '18':
      return formatMessage(menusText.AppService)
      break;
    case '19':
      return formatMessage(menusText.AppOperationLog)
      break;
    case '20':
      return formatMessage(menusText.AppExtraInfo)
      break;
    case '21':
      return formatMessage(menusText.AppTopology)
      break;
    case '22':
      return formatMessage(menusText.ConfigGroup)
      break;
    case '23':
      return formatMessage(menusText.Config)
      break;
    case '24':
      return formatMessage(menusText.Node)
      break;
    case '25':
      return formatMessage(menusText.NodeMetrics)
      break;
    case '26':
      return formatMessage(menusText.ThirdPartyRegistry)
      break;
    case '27':
      return formatMessage(menusText.Volume)
      break;
    case '28':
      return formatMessage(menusText.VolumeConsumption)
      break;
    case '0':
      return formatMessage(menusText.Unknown)
      break;
  }
}

function operationalFormat(operationalType, scope) {
  //this function for format operational type to show user
  const { formatMessage } = scope.props.intl;
  if(!operationalType) return ''
  switch(operationalType + '') {
    case '1':
      return formatMessage(menusText.Create)
      break;
    case '2':
      return formatMessage(menusText.Get)
      break;
    case '3':
      return formatMessage(menusText.List)
      break;
    case '4':
      return formatMessage(menusText.Update)
      break;
    case '5':
      return formatMessage(menusText.Delete)
      break;
    case '6':
      return formatMessage(menusText.Start)
      break;
    case '7':
      return formatMessage(menusText.Stop)
      break;
    case '8':
      return formatMessage(menusText.Restart)
      break;
    case '9':
      return formatMessage(menusText.Pause)
      break;
    case '10':
      return formatMessage(menusText.Resume)
      break;
    case '11':
      return formatMessage(menusText.BatchDelete)
      break;
    case '12':
      return formatMessage(menusText.BatchStart)
      break;
    case '13':
      return formatMessage(menusText.BatchStop)
      break;
    case '14':
      return formatMessage(menusText.BatchRestart)
      break;
    case '15':
      return formatMessage(menusText.QuickRestart)
      break;
    case '16':
      return formatMessage(menusText.CheckExist)
      break;
    case '17':
      return formatMessage(menusText.Format)
      break;
    case '18':
      return formatMessage(menusText.Expand)
      break;
    case '0':
      return formatMessage(menusText.Unknown)
      break;
  }
}
