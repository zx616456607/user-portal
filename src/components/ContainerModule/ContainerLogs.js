/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerLogs component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { DatePicker } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { formateDate } from '../../common/tools'
import "./style/ContainerLogs.less"
import { loadContainerLogs, clearContainerLogs } from '../../actions/app_manage'

class ContainerLogs extends Component {
  constructor(props) {
    super(props)
    this.onChangeLogSize = this.onChangeLogSize.bind(this)
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
    const containerName = this.props.containerName
    const self = this
    this.props.loadContainerLogs(cluster, containerName, {
      size: 50
    }, {
      success: {
        func() {
          self.infoBox.scrollTop = self.infoBox.scrollHeight
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
    const containerName = this.props.containerName
    this.props.clearContainerLogs(cluster, containerName)
  }
  moutseRollLoadLogs() {
    if(!this.state.useGetLogs) return
    if(this.infoBox.scrollTop >= 100 || this.infoBox.offsetHeight === this.infoBox.scrollHeight) return
    this.setState({
      useGetLogs: false
    })
    const cluster = this.props.cluster
    const containerName =  this.props.containerName
    const self = this
    const scrollBottom = this.infoBox.scrollBottom
    this.props.loadContainerLogs(cluster, containerName, {
      from: (this.state.pageIndex - 1) * this.state.pageSize,
      size: this.state.pageSize,
      date_start: this.state.currentDate,
      date_end: this.state.currentDate
    }, {
      success: {
        func(result) {
          if(self.state.preScroll !== 0) {
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
  changeCurrentDate(date, refresh) {
    if(!date) return
    const cluster = this.props.cluster
    const containerName = this.props.containerName
    const self = this
    date = formateDate(date, 'YYYY-MM-DD')
    if (!refresh && date === this.state.currentDate) return
    this.setState({
      currentDate: date,
      useGetLogs: true,
      pageIndex: 2,
    })
    this.props.clearContainerLogs(cluster, containerName)
    this.props.loadContainerLogs(cluster, containerName, {
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
    if (!this.props.containerLogs[cluster] || !this.props.containerLogs[cluster].logs) {
      return '无日志'
    }
    const logs = this.props.containerLogs[cluster].logs.data
    if (!logs || logs.length <= 0) return '无日志'
    let page = Math.ceil(logs.length / 50)
    let remainder = logs.length % 50
    const logContent = logs.map((log, index) => {
      let time = ''
      if (log.timeNano) {
        time = new Date(parseInt(log.timeNano.substring(0, 13))).toLocaleString()
      }
      if (index === 0) {
        if (log.log === '无更多日志\n') {
          return (<span key={index}>{ `${log.log}\npage ${page}\n` }</span>)
        }
        return (<span key={index}>{ `page ${page}\n${time ? `[${time}] ${log.log}` : log.log}` }</span>)
      }
      if (index + 1 === remainder && page !== 1) {
        return (<span key={index}>{ `page ${--page}\n${time ? `[${time}] ${log.log}` : log.log}` }</span>)
      }
      if ((index + 1) % 50 === 0 && page !== 1) {
        return (<span key={index}>{ `page ${--page}\n${time ? `[${time}] ${log.log}` : log.log}` }</span>)
      }
      return (<span key={log.id} index={index}>{ time ? `[${time}] ${log.log}` : log.log}</span>)
    })
    return logContent
  }
  refreshLogs() {
    this.changeCurrentDate(this.state.currentDate, true)
  }
  onChangeLogSize() {
    //this function for user change the log size to 'big' or 'normal'
    const { logSize } = this.state;
    if(logSize == 'big') {
      document.getElementById('containerInfo').style.transform = 'translateX(0px)';
      this.setState({
        logSize: 'normal'
      })
    } else {
      document.getElementById('containerInfo').style.transform = 'none';
      this.setState({
        logSize: 'big'
      })
    }
  }
  render() {
    return (
      <div id="ContainerGraph">
        <div className={this.state.logSize == 'big' ? "bigBox bottomBox" : 'bottomBox'} >
          <div className="introBox">
            <div className="operaBox">
              <i className="fa fa-expand" onClick={this.onChangeLogSize.bind(this)}></i>
              <i className="fa fa-refresh" onClick={() => {this.refreshLogs()}}></i>
              <DatePicker className="datePicker" onChange={(date)=> this.changeCurrentDate(date)} value={this.state.currentDate}/>
            </div>
            <div className="infoBox" ref={(c)=> this.infoBox = c} onScroll ={ () => this.moutseRollLoadLogs() }>
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
    containerLogs: state.containers.containerLogs
  }
}
ContainerLogs = connect(mapStateToProps, {
  loadContainerLogs,
  clearContainerLogs
})(ContainerLogs)
export default ContainerLogs