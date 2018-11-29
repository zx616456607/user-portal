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
import { Row, Col, Card, Timeline, Popover, Spin, Icon, Button, Radio, Progress, Tooltip, Form } from 'antd'
import './style/MySpace.less'
import { formatOperationType, formatTypeName, formatResourceName } from '../../../../../client/containers/ManageMonitor/OperationAudit'
import { connect } from 'react-redux'
import { getOperationLogList } from '../../../../actions/manage_monitor'
import { calcuDate } from "../../../../common/tools"
import { Link } from 'react-router'
import { loadSpaceCICDStats, loadSpaceImageStats, loadSpaceInfo } from '../../../../actions/overview_space'
import { getOperationalTarget } from '../../../../actions/manage_monitor'
import { getResourceDefinition } from '../../../../actions/quota'
import homeCICDImg from '../../../../assets/img/homeCICD.png'
import homeNoWarn from '../../../../assets/img/homeNoWarn.png'
import homeHarbor from '../../../../assets/img/homeHarbor.png'
import { getGlobaleQuota, getGlobaleQuotaList, getDevopsGlobaleQuotaList } from '../../../../actions/quota'
import {REG} from "../../../../constants";
import TenxIcon from '@tenx-ui/icon/es/_old'
import { FormattedMessage } from 'react-intl'
import IntlMessages from '../../../../containers/IndexPage/Enterprise/Intl'
import CommonIntlMessages from '../../../../containers/CommonIntl'
import filter from 'lodash/filter'

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
      ciList: [],
    }
    this.myProject = this.props.intl.formatMessage(CommonIntlMessages.myProject)
  }

  componentWillMount() {
    const { loadSpaceInfo, loadSpaceCICDStats, loadSpaceImageStats,
      getOperationLogList, getOperationalTarget, getResourceDefinition,
      harbor, intl: { formatMessage } } = this.props
    getResourceDefinition({
      success: {
        func: res => {
          if (res.statusCode === 200 && res.data && res.data.definitions) {
            const ci_cd = filter(res.data.definitions, { resourceName: 'CI/CD' })[0]
            const getmsg = type => {
              switch (type) {
                case 'stage': {
                  return 'stages'
                  break;
                }
                case 'pipeline': {
                  return 'pipelines'
                  break;
                }
                case 'flow': {
                  return 'flow'
                  break;
                }
                case 'cacheVolume': {
                  return 'cacheVolume'
                  break;
                }
              }
            }
            if(!!ci_cd) {
              this.setState({
                ciList: ci_cd.children.map(item => {
                  return {
                    key: item.resourceType,
                    text: formatMessage(IntlMessages[getmsg(item.resourceType)]),
                  }
                }),
              })
            }
          }
        }
      }
    })
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
    const query = { harbor }
    loadSpaceImageStats(query, {
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
    const { projectName } = this.props
    getOperationLogList({
      from: 0,
      size: 5,
      namespace: projectName,
    })
    this.fetchQuotaList()
  }
  fetchQuotaList() {
    const { getGlobaleQuota, getGlobaleQuotaList, getDevopsGlobaleQuotaList, clusterID } = this.props
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
              globaleUseList: { ...this.state.globaleUseList, ...res.data }
            })
          }
        }
      }
    })
    getDevopsGlobaleQuotaList(query, {
      success: {
        func: res => {
          if (REG.test(res.status)) {
            this.setState({
              globaleUseList: { ...this.state.globaleUseList, ...res.result }
            })
          }
        }
      }
    })
  }
  getOperationLog() {
    const { filterData } = this.props
    const logs = this.props.auditLog
    const { formatMessage } = this.props.intl
    const ele = []
    if (!logs.logs) {
      return (
      <Card
        title={formatMessage(IntlMessages.audit)}
        bordered={false}
        bodyStyle={{ height: 410 }}
      >
        <div className='loadingBox'>
          <FormattedMessage {...IntlMessages.noData} />
        </div>
      </Card>
      )
    }
    if (logs.logs.records.length <= 0) logs.logs.records = []
    let index = 0

    logs.logs.records.forEach(item => {
      if (!item.operationType) return
      if (index > 5) return

      try {
        item.resourceName = formatResourceName(item.resourceName, item.resourceId) || JSON.parse(item.resourceConfig).origin_id

      } catch (e) {
        // do nothing
      }
      if (index === 0) {
        return ele.push(
          <Timeline.Item>
            <div className="logItem">
              <div className="logTitle">
                {`${formatOperationType(item.operationType, filterData)}  ${formatTypeName(item.resourceType, filterData) || ''}`}
                <Tooltip title={item.resourceName}>
                  <span style={{ marginLeft: 5 }}>{item.resourceName}</span>
                </Tooltip>
              </div>
              <div className="logInf">
                {calcuDate(item.time)}
                <div className="logTime">
                  {`${formatMessage(IntlMessages.continued)} ${duringTimeFormat(new Date(item.duration) - 0, this)}`}
                </div>
              </div>
            </div>
          </Timeline.Item>
        )
      }
      ele.push(<Timeline.Item >
        <div className="logItem">
          <div className="logTitle">{`${formatOperationType(item.operationType, filterData)}${formatTypeName(item.resourceType, filterData) || ''}
           ${item.resourceName || resourceConfig && resourceConfig.origin_id}`}</div>
          <div className="logInf">
            {calcuDate(item.time)}
            <div className="logTime">
              {`${formatMessage(IntlMessages.continued)} ${duringTimeFormat(new Date(item.duration) - 0, this)}`}
            </div>
          </div>
        </div>
      </Timeline.Item>)
      index++
    })
    if (ele.length == 0) ele.push(<div><FormattedMessage {...IntlMessages.noData} /></div>)
    return (
      <Card
        title={formatMessage(IntlMessages.audit)}
        bordered={false} bodyStyle={{ height: 410 }}
      >
        <Timeline style={{ height: 374, padding: '24px', overflowY: 'hidden' }}>
          {ele}
        </Timeline>
        <Row style={{ height: 30, lineHeight: '30px', borderTop: '1px solid #e2e2e2', padding: '0 24px', fontSize: '12px' }}>
          <Link to="/manange_monitor">
            <FormattedMessage {...IntlMessages.seeMore} /> >>
          </Link>
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
    const { formatMessage } = this.props.intl
    const useCount = this.useCount(key)
    const maxCount = this.maxCount(key)
    const { left = 5, right = 19 } = span
    let overUsed = false
    if (useCount > maxCount && maxCount !== -1) {
      overUsed = true
    }
    const content = <div>
      <span style={{ color: overUsed ? 'red' : 'white' }}>{useCount}</span>
      /<span>{maxCount === -1 ? formatMessage(IntlMessages.unlimit) : maxCount}</span>
    </div>
    return (
      <Tooltip title={content}>
        <Row className="number-row">
          <Col span={left}></Col>
          <Col span={right} className="number textoverflow">
            <span style={{ color: overUsed ? 'red' : '#333' }}>{useCount}</span>
            /<span>{maxCount === -1 ? formatMessage(IntlMessages.unlimit) : maxCount}</span>
          </Col>
        </Row>
      </Tooltip>
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
    const { ciList } = this.state
    const { formatMessage } = this.props.intl
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
    // const ciList = [
    //   {
    //     key: 'pipeline',
    //     text: formatMessage(IntlMessages.pipelines),
    //   },
    //   {
    //     key: 'flow',
    //     text: formatMessage(IntlMessages.stages),
    //   },
    //   {
    //     key: 'dockerfile',
    //     text: formatMessage(IntlMessages.Dockerfile),
    //   },
    // ]
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
        text: formatMessage(IntlMessages.stacks),
      },
      {
        key: 'applicationPackage',
        text: formatMessage(IntlMessages.packages),
      }]
    return (
      <div id='MySpace'>
        <Row className="title" style={{ marginTop: 20 }}>
          {
            this.props.userID === undefined
              ? spaceName === this.myProject
                ? ''
                : `${formatMessage(IntlMessages.project)} - `
              : `${formatMessage(IntlMessages.personalProject)} - `
          }
          {spaceName}
        </Row>
        <Row className="content" gutter={16}>
          <Col span={6} className="quota">
            <Card
              title={formatMessage(IntlMessages.projectResourceQuota)}
              bordered={false}
              bodyStyle={{ height: 175, padding: '7px' }}
              extra={
                <Link to={
                  spaceName === this.myProject
                    ? this.props.loginUser.role !== 2
                        ? '/account?tabs=quota'
                        : `/tenant_manage/user/${this.props.loginUser.userID}?tabs=quota`
                      :
                      this.props.userID === undefined ? `/tenant_manage/project_manage/project_detail?name=${this.props.projectName}&tabs=quota`
                        : `/tenant_manage/user/${this.props.userID}?tabs=quota`}
                >
                  <Button type="primary" size="small">
                    {
                      this.props.loginUser.info.role === 2
                      ? <FormattedMessage {...IntlMessages.setQuota} />
                      : <FormattedMessage {...IntlMessages.seeDetails} />
                    }
                  </Button>
                </Link>
              }
            >
              <Row className="radios">
                <Col span={16} offset={5}>
                  <RadioGroup size="small" onChange={(e) => this.handleChange(e)} defaultValue="ci">
                    <Radio prefixCls="ant-radio-button" value="ci">CI/CD</Radio>
                    <Radio prefixCls="ant-radio-button" value="deliver">
                      <FormattedMessage {...IntlMessages.appCenter} />
                    </Radio>
                  </RadioGroup>
                </Col>
              </Row>
              <div className="ci" style={{ display: isCi ? 'block' : 'none' }}>
                {
                  ciList.map((item, index) => (
                    <div className="info" key={`ci-${index}`}>
                      <Row>
                        <Col className="textoverflow" span={5}>
                          <Tooltip title={item.text}>
                            <span>{item.text}</span>
                          </Tooltip>
                        </Col>
                        <Col span={13}>
                          <Progress className="pro" style={{ width: '90%' }} percent={this.filterPercent(this.maxCount(item.key), this.useCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={6}>
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
                        <Col className="textoverflow" span={5}>
                          <Tooltip title={item.text}>
                            <span>{item.text}</span>
                          </Tooltip>
                        </Col>
                        <Col span={13}>
                          <Progress className="pro" style={{ width: '90%' }} percent={this.filterPercent(this.maxCount(item.key), this.useCount(item.key))} showInfo={false} />
                        </Col>
                        <Col span={6}>
                          {this.renderProcessNumber(item.key, { left: 9, rigth: 15 })}
                        </Col>
                      </Row>
                    </div>
                  ))
                }
              </div>
            </Card>
            <Card
              title={formatMessage(IntlMessages.todayProjectInfo)}
              bordered={false}
              bodyStyle={{ height: 175, padding: '20', position: 'relative', fontSize: '14px' }} style={{ marginTop: 10 }}
            >
              <div style={{ overflowY: 'auto', height: '124px' }}>
                <table className="clusterTab">
                  <tbody>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.createApp} />
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appCreate}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="volume-bind" className="icon"/>
                        <FormattedMessage {...IntlMessages.createService} />
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.svcCreate}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="storage-volume-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.createVolume} />
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.volumeCreate}
                        <FormattedMessage {...IntlMessages.one} />
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.stopApp} />
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.appStop}
                        <FormattedMessage {...IntlMessages.one} />
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="volume-bind" className="icon"/>
                        <FormattedMessage {...IntlMessages.delService} />
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.svcDelete}
                        <FormattedMessage {...IntlMessages.one} />
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="storage-volume-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.delVolume} />
                  </td>
                      <td className="trecordNum">
                        {spaceOperations.volumeDelete}
                        <FormattedMessage {...IntlMessages.one} />
                  </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.updateApp} />
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appModify}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.startApp} />
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appStart}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                    <tr>
                      <td>
                        <TenxIcon type="apps-o" className="icon"/>
                        <FormattedMessage {...IntlMessages.redeploy} />
                    </td>
                      <td className="trecordNum">
                        {spaceOperations.appRedeploy}
                        <FormattedMessage {...IntlMessages.one} />
                    </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
          <Col span={6} className='cdid'>
            <Card title={<FormattedMessage {...IntlMessages.pipelineStatusStatistics} />} bordered={false} bodyStyle={{ height: 175, padding: 0 }}>
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
                          <FormattedMessage {...IntlMessages.buildSuccessfully} />
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.succeedNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#f7676d' }}></div>
                          <FormattedMessage {...IntlMessages.buildFailed} />
                      </td>
                      <td className="cicdNum">
                          {spaceCICDStats.failedNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#46b2fa' }}></div>
                          <FormattedMessage {...IntlMessages.building} />
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.runningNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#ffbf00' }}></div>
                          <FormattedMessage {...IntlMessages.waitingForBuild} />
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.waitingNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#83D6FB' }}></div>
                          <FormattedMessage {...IntlMessages.inApproval} />
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.inApprovalNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#FF1800' }}></div>
                          <FormattedMessage {...IntlMessages.refusedToExecute} />
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.refusedToExecuteNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#faabae' }}></div>
                          <FormattedMessage {...IntlMessages.approvalTimeout} />
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.approvalTtimeoutNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          {/*<svg className="stateSvg">
                          <use xlinkHref="#settingname" />
                        </svg>*/}
                          <div className='cicdDot' style={{ backgroundColor: '#999999' }}></div>
                          <FormattedMessage {...IntlMessages.abort} />
                      </td>
                        <td className="cicdNum">
                          {spaceCICDStats.abortNumber}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ height: 40, lineHeight: '40px', borderTop: '1px solid #e2e2e2', padding: '0 24px' }}>
                <FormattedMessage {...IntlMessages.serviceStatus} />
                {
                  this.state.cicdStates ?
                    <div style={{ float: 'right' }}>
                      <Icon type="check-circle-o" style={{ color: '#42c592', marginRight: '10px' }} />
                      <span style={{ color: '#38c28c' }}>
                        <FormattedMessage {...IntlMessages.healthy} />
                      </span>
                    </div> :
                    <div style={{ float: 'right' }}>
                      <Icon type="exclamation-circle" style={{ color: '#f85a59', marginRight: '10px' }} />
                      <span style={{ color: '#f85a59' }}>
                        <FormattedMessage {...IntlMessages.abnormal} />
                      </span>
                    </div>
                }
              </Row>
            </Card>
            <Card
              title={formatMessage(IntlMessages.harborProject)}
              bordered={false}
              bodyStyle={{ height: 175, padding: 0 }}
              style={{ marginTop: 10 }}
            >
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
                          <FormattedMessage {...IntlMessages.privateProject} />
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.privateProjectCount}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className='cicdDot' style={{ backgroundColor: '#13c563' }} />
                          <FormattedMessage {...IntlMessages.privateImage} />
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.privateRepoCount}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className='cicdDot' style={{ backgroundColor: '#46b2fa' }} />
                          <FormattedMessage {...IntlMessages.publicHarbroProjects} />
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.publicProjectCount}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                      <tr>
                        <td>
                          <div className='cicdDot' style={{ backgroundColor: '#46b2fa' }} />
                          <FormattedMessage {...IntlMessages.publicImages} />
                      </td>
                        <td className="cicdNum">
                          {spaceImageStats.publicRepoCount}
                          <FormattedMessage {...IntlMessages.one} />
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              <Row style={{ height: 40, lineHeight: '40px', borderTop: '1px solid #e2e2e2', padding: '0 24px' }}>
                <FormattedMessage {...IntlMessages.serviceStatus} />
                {
                  this.state.ImageStates ?
                    <div style={{ float: 'right' }}>
                      <Icon type="check-circle-o" style={{ color: '#42c592', marginRight: '10px' }} />
                      <span style={{ color: '#38c28c' }}>
                        <FormattedMessage {...IntlMessages.healthy} />
                      </span>
                    </div> :
                    <div style={{ float: 'right' }}>
                      <Icon type="exclamation-circle" style={{ color: '#f85a59', marginRight: '10px' }} />
                      <span style={{ color: '#f85a59' }}>
                        <FormattedMessage {...IntlMessages.abnormal} />
                      </span>
                    </div>
                }
              </Row>
            </Card>
          </Col>
          <Col span={6} className='log'>
            {isFetchingAuditLog ? [
              <Card
                title={formatMessage(IntlMessages.audit)}
                bordered={false}
                bodyStyle={{ height: 410 }}
              >
                <div className="loadingBox"><Spin size="large"></Spin></div>
              </Card>
            ] : this.getOperationLog()}
          </Col>
          <Col span={6} className='warn'>
            <Card
              title={formatMessage(IntlMessages.alarm)}
              bordered={false}
              bodyStyle={{ height: 410 }}
            >
              <div className="warnListWrap">
                <Timeline className="warnList">
                  {
                    spaceWarnings.length === 0
                      ? <div className="noWarnImg">
                        <img src={homeNoWarn} alt="NoWarn" />
                        <div><FormattedMessage {...IntlMessages.noSysAlarm} /></div>
                      </div>
                      : spaceWarnings.map((item, index) => {
                        return (
                          <Timeline.Item dot={
                            index === 0
                              ? <div className="warnDot" style={{ backgroundColor: '#f6575c' }}></div>
                              : <div className="warnDot"></div>
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
    waitingNumber: 0,
    inApprovalNumber: 0,
    refusedToExecuteNumber: 0,
    approvalTtimeoutNumber: 0,
    abortNumber: 0,
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
  if (spaceCICDStats.result) {
    spaceCICDStatsData.succeedNumber = 0
    spaceCICDStatsData.runningNumber = 0
    spaceCICDStatsData.failedNumber = 0
    spaceCICDStatsData.waitingNumber = 0
    let data = spaceCICDStats.result || []
    data.forEach(({ status, count }) => {
      switch (status) {
        case -1:
          spaceCICDStatsData.waitingNumber = count
          break
        case 0:
          spaceCICDStatsData.succeedNumber = count
          break
        case 1:
          spaceCICDStatsData.failedNumber = count
          break
        case 2:
          spaceCICDStatsData.runningNumber = count
          break
        case 4:
          spaceCICDStatsData.abortNumber = count
          break
        case 32:
          spaceCICDStatsData.inApprovalNumber = count
          break
        case 33:
          spaceCICDStatsData.approvalTtimeoutNumber = count
          break
        case 34:
          spaceCICDStatsData.refusedToExecuteNumber = count
          break
        default:
          break
      }
    })
  }
  if (spaceImageStats.result && spaceImageStats.result.data) {
    spaceImageStatsData = spaceImageStats.result.data
  }
  const { harbor: harbors } = current.cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    harbor,
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

export default connect(mapStateToProp, {
  loadSpaceCICDStats,
  loadSpaceImageStats,
  getOperationLogList,
  loadSpaceInfo,
  getGlobaleQuota,
  getGlobaleQuotaList,
  getOperationalTarget,
  getResourceDefinition,
  getDevopsGlobaleQuotaList,
})(MySpace)

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
        return (time + ' ' + formatMessage(IntlMessages.hour))
      } else {
        //min
        return (time + ' ' + formatMessage(IntlMessages.minute))
      }
    } else {
      //s
      return (time + ' ' + formatMessage(IntlMessages.second))
    }
  } else {
    //ms
    return (time + ' ' + formatMessage(IntlMessages.millisecond))
  }
}

