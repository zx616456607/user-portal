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
import { loadContainerDetailEvents } from '../../actions/app_manage'
import Websocket from '../Websocket'
import { MAX_LOGS_NUMBER } from '../../constants'

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
      logsLoading: false,
    }
  }

  componentWillMount() {
    //bind 'esc' key down
    const scope = this;
    document.addEventListener('keyup', function(){
      if(scope.state.logSize == 'big') {
        scope.setState({
          logSize: 'normal'
        });
      }
    })
  }

  // For issue http://jira.tenxcloud.com/browse/CRYSTAL-1630
  // If current tab is not logs, component do not update and the logs will not scrollIntoView
  shouldComponentUpdate(nextProps, nextState) {
    const { tabKey, activeTabKey } = nextProps
    if (activeTabKey !== tabKey) {
      return false
    }
    return true
  }

  componentWillUnmount() {
    const ws = this.ws
    ws && ws.close()
  }

  componentWillReceiveProps(nextProps) {
    const { eventLogs } = nextProps
    const { logs } = this.state
    // Set events to logs when logs empty
    if (logs.length === 0) {
      this.setState({
        logs: eventLogs,
        logsLoading: false
      })
    }
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
    let protocol = window.location.protocol == 'http:' ? 'ws:' : 'wss:'
    return (
      <Websocket
        url={`${protocol}//${loginUser.tenxApi.host}/spi/v2/watch`}
        onSetup={this.onLogsWebsocketSetup}
        debug={false} />
    )
  }

  onLogsWebsocketSetup(ws) {
    const _this = this
    let { logs } = this.state
    const initState = {
      logsLoading: true,
      logs: [], // Clear logs when WebSocket connect
    }
    this.setState(initState)
    const { cluster, containerName, loginUser, current, loadContainerDetailEvents } = this.props
    this.ws = ws
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
      clearTimeout(this.logsLoadingTimeout)
      this.logsLoadingTimeout = setTimeout(function() {
        _this.setState({
          logsLoading: false,
        })
      }, 1500)
      let { data } = event
      data = JSON.parse(data)
      const { name, log } = data
      if (log === undefined) {
        return
      }
      const logArray = log.split('\n')
      logArray.map(log => {
        if (!log) return
        logs.push({
          name,
          log
        })
      })
      // Delete more then MAX_LOGS_NUMBER parts of logs
      // @Todo: Frequent update state, page will be stuck
      let logsLen = logs.length
      if (logsLen > MAX_LOGS_NUMBER) {
        logs.splice(0, (logsLen - MAX_LOGS_NUMBER))
      }
      const state = {
        logs,
      }
      this.setState(state)
    }
    setTimeout(() => {
      loadContainerDetailEvents(cluster, containerName)
    }, 1500);
  }

  renderLog(logObj, index) {
    let { name, log, mark } = logObj
    const dateReg = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{9})?(Z|(\+\d{2}:\d{2}))\b/
    let logDateArray = log.match(dateReg)
    let logDate
    if (logDateArray && logDateArray[0]) {
      logDate = logDateArray[0]
      log = log.replace(logDate, '')
    }
    return (
      <div className='logDetail' key={`logs_${index}`}>
        <span style={{ color: 'yellow' }}>[{name}] </span>
        {
          logDate &&
          <span style={{ color: 'orange' }}>[{formatDate(logDate)}] </span>
        }
        {
          mark &&
          <span style={{ color: '#57c5f7' }}>[{mark}] </span>
        }
        <span dangerouslySetInnerHTML={{ __html: ecma48SgrEscape(log) }}></span>
      </div>
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
    const { logs, logsLoading } = this.state
    if (!logsLoading && logs.length < 1) {
      return (
        <div className='logDetail'>
          <span>No logs.</span>
        </div>
      )
    }
    return logs.map(this.renderLog)
  }

  render() {
    const { containerName, serviceName } = this.props
    const { logSize, watchStatus, logsLoading } = this.state
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
              <span>
                <Tooltip
                  placement='left'
                  getTooltipContainer={() => document.getElementById('ContainerLogs')}
                  title={`最多保留 ${MAX_LOGS_NUMBER} 条日志`}>
                  <Icon type='question-circle-o' />
                </Tooltip>
              </span>
            </div>
            <div className='infoBox' ref={(c) => this.infoBox = c}>
              <pre>
                {this.getLogs()}
                {logsLoading && (
                  <div className='logDetail'>
                    <span>loading ...</span>
                  </div>
                )}
              </pre>
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

function mapStateToProps(state, props) {
  const { current, loginUser } = state.entities
  const { cluster, containerName } = props
  const defaultEvents = {
    isFetching: false,
    eventList: []
  }
  const { containerDetailEvents } = state.containers
  if (!containerDetailEvents[cluster]) {
    containerDetailEvents[cluster] = {}
  }
  const { eventList, isFetching } = containerDetailEvents[cluster][containerName] || defaultEvents
  let eventLogs = []
  eventList.map(event => {
    let { type, message, lastSeen, objectMeta } = event
    let eventLog = {
      name: objectMeta.name.substring(0, objectMeta.name.indexOf('-')),
      mark: 'event',
      log: lastSeen,
    }
    if (type !== 'Normal') {
      eventLog.log += ` <font color="orange">${message}</font>`
    } else {
      eventLog.log += ` <font>${message}</font>`
    }
    eventLogs.push(eventLog)
  })
  return {
    containerLogs: state.containers.containerLogs,
    loginUser: loginUser.info,
    current,
    eventLogs,
  }
}

ContainerLogs = connect(mapStateToProps, {
  // clearContainerLogs,
  loadContainerDetailEvents,
})(ContainerLogs)

export default ContainerLogs