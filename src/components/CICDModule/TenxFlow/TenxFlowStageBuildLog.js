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
import { changeCiFlowStatus } from '../../../actions/cicd_flow'
import $ from 'jquery'
const ciLogs = []



function formatLog(log) {
  let newLog = log.split('\n')
  let showLogs = newLog.map((item, index) => {
    return (
      <div className='stageBuildLogDetail' key={ 'stageBuildLogDetail' + index }>
        <span><span dangerouslySetInnerHTML={{__html:item}}></span></span>
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
      logs: ''
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
  onSetup(socket) {
    const logInfo = this.props.logInfo
    const callback = this.props.callback
    const self = this
    socket.emit("ciLogs", {flowId: this.props.flowId, stageId: logInfo.stageId, stageBuildId: logInfo.buildId })
    socket.on("ciLogs", function (data) {
      data = data.toString()
      if(!data) return
      let newLog = data.split('\n')
      newLog.forEach((item) => {
        $("#tenxFlowLog").append("<div class='stageBuildLogDetail'>\
        <span><span>"+item+"</span></span>\
        </div>")
      })
      let height = $('#TenxFlowStageBuildLog .infoBox').css('height')
      $('#TenxFlowStageBuildLog').animate({
        scrollTop: height + 'px'
      }, 100)
    })
    socket.on("ciLogs-ended", function(data) {
      if (callback) {
        callback(data)
      }
      if(self.props.index != 0 && !self.props.index) return
      self.props.changeCiFlowStatus(self.props.index, data.state, self.state.logs)
      if(callback) {
        callback(data)
      }
    })
  } 
  render() {
    const scope = this;
    let { logs, isFetching } = this.props;
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
      <div id='TenxFlowStageBuildLog'>
        <div className='infoBox' id="tenxFlowLog">
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
  changeCiFlowStatus
})(injectIntl(TenxFlowStageBuildLog, {
  withRef: true,
}));

