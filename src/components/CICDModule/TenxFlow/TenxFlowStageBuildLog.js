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
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../constants'
import { getFlowBuildStageLogs } from '../../../actions/cicd_flow'
import './style/TenxFlowStageBuildLog.less'

function formatLog(log) {
  //this function for format log
  let newLog = log.split('\n')
  let showLogs = newLog.map((item, index) => {
    return (
      <div className='stageBuildLogDetail' key={ 'stageBuildLogDetail' + index }>
        <span>{item}</span>
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
      modalSize: 'normal'
    }
  }

  componentWillMount() {
    const { getFlowBuildStageLogs, flowId, stageId, buildId } = this.props;
    getFlowBuildStageLogs(flowId, stageId, buildId)
  }

  render() {
    const scope = this;
    const { logs, isFetching } = this.props;
    console.log(logs)
    if(isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const { message } = logs;
    if(message.length == 0) {
      return (
        <div className='loadingBox'>
          <span>数据为空</span>
        </div>
      )
    }
    return (
      <div id='TenxFlowStageBuildLog'>
        <div className='infoBox'>
          {formatLog(message)}
          <div style={{ clear: 'both' }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultLogs = {
    isFetching: false,
    logs: []
  }
  const { getFlowBuildStageLogs } = state.cicd_flow
  const { isFetching, logs } = getFlowBuildStageLogs || defaultLogs
  return {
    isFetching,
    logs
  }
}

TenxFlowStageBuildLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getFlowBuildStageLogs
})(injectIntl(TenxFlowStageBuildLog, {
  withRef: true,
}));

