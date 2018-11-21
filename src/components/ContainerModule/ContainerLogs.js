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
import { Icon, Tooltip, Button } from 'antd'
import '@tenx-ui/logs/assets/index.css'
import TenxLogs from '@tenx-ui/logs/lib'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { formatDate } from '../../common/tools'
import { ecma48SgrEscape } from '../../common/ecma48_sgr_escape'
import './style/ContainerLogs.less'
// import { clearContainerLogs } from '../../actions/app_manage'
import { loadContainerDetailEvents,setTingLogs } from '../../actions/app_manage'
import Websocket from '../Websocket'
import { MAX_LOGS_NUMBER } from '../../constants'
import {injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from './ContainerDetailIntl'

const RETRY_TIMTEOUT = 5000

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
      reconnect: true,
      logDetail: false
    }
  }

  componentWillMount() {
    //bind 'esc' key down
    const scope = this;
    document.addEventListener('keyup', function(e){
      if(e.keyCode == 27 && scope.state.logSize == 'big') {
        scope.setState({
          logSize: 'normal'
        });
      }
    })
    if (location.pathname.indexOf('/app_manage/container/') > -1) {
      this.setState({logDetail: true})
    }
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
    const { eventLogs,containerLogs } = nextProps
    // const loading = <div className='logDetail'>
    //   <span>loading ...</span>
    // </div>
    // let res
    // if(this.state.logsLoading){
    //   res = this.getLogs(loading)
    // }else{
    //   this.getLogs()
    // }

    if (nextProps.containerName !== this.props.containerName) {
      if(!!this.logRef){
        this.logRef.clearLogs()
        this.logRef.writelns(eventLogs)
      }
      this.setState({
        logsLoading: false
      })
      return
    }
    // Set events to logs when logs empty
    if (location.pathname.indexOf('/app_manage/container/') > -1) {
      this.setState({logDetail: true})
    } else {
      this.setState({logDetail: false})
      if (nextProps.visible) {
        this.handleLoopWatchStatus()
      }
    }
    let bottomBox = document.getElementsByClassName('bottomBox')[0]
    if (containerLogs.logSize) {
      let logSize = 'normal'
      const containerInfo = document.getElementById('containerInfo')
      if (containerLogs.logSize == 'big') {
        logSize = 'big'
        containerInfo? containerInfo.style.transform = 'none':''
        let h = document.getElementById('TerminalModal').offsetHeight
        bottomBox.style.height = document.body.offsetHeight - h +'px'
      } else {
        containerInfo? containerInfo.style.transform = 'translateX(0px)':''
      }
      this.setState({
        logSize
      })
      return
    }
    if (bottomBox) {
      bottomBox.style.height = null
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { logsLoading } = this.state
    const _state = this.state
    if (_state.watchStatus === 'pause') {
      return
    }
    if(!logsLoading){
      const logsBottom = document.getElementById('logsBottom')
      logsBottom && logsBottom.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }

  onChangeLogSize() {
    //this function for user change the log size to 'big' or 'normal'
    const { logSize } = this.state;
    if (logSize == 'big') {
      document.getElementById('containerInfo').style.transform = 'translateX(0px)';
      this.setState({
        logSize: 'normal'
      })
      this.props.setTingLogs('normal')
      document.getElementsByClassName('bottomBox')[0].style.height = null
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
        reconnect={this.state.reconnect}
        debug={false} />
    )
  }

  onLogsWebsocketSetup(ws) {
    const _this = this
    if(!!this.logRef){
      this.logRef.clearLogs()
    }
    const initState = {
      logsLoading: true,
    }
    this.setState(initState)
    const { cluster, containerName, loginUser, current, loadContainerDetailEvents } = this.props
    if (!cluster || !containerName) return
    this.ws = ws
    const { watchToken, namespace } = loginUser
    const watchAuthInfo = {
      accessToken: watchToken,
      namespace,
      type: 'log',
      name: containerName,
      cluster,
    }
    if (current.space.namespace !== 'default') {
      watchAuthInfo.teamspace = current.space.namespace
    }
    if (current.space.userName) {
      watchAuthInfo.onbehalfuser = current.space.userName
    }
    ws.send(JSON.stringify(watchAuthInfo))
    ws.onmessage = (event) => {
      if (event.data == "TENXCLOUD_END_OF_STREAM") {
        this.setState({
          reconnect: false
        })
        return
      }
      clearTimeout(this.logsLoadingTimeout)
      this.logsLoadingTimeout = setTimeout(function() {
        _this.setState({
          logsLoading: false,
        })
      }, RETRY_TIMTEOUT)
      let { data } = event
      data = JSON.parse(data)
      const { name, log } = data
      if (log === undefined) {
        return
      }
      const logArray = log.split('\n')
      let logsLen = logArray.length
      if (logsLen > MAX_LOGS_NUMBER) {
        logArray.splice(0, (logsLen - MAX_LOGS_NUMBER))
      }
      const temp = []
      logArray.map(log => {
        if(!!log){
          temp.push({
            name,
            log
          })
        }
      })

      // Delete more then MAX_LOGS_NUMBER parts of logs
      // @Todo: Frequent update state, page will be stuck

      if(!!this.logRef){
        this.logRef.writelns(this.getLogs(temp))
      }
    }
    ws.onCloseExtend = err => {
      // ws.onclose && ws.onclose(err)
      this.setState(initState)
    }
    setTimeout(() => {
      loadContainerDetailEvents(cluster, containerName)
    }, RETRY_TIMTEOUT)
  }

  renderLog(logObj, index) {
    let { name, log, mark } = logObj
    const dateReg = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,})?(Z|(\+\d{2}:\d{2}))\b/
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

  getLogs(logs) {
    const { logsLoading } = this.state
    if (!logsLoading && logs.length < 1) {
      return (
        <div className='logDetail'>
          <span>No logs.</span>
        </div>
      )
    }

    return logs.map(this.renderLog)
    // logsLoading ? [
    //   logs.map(this.renderLog),
    //   <div className='logDetail'>
    //     <span>loading ...</span>
    //   </div>
    // ] : logs.map(this.renderLog)
  }
  closeModal = ()=> {
    this.props.func.closeModal()
    this.handleLoopWatchStatus()
  }
  render() {
    const { containerName, serviceName,func } = this.props
    const { formatMessage } = this.props.intl
    const { logSize, watchStatus, logsLoading } = this.state
    const iconType = this.loopWatchStatus()
    const header = (() => {
      return <div className='operaBox'>
        <span>
          {
            this.state.logDetail?
              [
                <Tooltip key="tooltip" placement='top' title={`click to ${iconType}`}>
                  <i className={`fa fa-${iconType}-circle-o`} onClick={this.handleLoopWatchStatus} />
                </Tooltip>,
                <Link key="link" to={`/manange_monitor/query_log?service=${serviceName}&instance=${containerName}`}>
                  <FormattedMessage {...IntlMessages.historyLogs} />
                </Link>,
              ]
              :
              <Button icon="cross" onClick={this.closeModal} className="closeBtn"></Button>
          }
        </span>
        <span>
          <Tooltip
            placement='left'
            getTooltipContainer={() => document.getElementById('ContainerLogs')}
            title={formatMessage(IntlMessages.maxLogsTip, { maxLogNum: MAX_LOGS_NUMBER })}>
            <Icon type='question-circle-o' />
          </Tooltip>
        </span>
      </div>
    })()
    return (
      <div id='ContainerLogs'>
        <TenxLogs
          header={header}
          ref={ref => (this.logRef = ref)}
          logs={[<div className='logDetail'>
            <span>loading ...</span>
          </div>]}
        />
        {/*<div>
          <div className={logSize == 'big' ? 'bigBox bottomBox' : 'bottomBox'} >
            <div className='introBox'>
              {header}
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
              {this.state.logDetail?
              <div className='operaBottomBox'>
                <i className={logSize != 'big' ? 'fa fa-expand' : 'fa fa-compress'} onClick={this.onChangeLogSize}></i>
                <Tooltip placement='top' title={`click to ${iconType}`}>
                  <i className={`fa fa-${iconType}-circle-o`} onClick={this.handleLoopWatchStatus} />
                </Tooltip>
              </div>
              :
              <div className="operaBottomBox" style={{paddingRight: 20}}>
                <Tooltip placement='top' title={`click to ${iconType}`}>
                  <i className={`fa fa-${iconType}-circle-o`} onClick={this.handleLoopWatchStatus} />
                </Tooltip>
              </div>
              }
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>*/}
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

ContainerLogs = injectIntl(connect(mapStateToProps, {
  // clearContainerLogs,
  loadContainerDetailEvents,
  setTingLogs
})(ContainerLogs), { withRef: true })

export default ContainerLogs
