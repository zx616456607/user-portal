/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowStageBuildLog component
 *
 * v0.1 - 2016-10-25
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Collapse, Alert } from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/TenxFlowStageBuildLog.less'
import WebSocket from '../../Websocket/socketIo'
import { genRandomString } from '../../../common/tools'
import { changeCiFlowStatus, getStageBuildLogList } from '../../../actions/cicd_flow'
import $ from 'jquery'
const ciLogs = []



function formatLog(log) {
  let newLog = log.split('\n')
  let showLogs = newLog.map((item, index) => {
    return (
      <div className='stageBuildLogDetail' key={ 'stageBuildLogDetail' + index }
           dangerouslySetInnerHTML={{__html:item}}>
        {/*<span dangerouslySetInnerHTML={{__html:item}}></span>*/}
      </div>
    )
  });
  return showLogs;
}


class TenxFlowStageBuildLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: [],
      modalSize: 'normal',
      logs: '',
      needReconnect: false,
      TenxFlowStageBuildLog: `TenxFlowStageBuildLog${genRandomString('qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)}`,
      tenxFlowLog: `tenxFlowLog${genRandomString('qwertyuioplkjhgfdsazxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)}`
    }
  }
  componentWillMount() {
    const { status, buildId, stageId } = this.props.logInfo
    const { flowId, loginUser } = this.props
    const cicdApi = loginUser.info.cicdApi
    if(status == 2) {
      this.setState({
        websocket: <WebSocket url={cicdApi.host} protocol={cicdApi.protocol} path={cicdApi.logPath} onSetup={(socket) =>this.onSetup(socket)}/>,
      })
    }
    this.setState({
      status: status
    })
  }
  componentDidUpdate() {
    const { tenxFlowLog, TenxFlowStageBuildLog } = this.state
    let id = tenxFlowLog
    if (document.getElementById(id)) {
      document.getElementById(TenxFlowStageBuildLog).scrollTop = $(`#${id}`).height()
    }
  }
  componentWillReceiveProps(nextProps){
    let { isFetching } = this.props;
    if (!nextProps.isFetching && isFetching != nextProps.isFetching ) {
      if (nextProps.logs) {
        const { tenxFlowLog, TenxFlowStageBuildLog } = this.state
        let id = tenxFlowLog.toString()
        if (document.getElementById(id)) {
          document.getElementById(TenxFlowStageBuildLog).scrollTop = $(`#${id}`).height()
        }
      }
    }
    if (!nextProps.visible && nextProps.visible != this.props.visible) {
      if (this.state.socket) {
        this.state.socket.emit("stop_recevie_log")
      }
    }
    if(nextProps.updateWebSocket) {
      this.props.setUpdateWebSocket()
      this.reconnectSocket()
    }
  }
  reconnectSocket(){
    if (this.state.socket) {
      const socket = this.state.socket
      socket.disconnect()
      socket.connect()
      $(`#${this.state.tenxFlowLog}`).html('')
      const logInfo = this.props.logInfo
      socket.emit("ciLogs", { flowId: this.props.flowId, stageId: logInfo.stageId, stageBuildId: logInfo.buildId })
      this.setState({
        needReconnect: false
      })
    }
  }
  onSetup(socket) {
    const logInfo = this.props.logInfo
    const callback = this.props.callback
    const self = this
    const tenxFlowStageBuildLog = this.state.TenxFlowStageBuildLog
    const tenxFlowLog = this.state.tenxFlowLog
    this.setState({
      socket: socket
    })
    socket.emit("ciLogs", {flowId: this.props.flowId, stageId: logInfo.stageId, stageBuildId: logInfo.buildId })
    socket.on("ciLogs", function (data) {
      data = data.toString()
      if(!data) return
      let newLog = data.split('\n')
      newLog.forEach((item) => {
        $(`#${tenxFlowLog}`).append("<div class='stageBuildLogDetail'>\
        "+item+"\
        </div>")
      })
      let height = $(`#${tenxFlowLog} .infoBox`).css('height')
      $(`#${tenxFlowStageBuildLog}`).animate({
        scrollTop: height + 'px'
      }, 0)
    })
    socket.on("ciLogs-ended", function(data) {
      if(self.props.index == undefined) return
      if(self.props.index != 0) {
        //构建完成后，如果有等待的构建，则刷新列表
        const { flowId, stageId, getStageBuildLogList } = self.props
        if(flowId && stageId){
          getStageBuildLogList(flowId,stageId)
        }
        return
      }
      self.props.changeCiFlowStatus(self.props.index, data.state, self.state.logs)
      if(callback) {
        callback(data)
      }
      
    })
    socket.on('pod-init', function(data) {
      self.setState({
        needReconnect: true
      })
      socket.disconnect()
      $(`#${tenxFlowLog}`).append(`<div class='stageBuildLogDetail'>\
        <span><a id="pod-init">30秒后自动重载，或点击刷新</a></span>\
        </div>`)
      $('#pod-init').click(function () {
        self.reconnectSocket()
      })
      setTimeout(() => {
        if (self.state.needReconnect) {
          socket.connect()
          socket.emit("ciLogs", { flowId: self.props.flowId, stageId: logInfo.stageId, stageBuildId: logInfo.buildId })
          self.setState({
            needReconnect: false
          })
        }
      }, 30000)
    })
  } 
  render() {
    const scope = this;
    let { logs, isFetching, parent } = this.props;
    if(this.props.visible === false) {
      return <div></div>
    }
    if(isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if(this.state.status === 3) {
      return (
        <div className='loadingBox'>
          <span>等待执行中</span>
        </div>
      )
    }
    if(!Boolean(logs) && !this.state.websocket) {
      return (
        <div className='loadingBox'>
          <span>暂无日志</span>
        </div>
      )
    }
    return (
      <div id={this.state.TenxFlowStageBuildLog} className="TenxFlowStageBuildLog">
        <div className='infoBox' id={this.state.tenxFlowLog}>
          {logs ? formatLog(logs) : ''}
          {this.state.websocket}
          <div style={{ clear: 'both' }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return {
    loginUser: state.entities.loginUser
  }
}

TenxFlowStageBuildLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  changeCiFlowStatus,
  getStageBuildLogList
})(injectIntl(TenxFlowStageBuildLog, {
  withRef: true,
}));

