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
import { Icon, Tooltip } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { formatDate } from '../../common/tools'
import { ecma48SgrEscape } from '../../common/ecma48_sgr_escape'
import './style/ContainerLogs.less'
// import { clearContainerLogs } from '../../actions/app_manage'
import Websocket from '../Websocket'

class ContainerLogs extends Component {
  constructor(props) {
    super(props)
    this.onChangeLogSize = this.onChangeLogSize.bind(this)
    this.getLogsWatchWs = this.getLogsWatchWs.bind(this)
    this.onLogsWebsocketSetup = this.onLogsWebsocketSetup.bind(this)
    this.loopWatchStatus = this.loopWatchStatus.bind(this)
    this.handleLoopWatchStatus = this.handleLoopWatchStatus.bind(this)
    this.getLogs = this.getLogs.bind(this)
    this.state = {
      logSize: 'normal',
      watchStatus: 'play',
      logs: [],
    }
  }

  componentWillMount() {
    //
  }

  componentWillUnmount() {
    const ws = this.ws
    ws && ws.close()
  }

  componentDidUpdate(prevProps, prevState) {
    const { logs } = prevState
    const _state = this.state
    if (_state.watchStatus === 'pause') {
      return
    }
    const logsBottom = document.getElementById('logsBottom')
    logsBottom.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }

  onChangeLogSize() {
    //this function for user change the log size to 'big' or 'normal'
    const { logSize } = this.state;
    if (logSize == 'big') {
      document.getElementById('containerInfo').style.transform = 'translateX(0px)';
      this.setState({
        logSize: 'normal'
      })
      return
    }
    document.getElementById('containerInfo').style.transform = 'none';
    this.setState({
      logSize: 'big'
    })
  }

  getLogsWatchWs() {
    if (!window.WebSocket) {
      // Show some tips?
      return
    }
    const { loginUser } = this.props
    if (!loginUser.tenxApi) {
      return
    }
    return (
      <Websocket
        url={`ws://${loginUser.tenxApi.host}/spi/v2/watch`}
        onSetup={this.onLogsWebsocketSetup}
        debug={false} />
    )
  }

  onLogsWebsocketSetup(ws) {
    this.setState({
      logs: []
    })
    this.ws = ws
    const { cluster, containerName, loginUser, current } = this.props
    const { watchToken, namespace } = loginUser
    const watchAuthInfo = {
      accessToken: watchToken,
      namespace: namespace,
      type: 'log',
      name: containerName,
      cluster,
    }
    if (current.space.namespace !== 'default') {
      watchAuthInfo.teamspace = current.space.namespace
    }
    ws.send(JSON.stringify(watchAuthInfo))
    ws.onmessage = (event) => {
      let { data } = event
      data = JSON.parse(data)
      const { name, log } = data
      if (log === undefined) {
        return
      }
      const logArray = log.split('\n')
      const { logs } = this.state
      logArray.map(log => {
        if (!log) return
        logs.push({
          name,
          log
        })
      })
      this.setState({
        logs
      })
    }
  }

  renderLog(logObj, index) {
    let { name, log } = logObj
    const dateReg = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{9}(Z|(\+\d{2}:\d{2}))\b/
    let logDateArray = log.match(dateReg)
    let logDate
    if (logDateArray && logDateArray[0]) {
      logDate = logDateArray[0]
      log = log.replace(logDate, '')
    }
    return (
      <span className='logDetail' key={`logs_${index}`}>
        <span style={{ color: 'yellow' }}>[{name}] </span>
        {
          logDate &&
          <span style={{ color: 'orange' }}>[{formatDate(logDate)}]</span>
        }
        <span dangerouslySetInnerHTML={{ __html: ecma48SgrEscape(log) }}></span>
      </span>
    )
  }

  loopWatchStatus() {
    const { watchStatus } = this.state
    return watchStatus === 'pause' ? 'play' : 'pause'
  }

  handleLoopWatchStatus() {
    const { watchStatus } = this.state
    let nextWatchStatus = this.loopWatchStatus()
    const ws = this.ws
    const data = {
      action: nextWatchStatus
    }
    ws && ws.send(JSON.stringify(data))
    this.setState({
      watchStatus: nextWatchStatus
    })
  }

  getLogs() {
    const { logs } = this.state
    if (logs.length < 1) {
      return (
        <pre>No logs.</pre>
      )
    }
    return (
      <pre>{logs.map(this.renderLog)}</pre>
    )
  }

  render() {
    const { containerName, serviceName } = this.props
    const { logSize, watchStatus, logs } = this.state
    const iconType = this.loopWatchStatus()
    return (
      <div id='ContainerLogs'>
        <div className={logSize == 'big' ? 'bigBox bottomBox' : 'bottomBox'} >
          <div className='introBox'>
            <div className='operaBox'>
              <span>
                <Link to={`/manange_monitor/query_log?service=${serviceName}&instance=${containerName}`}>
                  历史日志
                </Link>
              </span>
            </div>
            <div className='infoBox' ref={(c) => this.infoBox = c}>
              {this.getLogs()}
              <pre id='logsBottom'></pre>
            </div>
            <div style={{ clear: 'both' }}></div>
            <div className='operaBottomBox'>
              <i className={logSize != 'big' ? 'fa fa-expand' : 'fa fa-compress'} onClick={this.onChangeLogSize.bind(this)}></i>
              <Tooltip placement='top' title={`click to ${iconType}`}>
                <i className={`fa fa-${iconType}-circle-o`} onClick={this.handleLoopWatchStatus} />
              </Tooltip>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        {this.getLogsWatchWs()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { current, loginUser } = state.entities
  return {
    containerLogs: state.containers.containerLogs,
    loginUser: loginUser.info,
    current,
  }
}

ContainerLogs = connect(mapStateToProps, {
  // clearContainerLogs,
})(ContainerLogs)

export default ContainerLogs