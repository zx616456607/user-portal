/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceLog component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { DatePicker, Spin, Tabs, Row, Col, Pagination } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppServiceLog.less"
import { formatDate } from '../../../common/tools'
import { DATE_PIRCKER_FORMAT, UPGRADE_EDITION_REQUIRED_CODE } from '../../../constants'
import { loadServiceLogs, clearServiceLogs } from '../../../actions/services'
import { loadContainerDetailEvents } from '../../../actions/app_manage'
import { throwError } from '../../../actions'
import { mode } from '../../../../configs/model'
import { STANDARD_MODE } from '../../../../configs/constants'
import moment from 'moment'
import merge from 'lodash/merge'
import NotificationHandler from '../../../components/Notification'
import ServiceCommonIntl, { AllServiceListIntl, AppServiceDetailIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'
import TenxTab from './FilterTabs';
import { getDeepValue } from '../../../../client/util/util'

const YESTERDAY = new Date(moment(moment().subtract(1, 'day')).format(DATE_PIRCKER_FORMAT))
const standardFlag = (mode == STANDARD_MODE ? true : false);
const TabPane = Tabs.TabPane

class AppServiceLog extends Component {
  constructor(props) {
    super(props)
    this.resizeLog = this.resizeLog.bind(this)
    this.loadContainersEvents = this.loadContainersEvents.bind(this)
    this.state = {
      currentDate: formatDate(new Date(), DATE_PIRCKER_FORMAT),
      pageIndex: 1,
      pageSize: 100,
      useGetLogs: true,
      preScroll: 0,
      logSize: 'normal',
      serviceLogs: [],
    }
  }
  componentWillMount() {
    const { cluster, serviceName, loggingEnabled } = this.props
    const { formatMessage } = this.props.intl
    const self = this
    if (!loggingEnabled) {
      let notification = new NotificationHandler()
      notification.warn(formatMessage(AppServiceDetailIntl.noInstallLogService))
      return
    }
    this.props.loadServiceLogs(cluster, serviceName, {
      from: 0,
      size: 50,
      date_start: this.state.currentDate,
      date_end: this.state.currentDate,
      log_type: 'stdout',
    }, {
        success: {
          func(result) {
            // self.infoBox.scrollTop = self.infoBox.scrollHeight
            if (!result.data || result.data.length < 50) {
              self.setState({
                useGetLogs: false
              })
            }
            // Show events when log empty
            if (!result.data || result.data.length === 0) {
              self.loadContainersEvents()
            }
          },
          isAsync: true
        }
      })
    this.setState({
      pageIndex: 2
    })
  }
  loadContainersEvents() {
    const { cluster, loadContainerDetailEvents, containers } = this.props
    containers.map(container => {
      loadContainerDetailEvents(cluster, container.metadata.name)
    })
  }
  componentWillUnmount() {
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    this.props.clearServiceLogs(cluster, serviceName)
  }
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, serviceLogs, eventLogs, cluster } = nextProps
    if (this.props.activeKey == '#logs' && !serviceDetailmodalShow) {
      this.setState({logSize: 'normal'})
    }
     let state = {
       serviceLogs,
     }
     const clusterLogs = serviceLogs[cluster]
     if (!clusterLogs || !clusterLogs['logs'] || !clusterLogs['logs']['data'] || clusterLogs['logs']['data'].length == 0) {
       state.serviceLogs = {
         [cluster]: {
          isFetching: clusterLogs.isFetching,
           logs: {
             data: eventLogs
           }
         }
       }
     }
     this.setState(state)
     if(serviceDetailmodalShow == this.props.serviceDetailmodalShow) return
     if(!serviceDetailmodalShow){
       this.props.clearServiceLogs(this.props.cluster, this.props.serviceName)
       return
     }
    // use pagination stop
    return
     state = merge({}, state, {
       currentDate: formatDate(new Date(), DATE_PIRCKER_FORMAT),
       pageIndex: 1,
       pageSize: 100,
       useGetLogs: true,
       preScroll: 0,
       serviceLogs,
     })
     this.setState(state)
     this.changeCurrentDate(new Date(), true, nextProps.cluster, nextProps.serviceName)
  }
  // use pagination stop scroll load
  moutseRollLoadLogs() {
    const { serviceLogs, cluster, intl: { formatMessage } } = this.props
    if (!this.state.useGetLogs) return
    if (this.infoBox.scrollTop >= 100 || this.infoBox.offsetHeight === this.infoBox.scrollHeight) return
    this.setState({
      useGetLogs: false
    })
    const serviceName = this.props.serviceName
    const self = this
    const scrollBottom = this.infoBox.scrollBottom
    if (!this.props.loggingEnabled) {
      let notification = new NotificationHandler()
      notification.warn(formatMessage(AppServiceDetailIntl.noInstallLogService))
      return
    }

    const logsData = serviceLogs[cluster].logs
    if (logsData.count <= logsData.data.length) return
    this.props.loadServiceLogs(cluster, serviceName, {
      from: (this.state.pageIndex - 1) * this.state.pageSize,
      size: this.state.pageSize,
      date_start: this.state.currentDate,
      date_end: this.state.currentDate,
      log_type: 'stdout',
    }, {
        success: {
          func(result) {
            if (self.state.preScroll !== 0) {
              self.infoBox.scrollTop = self.infoBox.scrollHeight - self.state.preScroll
            }
            self.setState({
              preScroll: self.infoBox.scrollHeight
            })
            if (!result.data || result.data.length < 50) {
              self.setState({
                useGetLogs: false
              })
            } else {
              self.setState({
                useGetLogs: true
              })
            }
            // Show events when log empty
            if (!result.data || result.data.length === 0) {
              self.loadContainersEvents()
            }
          },
          isAsync: true
        }
      })
    this.setState({
      pageIndex: this.state.pageIndex + 1
    })
  }
  changeLogPage(page) {
    this.logPage = page
    const { serviceName, cluster }= this.props
    this.props.loadServiceLogs(cluster, serviceName, {
      from: (page - 1) * this.state.pageSize,
      size: this.state.pageSize,
      date_start: this.state.currentDate,
      date_end: this.state.currentDate,
      log_type: 'stdout',

    })
  }
  changeCurrentDate(date, refresh, tcluster, tserviceName) {
    const { formatMessage } = this.props.intl
    if (!date) return
    const cluster = tcluster || this.props.cluster
    const serviceName = tserviceName || this.props.serviceName
    const self = this
    date = formatDate(date, DATE_PIRCKER_FORMAT)
    date = this.throwUpgradeError(date)
    if (!date) return
    if (!refresh && date === this.state.currentDate) return
    this.setState({
      currentDate: date,
      useGetLogs: true,
      pageIndex: 2,
    })
    // this.props.clearServiceLogs(cluster, serviceName)
    if (!this.props.loggingEnabled) {
      let notification = new NotificationHandler()
      notification.warn(formatMessage(AppServiceDetailIntl.formatMessage))
      return
    }
    this.logPage = 0
    this.props.loadServiceLogs(cluster, serviceName, {
      from: 0,
      size: this.state.pageSize,
      date_start: date,
      date_end: date,
      log_type: 'stdout',
    }, {
        success: {
          func(result) {
            if (!result.data || result.data.length < 50) {
              self.setState({
                useGetLogs: false
              })
            }
            // self.setState({
            //   preScroll: self.infoBox.scrollHeight
            // })
            // self.infoBox.scrollTop = self.infoBox.scrollHeight
          },
          isAsync: true
        }
      })
  }
  // The user of standard edition can only select today, if not open the upgrade modal
  throwUpgradeError(dateStr){
    if (new Date(dateStr) > YESTERDAY) {
      return dateStr
    }
    const { loginUser, throwError } = this.props
    if (!standardFlag || loginUser.envEdition > 0) {
      return dateStr
    }
    const error = new Error()
    error.statusCode = UPGRADE_EDITION_REQUIRED_CODE
    error.message = {
      details: {
        kind: 'Logging',
        level: '0',
      }
    }
    throwError(error)
    return ''
  }
  getLogs() {
    const { cluster } = this.props
    const { formatMessage } = this.props.intl
    const { serviceLogs } = this.state
    const clusterLogs = serviceLogs[cluster]
    if (!clusterLogs ) {
      return formatMessage(AppServiceDetailIntl.noLog)
    }
    // if(clusterLogs.isFetching && (!clusterLogs.logs || !clusterLogs.logs.data)){
    //   return <div className="loadingBox"><Spin size="large"></Spin></div>
    // }
    if(clusterLogs.logs && !clusterLogs.logs.data.length){
      return formatMessage(AppServiceDetailIntl.noLog)
    }
    const logs = clusterLogs.logs.data
    // if (!logs || logs.length <= 0) return formatMessage(AppServiceDetailIntl.noLog)
    // let page = Math.ceil(logs.length / 50)
    let remainder = logs.length % 50
    function spellTimeLogs(time, log) {
      return (
        <span className='logDetailSpan'>
          { log.mark && <span className='markSpan'>[{log.mark}] </span> }
          { log.name && <span className='nameSpan'>[{log.name}] </span> }
          { time && <span className='timeSpan'>[{time}] </span> }
          { log.log }
        </span>
      )
    }
    const logContent = logs.map((log, index) => {
      let time = ''
      if (log.timeNano) {
        time = new Date(parseInt(log.timeNano.substring(0, 13)))
        time = formatDate(time)
      }
      if (index === 0) {
        if (log.log === '无更多日志\n') {
          return (<span key={index}>{ `${log.log}\npage ${page}\n` }</span>)
        }
        return (
          <span key={log.id} index={index}>
            {spellTimeLogs(time, log)}
          </span>
        )
      }
      return (
        <span key={log.id} index={index}>
          {spellTimeLogs(time, log)}
        </span>
      )
    })
    return logContent
  }
  refreshLogs() {
    this.changeCurrentDate(this.state.currentDate, true)
  }
  resizeLog() {
    //this function for resize log modal to 'large' or 'normal'
    const { logSize } = this.state;
    if(logSize == 'normal') {
      this.setState({
        logSize: 'large'
      })
    } else {
      this.setState({
        logSize: 'normal'
      })
    }
  }
  disabledDate(current) {
    // can not select days after today
    return current && current.getTime() > Date.now();
  }
   collectLogsTemplate(){
    const { serviceDetail, serviceName, containerName } = this.props
    const { formatMessage } = this.props.intl
    let applog = {}
    let url = ''
    if(serviceDetail &&　serviceDetail.spec &&　serviceDetail.spec.template && serviceDetail.spec.template.metadata && serviceDetail.spec.template.metadata.annotations && serviceDetail.spec.template.metadata.annotations.applogs){
      let arr = JSON.parse(serviceDetail.spec.template.metadata.annotations.applogs)
      if(arr.length){
        applog = arr[0]
        url = `/manange_monitor/query_log?from=serviceDetailLogs&serviceName=${serviceName}&servicePath=${applog.path}&service=${serviceName}&instance=${containerName}`
      }
    }
    return <div>
      <div className='info'>
        <Row className='rowStyle'>
          <Col span={6}>{formatMessage(AppServiceDetailIntl.sourceType)}</Col>
          <Col span={18}>{applog.path ? formatMessage(AppServiceDetailIntl.catalogue) : formatMessage(AppServiceDetailIntl.gather)}</Col>
        </Row>
        <Row className='rowStyle'>
          <Col span={6}>{formatMessage(AppServiceDetailIntl.logCatalogue)}</Col>
          <Col span={18}>{applog.path || '--'}</Col>
        </Row>
        <Row className='rowStyle'>
          <Col span={6}>{formatMessage(AppServiceDetailIntl.gatherRule)}</Col>
          <Col span={18}>{applog.inregex || '--'}</Col>
        </Row>
        <Row className='rowStyle'>
          <Col span={6}>{formatMessage(AppServiceDetailIntl.exclusiveRule)}</Col>
          <Col span={18}>{applog.exregex || '--'}</Col>
        </Row>
      </div>
      {
        applog.path
          ? <div className="footer">
            <span onClick={() => browserHistory.push(url)}>
              {formatMessage(AppServiceDetailIntl.logSearch)}>>
            </span>
        </div>
          : null
      }
    </div>
  }
  render() {
    const { formatMessage } = this.props.intl
    const { serviceLogs={} } = this.state
    const { count, cluster } = this.props
    const clusterLogs = serviceLogs[cluster] || {}
    return (
      <div id="AppServiceLog">
        <div className='body'>
          <TenxTab type="card" className='logTabs' bpmShow={this.props.bpmShow} filterKey={['0']}>
            <TabPane key="0" tab={formatMessage(AppServiceDetailIntl.standardLog)}>
              <div className={ this.state.logSize == 'large' ? "largeBox bottomBox" : "bottomBox"}>
                <div className="introBox">
                  <div className="operaBox">
                    <i className="fa fa-expand" onClick={this.resizeLog}></i>
                    <i className="fa fa-refresh" onClick={() => { this.refreshLogs() } }></i>
                    <DatePicker
                      disabledDate={this.disabledDate}
                      className="datePicker"
                      onChange={(date) => this.changeCurrentDate(date) }
                      value={this.state.currentDate}
                    />
                    <span className="fa-right">
                      <Pagination pageSize={100} simple current={this.logPage || 1} onChange={(page)=> this.changeLogPage(page)} total={count} />
                    </span>
                  </div>
                  <div className="infoBox" ref={(c) => this.infoBox = c}>
                    { clusterLogs.isFetching &&
                      <div className="loadingBox"><Spin size="large"></Spin></div>
                    }
                    <pre> { this.getLogs() } </pre>
                  </div>
                  <div style={{ clear: "both" }}></div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </TabPane>
            <TabPane key="1" tab={formatMessage(AppServiceDetailIntl.gatherLog)}>
              <div className='collectLogs'>
                { this.collectLogsTemplate() }
              </div>
            </TabPane>
          </TenxTab>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { loginUser, current } = state.entities
  const { containerDetailEvents } = state.containers
  const { cluster, serviceName } = props
  const defaultEvents = {
    isFetching: false,
    eventList: []
  }
  let allContainerEvents = containerDetailEvents[cluster]
  const eventLogs = []
  if (!allContainerEvents) {
    allContainerEvents = {}
  }
  for(let key in allContainerEvents) {
    if (allContainerEvents.hasOwnProperty(key)) {
      let events = allContainerEvents[key] || defaultEvents
      let { eventList } = events
      eventList.map((event, index) => {
        let { type, message, lastSeen, objectMeta } = event
        let timeNano = + new Date(lastSeen) * 1000000 + ''
        let eventLog = {
          id: `${objectMeta.name}_${index}`,
          name: key,
          mark: 'event',
          kind: 'instance',
          timeNano: timeNano,
          log: message + '\n',
        }
        /*if (type !== 'Normal') {
          eventLog.log += ` <font color="orange">${message}</font>`
        } else {
          eventLog.log += ` <font>${message}</font>`
        }*/
        eventLogs.push(eventLog)
      })
    }
  }
  let loggingEnabled = true
  if (current && current.cluster && current.cluster.disabledPlugins) {
    loggingEnabled = !current.cluster.disabledPlugins['logging']
  }
  const  { serviceLogs } = state.services || {[cluster]:{}}
  let count =0
  const containerList = getDeepValue(state, [ 'services', 'serviceContainers', cluster, serviceName, 'containerList' ]) || []
  const containerName = containerList && containerList.length
    && getDeepValue(containerList[0], [ 'metadata', 'name' ])
    || ''
  try {
    count = serviceLogs[cluster].logs.count
  } catch (error) {
  }
  return {
    loginUser: loginUser.info,
    serviceLogs,
    count,
    eventLogs,
    loggingEnabled,
    containerName,
  }
}
AppServiceLog = injectIntl(connect(mapStateToProps, {
  loadServiceLogs,
  clearServiceLogs,
  throwError,
  loadContainerDetailEvents,
})(AppServiceLog), { withRef: true, })

export default AppServiceLog
