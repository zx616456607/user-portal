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
import { DatePicker } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppServiceLog.less"
import { formateDate } from '../../../common/tools'
import { loadServiceLogs, clearServiceLogs } from '../../../actions/services'

class AppServiceLog extends Component {
  constructor(props) {
    super(props)
    this.resizeLog = this.resizeLog.bind(this)
    this.state = {
      currentDate: formateDate(new Date(), 'YYYY-MM-DD'),
      pageIndex: 1,
      pageSize: 50,
      useGetLogs: true,
      preScroll: 0,
      logSize: 'normal'
    }
  }
  componentWillMount() {
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
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
          },
          isAsync: true
        }
      })
    this.setState({
      pageIndex: 2
    })
  }
  componentWillUnmount() {
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    this.props.clearServiceLogs(cluster, serviceName)
  }
  componentWillReceiveProps(nextProp) {
     const { serviceDetailmodalShow } = nextProp
     if(serviceDetailmodalShow == this.props.serviceDetailmodalShow) return
     if(!serviceDetailmodalShow){
       this.props.clearServiceLogs(this.props.cluster, this.props.serviceName)
       return
     }
     this.setState({
       currentDate: formateDate(new Date(), 'YYYY-MM-DD'),
       pageIndex: 1,
       pageSize: 50,
       useGetLogs: true,
       preScroll: 0
     })
     this.changeCurrentDate(new Date(), true, nextProp.cluster, nextProp.serviceName),0
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
    date = formateDate(date, 'YYYY-MM-DD')
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
  getLogs() {
    const cluster = this.props.cluster
    if (!this.props.serviceLogs[cluster] || !this.props.serviceLogs[cluster].logs) {
      return '无日志'
    }
    const logs = this.props.serviceLogs[cluster].logs.data
    if (!logs || logs.length <= 0) return '无日志'
    let page = Math.ceil(logs.length / 50)
    let remainder = logs.length % 50
    function spellTimeLogs(time, log) {
      return time ? (<span className='logDetailSpan'><span className='timeSpan'>[{time}]</span> {log.log}</span>) : log.log
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
  render() {
    return (
      <div id="AppServiceLog">
        <div className={ this.state.logSize == 'large' ? "largeBox bottomBox" : "bottomBox"}>
          <div className="introBox">
            <div className="operaBox">
              <i className="fa fa-expand" onClick={this.resizeLog}></i>
              <i className="fa fa-refresh" onClick={() => { this.refreshLogs() } }></i>
              <DatePicker className="datePicker" onChange={(date) => this.changeCurrentDate(date) } value={this.state.currentDate}/>
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

function mapStateToProps(state) {
  return {
    serviceLogs: state.services.serviceLogs
  }
}
AppServiceLog = connect(mapStateToProps, {
  loadServiceLogs,
  clearServiceLogs
})(AppServiceLog)

export default AppServiceLog
