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
import { DatePicker, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppServiceLog.less"
import { formateDate } from '../../../common/tools'
import { DATE_PIRCKER_FORMAT, UPGRADE_EDITION_REQUIRED_CODE } from '../../../constants'
import { loadServiceLogs, clearServiceLogs } from '../../../actions/services'
import { loadContainerDetailEvents } from '../../../actions/app_manage'
import { throwError } from '../../../actions'
import { mode } from '../../../../configs/model'
import { STANDARD_MODE } from '../../../../configs/constants'
import moment from 'moment'
import merge from 'lodash/merge'

const YESTERDAY = new Date(moment(moment().subtract(1, 'day')).format(DATE_PIRCKER_FORMAT))
const standardFlag = (mode == STANDARD_MODE ? true : false);

class AppServiceLog extends Component {
  constructor(props) {
    super(props)
    this.resizeLog = this.resizeLog.bind(this)
    this.loadContainersEvents = this.loadContainersEvents.bind(this)
    this.state = {
      currentDate: formateDate(new Date(), DATE_PIRCKER_FORMAT),
      pageIndex: 1,
      pageSize: 50,
      useGetLogs: true,
      preScroll: 0,
      logSize: 'normal',
      serviceLogs: [],
    }
  }
  componentWillMount() {
    const { cluster, serviceName } = this.props
    const self = this
    this.props.loadServiceLogs(cluster, serviceName, {
      size: 50
    }, {
        success: {
          func(result) {
            self.infoBox.scrollTop = self.infoBox.scrollHeight
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
     let state = {
       serviceLogs,
     }
     const clusterLogs = this.state.serviceLogs[cluster]
     if (!clusterLogs || !clusterLogs['logs'] || !clusterLogs['logs']['data'] || clusterLogs['logs']['data'].length == 0) {
       state.serviceLogs = {
         [cluster]: {
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
     state = merge({}, state, {
       currentDate: formateDate(new Date(), DATE_PIRCKER_FORMAT),
       pageIndex: 1,
       pageSize: 50,
       useGetLogs: true,
       preScroll: 0,
       serviceLogs,
     })
     this.setState(state)
     this.changeCurrentDate(new Date(), true, nextProps.cluster, nextProps.serviceName)
  }
  moutseRollLoadLogs() {
    if (!this.state.useGetLogs) return
    if (this.infoBox.scrollTop >= 100 || this.infoBox.offsetHeight === this.infoBox.scrollHeight) return
    this.setState({
      useGetLogs: false
    })
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    const self = this
    const scrollBottom = this.infoBox.scrollBottom
    this.props.loadServiceLogs(cluster, serviceName, {
      from: (this.state.pageIndex - 1) * this.state.pageSize,
      size: this.state.pageSize,
      date_start: this.state.currentDate,
      date_end: this.state.currentDate,
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
  changeCurrentDate(date, refresh, tcluster, tserviceName) {
    if (!date) return
    const cluster = tcluster || this.props.cluster
    const serviceName = tserviceName || this.props.serviceName
    const self = this
    date = formateDate(date, DATE_PIRCKER_FORMAT)
    date = this.throwUpgradeError(date)
    if (!date) return
    if (!refresh && date === this.state.currentDate) return
    this.setState({
      currentDate: date,
      useGetLogs: true,
      pageIndex: 2,
    })
    this.props.clearServiceLogs(cluster, serviceName)
    this.props.loadServiceLogs(cluster, serviceName, {
      from: 0,
      size: this.state.pageSize,
      date_start: date,
      date_end: date
    }, {
        success: {
          func(result) {
            if (!result.data || result.data.length < 50) {
              self.setState({
                useGetLogs: false
              })
            }
            self.setState({
              preScroll: self.infoBox.scrollHeight
            })
            self.infoBox.scrollTop = self.infoBox.scrollHeight
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
    const { serviceLogs } = this.state
    const clusterLogs = serviceLogs[cluster]
    if (!clusterLogs ) {
      return '无日志'
    }
    if(clusterLogs.isFetching){
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    if(!clusterLogs.logs){
      return '无日志'
    }
    const logs = clusterLogs.logs.data
    if (!logs || logs.length <= 0) return '无日志'
    let page = Math.ceil(logs.length / 50)
    let remainder = logs.length % 50
    function spellTimeLogs(time, log) {
      return time
             ? (
               <span className='logDetailSpan'>
                 <span className='timeSpan'>[{time}] </span>
                 { log.mark && <span className='timeSpan'>[{log.mark}] </span> }
                 { log.log }
               </span>
             )
             : log.log
    }
    const logContent = logs.map((log, index) => {
      let time = ''
      if (log.timeNano) {
        time = new Date(parseInt(log.timeNano.substring(0, 13))).toLocaleString()
      }
      if (index === 0) {
        if (log.log === '无更多日志\n') {
          return (<span key={index}>{ `${log.log}\npage ${page}\n` }</span>)
        }
        return (
          <span key={index}>
            { `page ${page}\n` }
            {spellTimeLogs(time, log)}
          </span>)
      }
      if (index + 1 === remainder && page !== 1) {
        return (
          <span key={index}>
            { `page ${--page}\n` }
            {spellTimeLogs(time, log)}
          </span>
        )
      }
      if ((index + 1) % 50 === 0 && page !== 1) {
        return (
          <span key={index}>
            { `page ${--page}\n` }
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
  render() {
    return (
      <div id="AppServiceLog">
        <div className={ this.state.logSize == 'large' ? "largeBox bottomBox" : "bottomBox"}>
          <div className="introBox">
            <div className="operaBox">
              <i className="fa fa-expand" onClick={this.resizeLog}></i>
              <i className="fa fa-refresh" onClick={() => { this.refreshLogs() } }></i>
              <DatePicker
                disabledDate={this.disabledDate}
                className="datePicker"
                onChange={(date) => this.changeCurrentDate(date) }
                value={this.state.currentDate}/>
            </div>
            <div className="infoBox" ref={(c) => this.infoBox = c} onScroll ={ () => this.moutseRollLoadLogs() }>
              <pre> { this.getLogs() } </pre>
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { loginUser } = state.entities
  const { containerDetailEvents } = state.containers
  const { cluster } = props
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
  return {
    loginUser: loginUser.info,
    serviceLogs: state.services.serviceLogs,
    eventLogs,
  }
}
AppServiceLog = connect(mapStateToProps, {
  loadServiceLogs,
  clearServiceLogs,
  throwError,
  loadContainerDetailEvents,
})(AppServiceLog)

export default AppServiceLog
