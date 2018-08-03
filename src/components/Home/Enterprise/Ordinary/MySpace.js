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
import { Row, Col, Card, Timeline, Popover, Spin, Icon, Button, Radio, Progress } from 'antd'
import './style/MySpace.less'
import { formatOperationType, formatTypeName, formatResourceName } from '../../../../../client/containers/ManageMonitor/OperationAudit'
import { connect } from 'react-redux'
import { getOperationLogList } from '../../../../actions/manage_monitor'
import { calcuDate } from "../../../../common/tools"
import { injectIntl, defineMessages } from 'react-intl'
import { Link } from 'react-router'
import { loadSpaceCICDStats, loadSpaceImageStats, loadSpaceInfo } from '../../../../actions/overview_space'
import { getOperationalTarget } from '../../../../actions/manage_monitor'
import homeCICDImg from '../../../../assets/img/homeCICD.png'
import homeNoWarn from '../../../../assets/img/homeNoWarn.png'
import homeHarbor from '../../../../assets/img/homeHarbor.png'
import { getGlobaleQuota, getGlobaleQuotaList } from '../../../../actions/quota'

const RadioGroup = Radio.Group
class MySpace extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cicdStates: true,
      ImageStates: true,
      isCi: true,
      isdeliver: false,
      globaleList: [],
      globaleUseList: [],
    }
  }

  componentWillMount() {
    const { loadSpaceInfo, loadSpaceCICDStats, loadSpaceImageStats, getOperationLogList, getOperationalTarget } = this.props
    loadSpaceCICDStats({
      failed: {
        func: () => {
          this.setState({
            cicdStates: false,
          })
        },
        isAsync: true
      }
    })
    loadSpaceImageStats({
      failed: {
        func: () => {
          this.setState({
            ImageStates: false,
          })
        }
      }
    })
    loadSpaceInfo()
    getOperationalTarget() //审计日志中的操作类型
    let { } = this.props
    getOperationLogList({
      from: 0,
      size: 5
    })
    this.fetchQuotaList()
  }
  fetchQuotaList() {
    const { getGlobaleQuota, getGlobaleQuotaList, clusterID } = this.props
    let query = {
      id: clusterID,
    }
    getGlobaleQuota(query, {
      success: {
        func: res => {
          if (res.code === 200) {
            this.setState({
              globaleList: res.data
            })
          }
        }
      }
    })
    getGlobaleQuotaList(query, {
      success: {
        func: res => {
          if (res.code === 200) {
            this.setState({
              globaleUseList: res.data
            })
          }
        }
      }
    })
  }
  getOperationLog() {
    const { filterData } = this.props
    const logs = this.props.auditLog
    const ele = []
    if (!logs.logs) {
      return (<Card title="审计日志" bordered={false} bodyStyle={{ height: 410 }}>
        <div className='loadingBox'>
          <span>暂无数据</span>
        </div>
      </Card>)
    }
    if (logs.logs.records.length <= 0) logs.logs.records = []
    let index = 0

    logs.logs.records.forEach(item => {
      if (!item.operationType) return
      if (index > 5) return
      try {
        item.resourceName = formatResourceName(item.resourceName, item.resourceId)
      } catch (e) {
        // do nothing
      }

      if (index === 0) {
        return ele.push(
          <Timeline.Item>
            <div className="logItem">
              <div className="logTitle">{`${formatOperationType(item.operationType, filterData)}${formatTypeName(item.resourceType, filterData) || ''} ${item.resourceName}`}</div>
              <div className="logInf">
                {calcuDate(item.time)}
                <div className="logTime"> {`持续 ${duringTimeFormat(new Date(item.duration) - 0, this)}`}</div>
              </div>
            </div>
          </Timeline.Item>
        )
      }
      ele.push(<Timeline.Item >
        <div className="logItem">
          <div className="logTitle">{`${formatOperationType(item.operationType, filterData)}${formatTypeName(item.resourceType, filterData) || ''} ${item.resourceName}`}</div>
          <div className="logInf">
            {calcuDate(item.time)}
            <div className="logTime"> {`持续 ${duringTimeFormat(new Date(item.duration) - 0, this)}`}</div>
          </div>
        </div>
      </Timeline.Item>)
      index++
    })
    if (ele.length == 0) ele.push(<div>暂无审计日志</div>)
    return (
      <Card title="审计日志" bordered={false} bodyStyle={{ height: 410 }}>
        <Timeline style={{ height: 374, padding: '24px', overflowY: 'hidden' }}>
          {ele}
        </Timeline>
        <Row style={{ height: 30, lineHeight: '30px', borderTop: '1px solid #e2e2e2', padding: '0 24px', fontSize: '12px' }}>
          <Link to="/manange_monitor">查看更多 >></Link>
        </Row>
      </Card>
    )
  }
  handleChange(e) {
    const { isCi, isdeliver } = this.state
    switch (e.target.value) {
      case 'ci':
        if (isCi) {
          this.setState({
            isCi: false
          })
        } else {
          this.setState({
            isCi: true,
            isdeliver: false,
          })
        }
        break
      case 'deliver':
        if (isdeliver) {
          this.setState({
            isdeliver: false
          })
        } else {
          this.setState({
            isdeliver: true,
            isCi: false,
          })
        }
        break
      default:
        return
    }
  }
  maxCount(value) {
    const { globaleList } = this.state
    let count = -1
    if (globaleList) {
      Object.keys(globaleList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(globaleList)[index] !== null ? Object.values(globaleList)[index] : -1
        }
      })
    }
    return count
  }
  useCount(value) {
    const { globaleUseList } = this.state
    let count = 0
    if (globaleUseList) {
      Object.keys(globaleUseList).forEach((item, index) => {
        if (item === value) {
          count = Object.values(globaleUseList)[index]
        }
      })
    }
    return count
  }
  renderProcessNumber(key, span = {}) {
    const useCount = this.useCount(key)
    const maxCount = this.maxCount(key)
    const { left = 5, right = 19 } = span
    let overUsed = false
    if (useCount > maxCount && maxCount !== -1) {
      overUsed = true
    }
    return (
      <Row className="number-row">
        <Col span={left}></Col>
        <Col span={right} className="number textoverflow">
          <span style={{ color: overUsed ? 'red' : '#333' }}>{useCount}</span>
          /<span>{maxCount === -1 ? '无限制' : maxCount}</span>
        </Col>
      </Row>
    )
  }
  filterPercent(value, count) {
    let max = 100
    let result = 0
    if (value === 0 && count === 0) return 0
    if (value === 1) {
      if (count > value) {
        result = max
      } else {
        if (count === value) {
          result = max
        } else {
          result = count * 100
        }
      }
    } else if (value !== -1) {
      let number = 100 / value
      for (let i = 0; i < count; i++) {
        if (String(count).indexOf('.') === -1) {
          result += number
        } else {
          if (Number(String(count).split('.')[0]) > 0) {
            result += number
          } else {
            result += count * number
          }
        }
      }
    }
    result > max ? result = max : result
    return result
  }

  render() {
    const { spaceWarnings, spaceOperations, spaceCICDStats, spaceImageStats, spaceTemplateStats, spaceName, isFetching, filterData } = this.props
    // spaceImageStats => {"myProjectCount":3,"myRepoCount":6,"publicProjectCount":6,"publicRepoCount":6}
    let isFetchingAuditLog = true
    if (this.props.auditLog) {
      isFetchingAuditLog = this.props.auditLog.isFetching
    }
    let ImagePublicNum = ((spaceImageStats.publicRepoCount) / (spaceImageStats.publicRepoCount + spaceImageStats.myRepoCount)).toFixed(2)
    let ImageLine = isNaN(ImagePublicNum) ? 0 : ImagePublicNum * 1 + 0.02
    let TempPublicNum = ((spaceTemplateStats.public) / (spaceTemplateStats.public + spaceTemplateStats.private)).toFixed(2)
    let TempLine = isNaN(TempPublicNum) ? 0 : TempPublicNum * 1 + 0.02
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
            color: [[ImagePublicNum, "#13c563"], [ImageLine, '#fff'], [1, "#46b2fa"]]
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
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
            color: [[0, "#13c563"], [0, '#fff'], [1, "#46b2fa"]]
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false,
        }
      }]
    }
    const { isCi, isdeliver } = this.state
    const ciList = [
      {
        key: 'tenxflow',
        text: 'TenxFlow(个)',
      },
      {
        key: 'subTask',
        text: '子任务(个)',
      },
      {
        key: 'dockerfile',
        text: 'Dockerfile(个)',
      },
    ]
    const deliverList = [
      // {
      //   key: 'registryProject',
      //   text: '镜像仓库组(个)',
      // },
      // {
      //   key: 'registry',
      //   text: '镜像仓库(个)',
      // },
      {
        key: 'orchestrationTemplate',
        text: '编排文件(个)',
      },
      {
        key: 'applicationPackage',
        text: '应用包(个)',
      }]
    return (
      <div id='MySpace'>
        <Row className="title" style={{ marginTop: 20 }}>{this.props.userID === undefined ? spaceName === '我的个人项目' ? '':'共享项目 - ':'个人项目 - '}{spaceName}</Row>
        <Row className="content" gutter={16}>
          <Col span={6} className="quota">
            <Card title="项目资源配额" bordered={false} bodyStyle={{ height: 175, padding: '7px' }}
              extra={<Link to={spaceName === '我的个人项目' ? `/tenant_manage/user/${this.props.loginUser.info.userID}?tabs=quota` : this.props.userID === undefined ? `/tenant_manage/project_manage/project_detail?name=${this.props.projectName}&tabs=quota` : `/tenant_manage/user/${this.props.userID}?tabs=quota`}>
                <Button type="primary" size="small">{this.props.loginUser.info.role === 2 ? '设置配额' : '查看详情'}</Button></Link>}>
              <Row className="radios">
                <Col span={16} offset={5}>
                  <RadioGroup size="small" onChange={(e) => this.handleChange(e)} defaultValue="ci">
                    <Radio prefixCls="ant-radio-button" value="ci">CI/CD</Radio>
                    <Radio prefixCls="ant-radio-button" value="deliver">交付中心</Radio>
                  </RadioGroup>
                </Col>
              </Row>
              <div className="ci" style={{ display: isCi ? 'block' : 'none' }}>
                {
                  ciList.map((item, index) => (
                    <div className="info" key={`ci-${index}`}>
                      <Row>
                        <Col className="textoverflow" span={6}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={13}>
                          <Progress className="pro" style={{ width: '90%' }} percent={this.filterPercent(this.maxCount(item.key), this.useCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={5}>
                          {this.renderProcessNumber(item.key, { left: 9, rigth: 15 })}
                        </Col>
                      </Row>
                    </div>
                  ))
                }
              </div>
              <div className="deliver" style={{ overflowY: 'auto', display: isdeliver ? 'block' : 'none' }}>
                {
                  deliverList.map((item, index) => (
                    <div className="info" key={`deliver-${index}`}>
                      <Row>
                        <Col className="textoverflow" span={6}>
                          <span>{item.text}</span>
                        </Col>
                        <Col span={16}>
                          <Progress className="pro" style={{ width: '90%' }} percent={this.filterPercent(this.maxCount(item.key), this.useCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={2}>
                          {this.renderProcessNumber(item.key, { left: 9, rigth: 15 })}
                        </Col>
                      </Row>
                    </div>
                  ))
                }
              </div>
            </Card>
            <Card title="今日该项目记录" bordered={false} bodyStyle={{ height: 175, padding: '20', position: 'relative', fontSize: '14px' }} style={{ marginTop: 10 }}>
              <div style={{ overflowY: 'auto', height: '124px' }}>
                <table className="clusterTab">
                  <tbody>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        创建应用
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appCreate} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homeservicecount" />
                        </svg>
                        创建服务
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.svcCreate} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homesavecount" />
                        </svg>
                        创建存储卷
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.volumeCreate} 个
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        停止应用
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.appStop} 个
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homeservicecount" />
                        </svg>
                        删除服务
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.svcDelete} 个
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homesavecount" />
                        </svg>
                        删除存储卷
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.volumeDelete} 个
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        修改应用
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appModify} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        启动应用
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appStart} 个
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <svg className="stateSvg">
                          <use xlinkHref="#homeappcount" />
                        </svg>
                        重新部署
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appRedeploy} 个
                    </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
          <Col span={6} className='cdid'>
            <Card title="CI/CD" bordered={false} bodyStyle={{ height: 175, padding: 0 }}>
              <Row style={{ height: 130 }}>
                <Col span={12} style={{ height: 130, lineHeight: '130px', textAlign: 'center' }}>
                  <img src={homeCICDImg} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                </Col>
                <Col className='cicdInf' span={12}>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#13c563' }}></div>
                          构建成功
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.succeedNumber} 个
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#f7676d' }}></div>
                          构建失败
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.failedNumber} 个
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#46b2fa' }}></div>
                          正在构建
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.runningNumber} 个
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ height: 40, lineHeight: '40px', borderTop: '1px solid #e2e2e2', padding: '0 24px' }}>
                服务状态
                {
                  this.state.cicdStates ?
                    <div style={{ float: 'right' }}>
                      <Icon type="check-circle-o" style={{ color: '#42c592', marginRight: '10px' }} />
                      <span style={{ color: '#38c28c' }}>健康</span>
                    </div> :
                    <div style={{ float: 'right' }}>
                      <Icon type="exclamation-circle" style={{ color: '#f85a59', marginRight: '10px' }} />
                      <span style={{ color: '#f85a59' }}>异常</span>
                    </div>
                }
              </Row>
            </Card>
            <Card title="镜像仓库" bordered={false} bodyStyle={{ height: 175, padding: 0 }} style={{ marginTop: 10 }} >
              <Row className="warehouse">
                <Col span={10}>
                  <img src={homeHarbor} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                </Col>
                <Col span={14}>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className='cicdDot' style={{ backgroundColor: '#13c563' }} />
                          我的仓库组
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.myProjectCount} 个
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className='cicdDot' style={{ backgroundColor: '#13c563' }} />
                          我的镜像
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.myRepoCount} 个
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className='cicdDot' style={{ backgroundColor: '#46b2fa' }} />
                          公开仓库组
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.publicProjectCount} 个
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className='cicdDot' style={{ backgroundColor: '#46b2fa' }} />
                          公开镜像
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.publicRepoCount} 个
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ height: 40, lineHeight: '40px', borderTop: '1px solid #e2e2e2', padding: '0 24px' }}>
                服务状态：
                {
                  this.state.ImageStates ?
                    <div style={{ float: 'right' }}>
                      <Icon type="check-circle-o" style={{ color: '#42c592', marginRight: '10px' }} />
                      <span style={{ color: '#38c28c' }}>健康</span>
                    </div> :
                    <div style={{ float: 'right' }}>
                      <Icon type="exclamation-circle" style={{ color: '#f85a59', marginRight: '10px' }} />
                      <span style={{ color: '#f85a59' }}>异常</span>
                    </div>
                }
              </Row>
            </Card>
          </Col>
          <Col span={6} className='log'>
            {isFetchingAuditLog ? [
              <Card title="审计日志" bordered={false} bodyStyle={{ height: 410 }}>
                <div className="loadingBox"><Spin size="large"></Spin></div>
              </Card>
            ] : this.getOperationLog()}
          </Col>
          <Col span={6} className='warn'>
            <Card title="告警" bordered={false} bodyStyle={{ height: 410 }}>
              <div className="warnListWrap">
                <Timeline className="warnList">
                  {
                    spaceWarnings.length === 0 ?
                      [<div className="noWarnImg">
                        <img src={homeNoWarn} alt="NoWarn" />
                        <div>暂时无系统告警</div>
                      </div>] :
                      spaceWarnings.map((item, index) => {
                        return (
                          <Timeline.Item dot={
                            index === 0 ?
                              <div className="warnDot" style={{ backgroundColor: '#f6575c' }}></div> :
                              <div className="warnDot"></div>
                          }>
                            <div className={index === 0 ? "warnItem fistWarn" : 'warnItem'}>
                              <Row className="itemTitle">{item.reason}</Row>
                              <Row className="itemTitle">{item.involvedObject.kind}: {item.involvedObject.name}</Row>
                              <Row className="itemInf">{calcuDate(item.metadata.creationTimestamp)}</Row>
                            </div>
                          </Timeline.Item>
                        )
                      })
                  }
                </Timeline>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  const { current, loginUser } = state.entities
  const { operationalTarget } = state.manageMonitor // 拿到审计日志的操作类型
  const { clusterID } = current.cluster
  const { projectName } = current.space
  const { userID } = current.space
  let isFetching = true
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
  const { spaceOperations, spaceCICDStats, spaceImageStats, spaceTemplateStats, spaceWarnings, spaceInfo } = state.overviewSpace
  if (spaceInfo.result) {
    isFetching = spaceInfo.isFetching
    if (spaceInfo.result.operations) {
      if (spaceInfo.result.operations.app) {
        let data = spaceInfo.result.operations.app
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
      if (spaceInfo.result.operations.volume) {
        let data = spaceInfo.result.operations.volume
        if (data.volumeCreate) {
          spaceOperationsData.volumeCreate = data.volumeCreate
        }
        if (data.volumeDelete) {
          spaceOperationsData.volumeDelete = data.volumeDelete
        }
      }
    }
    if (spaceInfo.result.templates) {
      let data = spaceInfo.result.templates
      spaceTemplateStatsData.public = data.public
      spaceTemplateStatsData.private = data.private
    }
    if (spaceInfo.result.warnings) {
      let data = spaceInfo.result.warnings
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
  }
  if (spaceCICDStats.result && spaceCICDStats.result.data &&
  spaceCICDStats.result.data.result) {
    spaceCICDStatsData.succeedNumber = 0
    spaceCICDStatsData.runningNumber = 0
    spaceCICDStatsData.failedNumber = 0
    let data = spaceCICDStats.result.data.result || []
    data.forEach(({ status, count }) => {
      switch (status) {
        case 0:
          spaceCICDStatsData.succeedNumber = count
          break
        case 1:
          spaceCICDStatsData.failedNumber = count
          break
        case 2:
          spaceCICDStatsData.runningNumber = count
          break
        default:
          break
      }
    })
  }
  if (spaceImageStats.result && spaceImageStats.result.data) {
    spaceImageStatsData = spaceImageStats.result.data
  }
  return {
    userID,
    clusterID,
    loginUser,
    projectName,
    spaceOperations: spaceOperationsData,
    spaceCICDStats: spaceCICDStatsData,
    spaceImageStats: spaceImageStatsData,
    spaceTemplateStats: spaceTemplateStatsData,
    cluster: state.entities.current.cluster.clusterID,
    auditLog: state.manageMonitor.operationAuditLog.logs,
    spaceWarnings: spaceWarningsData,
    isFetching,
    filterData: operationalTarget.data || []
  }
}

MySpace = injectIntl(MySpace, {
  withRef: true,
})
export default connect(mapStateToProp, {
  loadSpaceCICDStats,
  loadSpaceImageStats,
  getOperationLogList,
  loadSpaceInfo,
  getGlobaleQuota,
  getGlobaleQuotaList,
  getOperationalTarget,
})(MySpace)

const menusText = defineMessages({
  headTitle: {
    id: 'ManageMonitor.operationalAudit.headTitle',
    defaultMessage: '操作审计',
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
  BatchIgnore: {
    id: 'ManageMonitor.operationalAudit.BatchIgnore',
    defaultMessage: '批量忽略',
  },
  EnablEmail: {
    id: 'ManageMonitor.operationalAudit.EnablEmail',
    defaultMessage: '允许发邮件',
  },
  DisablEmail: {
    id: 'ManageMonitor.operationalAudit.DisablEmail',
    defaultMessage: '禁止发邮件',
  },
  CreateOrUpdate: {
    id: 'ManageMonitor.operationalAudit.CreateOrUpdate',
    defaultMessage: '创建或更新',
  },
  ToggleEnable: {
    id: 'ManageMonitor.operationalAudit.ToggleEnable',
    defaultMessage: '切换',
  },
  Ignore: {
    id: 'ManageMonitor.operationalAudit.Ignore',
    defaultMessage: '忽略',
  },
  RollBack: {
    id: 'ManageMonitor.operationalAudit.RollBack',
    defaultMessage: '回滚',
  },
  Clone: {
    id: 'ManageMonitor.operationalAudit.Clone',
    defaultMessage: '克隆',
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
    defaultMessage: '服务滚动发布',
  },
  ServiceGrayRelease: {
    id: 'ManageMonitor.operationalAudit.ServiceGrayRelease',
    defaultMessage: '服务灰度发布',
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
    defaultMessage: '更改服务配置',
  },
  ServiceHaOption: {
    id: 'ManageMonitor.operationalAudit.ServiceHaOption',
    defaultMessage: '高可用设置',
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
  SecretConfig: {
    id: 'ManageMonitor.operationalAudit.SecretConfig',
    defaultMessage: '加密服务配置',
  },
  SecretConfigGroup: {
    id: 'ManageMonitor.operationalAudit.SecretConfigGroup',
    defaultMessage: '加密配置组',
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
  User: {
    id: 'ManageMonitor.operationalAudit.User',
    defaultMessage: '用户',
  },
  UserTeams: {
    id: 'ManageMonitor.operationalAudit.UserTeams',
    defaultMessage: '用户团队',
  },
  UserSpaces: {
    id: 'ManageMonitor.operationalAudit.UserSpaces',
    defaultMessage: '用户空间',
  },
  Team: {
    id: 'ManageMonitor.operationalAudit.Team',
    defaultMessage: '团队',
  },
  TeamUsers: {
    id: 'ManageMonitor.operationalAudit.TeamUsers',
    defaultMessage: '团队用户',
  },
  TeamMembers: {
    id: 'ManageMonitor.operationalAudit.TeamMembers',
    defaultMessage: '团队成员',
  },
  TeamSpaces: {
    id: 'ManageMonitor.operationalAudit.TeamSpaces',
    defaultMessage: '团队空间',
  },
  Alert: {
    id: 'ManageMonitor.operationalAudit.Alert',
    defaultMessage: '告警',
  },
  AlertEmailGroup: {
    id: 'ManageMonitor.operationalAudit.AlertEmailGroup',
    defaultMessage: '告警通知组',
  },
  AlertRecord: {
    id: 'ManageMonitor.operationalAudit.AlertRecord',
    defaultMessage: '告警记录',
  },
  AlertStrategy: {
    id: 'ManageMonitor.operationalAudit.AlertStrategy',
    defaultMessage: '告警策略',
  },
  AlertRule: {
    id: 'ManageMonitor.operationalAudit.AlertRule',
    defaultMessage: '告警规则',
  },
  Snapshot: {
    id: 'ManageMonitor.operationalAudit.Snapshot',
    defaultMessage: '快照',
  },
  Labels: {
    id: 'ManageMonitor.operationalAudit.Labels',
    defaultMessage: '标签',
  },
  Repo: {
    id: 'ManageMonitor.operationalAudit.Repo',
    defaultMessage: '代码仓库',
  },
  Project: {
    id: 'ManageMonitor.operationalAudit.Project',
    defaultMessage: '已激活代码库',
  },
  Flow: {
    id: 'ManageMonitor.operationalAudit.Flow',
    defaultMessage: 'TenxFlow',
  },
  Stage: {
    id: 'ManageMonitor.operationalAudit.Stage',
    defaultMessage: 'TenxFlow执行过程',
  },
  Link: {
    id: 'ManageMonitor.operationalAudit.Link',
    defaultMessage: 'TenxFlow共享目录',
  },
  Build: {
    id: 'ManageMonitor.operationalAudit.Build',
    defaultMessage: 'TenxFlow构建',
  },
  CIRule: {
    id: 'ManageMonitor.operationalAudit.CIRule',
    defaultMessage: 'CI规则',
  },
  CDRule: {
    id: 'ManageMonitor.operationalAudit.CDRule',
    defaultMessage: 'CD规则',
  },
  Dockerfile: {
    id: 'ManageMonitor.operationalAudit.Dockerfile',
    defaultMessage: '云端Dockerfile',
  },
  CINotification: {
    id: 'ManageMonitor.operationalAudit.CINotification',
    defaultMessage: 'CI构建',
  },
  CDNotification: {
    id: 'ManageMonitor.operationalAudit.CDNotification',
    defaultMessage: 'CD部署镜像',
  },
  InstanceExport: {
    id: 'ManageMonitor.operationalAudit.InstanceExport',
    defaultMessage: '镜像导出',
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
  baseImage: {
    id: 'ManageMonitor.operationalAudit.baseImage',
    defaultMessage: '基础镜像',
  },
  TransferTeam: {
    id: 'ManageMonitor.operationalAudit.TransferTeam',
    defaultMessage: '移交团队'
  },
  env: {
    id: 'ManageMonitor.operationalAudit.env',
    defaultMessage: '项目'
  },
  ProjectRoles: {
    id: 'ManageMonitor.operationalAudit.ProjectRoles',
    defaultMessage: '项目角色'
  },
  Member: {
    id: 'ManageMonitor.operationalAudit.Member',
    defaultMessage: '成员'
  },
  AddMember: {
    id: 'ManageMonitor.operationalAudit.AddMember',
    defaultMessage: '添加成员'
  },
  DeleteMember: {
    id: 'ManageMonitor.operationalAudit.DeleteMember',
    defaultMessage: '移除成员'
  },
  Enable: {
    id: 'ManageMonitor.operationalAudit.Enable',
    defaultMessage: '启用'
  },
  Disable: {
    id: 'ManageMonitor.operationalAudit.Disable',
    defaultMessage: '停用'
  },
  Wrap: {
    id: 'ManageMonitor.operationalAudit.Wrap',
    defaultMessage: '应用包管理'
  },
  WrapCheck: {
    id: 'ManageMonitor.operationalAudit.WrapCheck',
    defaultMessage: '应用包发布审核'
  },
  WrapStore: {
    id: 'ManageMonitor.operationalAudit.WrapStore',
    defaultMessage: '应用包商店'
  },
  UploadDocs: {
    id: 'ManageMonitor.operationalAudit.UploadDocs',
    defaultMessage: '上传附件'
  },
  DeleteDocs: {
    id: 'ManageMonitor.operationalAudit.DeleteDocs',
    defaultMessage: '删除附件'
  },
  DownloadDocs: {
    id: 'ManageMonitor.operationalAudit.DownloadDocs',
    defaultMessage: '下载附件'
  },
  Image: {
    id: 'ManageMonitor.operationalAudit.Image',
    defaultMessage: '镜像'
  },
  ImageCheck: {
    id: 'ManageMonitor.operationalAudit.ImageCheck',
    defaultMessage: '镜像发布审核',
  },
  ImageStore: {
    id: 'ManageMonitor.operationalAudit.ImageStore',
    defaultMessage: '镜像商店'
  },
  Upload: {
    id: 'ManageMonitor.operationalAudit.Upload',
    defaultMessage: '上传'
  },
  Download: {
    id: 'ManageMonitor.operationalAudit.Download',
    defaultMessage: '下载'
  },
  Publish: {
    id: 'ManageMonitor.operationalAudit.Publish',
    defaultMessage: '发布'
  },
  OffShelf: {
    id: 'ManageMonitor.operationalAudit.OffShelf',
    defaultMessage: '下架'
  },
  PublishPass: {
    id: 'ManageMonitor.operationalAudit.PublishPass',
    defaultMessage: '通过'
  },
  PublishReject: {
    id: 'ManageMonitor.operationalAudit.PublishReject',
    defaultMessage: '拒绝'
  },
  SubmitAudit: {
    id: 'ManageMonitor.operationalAudit.SubmitAudit',
    defaultMessage: '提交审核'
  },
  Monitor: {
    id: 'ManageMonitor.operationalAudit.Monitor',
    defaultMessage: '监控'
  },
  MonitorPanel: {
    id: 'ManageMonitor.operationalAudit.MonitorPanel',
    defaultMessage: '监控面板'
  },
  MonitorChart: {
    id: 'ManageMonitor.operationalAudit.MonitorChart',
    defaultMessage: '监控图表'
  },
  ManageClassify: {
    id: 'ManageMonitor.operationalAudit.ManageClassify',
    defaultMessage: '分类管理'
  },
  Loadbalance: {
    id: 'ManageMonitor.operationalAudit.Loadbalance',
    defaultMessage: '负载均衡'
  },
  Ingress: {
    id: 'ManageMonitor.operationalAudit.Ingress',
    defaultMessage: '监听器'
  },
  Unbind: {
    id: 'ManageMonitor.operationalAudit.Unbind',
    defaultMessage: '解绑'
  },
  Drain: {
    id: 'ManageMonitor.operationalAudit.Drain',
    defaultMessage: '维护'
  },
  UnCordon: {
    id: 'ManageMonitor.operationalAudit.UnCordon',
    defaultMessage: '退出维护'
  },
  Permission: {
    id: 'ManageMonitor.operationalAudit.Permission',
    defaultMessage: '权限控制',
  },
});

function duringTimeFormat(time, scope) {
  //this function for format duringtime
  const { formatMessage } = scope.props.intl;
  time = time / 1000;
  time = time.toFixed(0);
  if (time > 1000) {
    time = time / 1000;
    time = time.toFixed(0);
    if (time > 1000) {
      time = time / 60;
      time = time.toFixed(0);
      if (time > 60) {
        time = time / 60;
        time = time.toFixed(0);
        //hour
        return (time + ' ' + formatMessage(menusText.hour))
      } else {
        //min
        return (time + ' ' + formatMessage(menusText.minute))
      }
    } else {
      //s
      return (time + ' ' + formatMessage(menusText.second))
    }
  } else {
    //ms
    return (time + ' ' + formatMessage(menusText.millisecond))
  }
}

