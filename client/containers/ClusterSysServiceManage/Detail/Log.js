/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * serviceLog of SysServiceManageDetail
 *
 * @author Songsz
 * @date 2018-12-24
 *
*/

import React from 'react'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { connect } from 'react-redux'
import { getSysLogs as _getSysLogs } from '../../../actions/sysServiceManage'
import TenxLogs from '@tenx-ui/logs/lib'
import '@tenx-ui/logs/assets/index.css'
import moment from 'moment'
import './style/Log.less'
import { DatePicker, Pagination, Spin } from 'antd'

const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

const mapState = state => {
  return ({
    isFetching: getDeepValue(state, 'sysServiceManage.logs.isFetching'.split('.')),
    logs: getDeepValue(state, 'sysServiceManage.logs.data.logs'.split('.')) || [],
    count: getDeepValue(state, 'sysServiceManage.logs.data.count'.split('.')) || [],
  })
}

@connect(mapState, {
  getSysLogs: _getSysLogs,
})
export default class Log extends React.PureComponent {
  state = {
    date: moment().format(DEFAULT_DATE_FORMAT),
    page: 1,
  }
  componentDidMount() {
    this.fetchData()
  }
  fetchData = () => {
    const { clusterID, getSysLogs, service, type } = this.props
    getSysLogs(
      clusterID,
      service,
      {
        from: (this.state.page - 1) * 100,
        size: 100,
        date_start: this.state.date,
        date_end: this.state.date,
        log_type: 'stdout',
        kind: type === 'Pod' ? 'pod' : 'service',
      }
    )
  }
  getColorLogs = () => {
    const { logs, isFetching } = this.props
    this.logRef && this.logRef.clearLogs()
    const res = logs.map((log, index) => (
      <div key={index}>
        <span className="name">[{log.name}]&nbsp;</span>
        <span className="date">[{
          // [KK-2102] the length of log.time_nano may be equal to 19
          moment(log.time_nano)
            .format(DEFAULT_TIME_FORMAT)
        }]&nbsp;</span>
        <span className="content">{log.log}</span>
      </div>
    ))
    if (!logs.length && !isFetching) {
      res.push(
        <div className="noLog">
          暂无日志
        </div>
      )
    }
    if (!logs.length && isFetching) {
      res.push(
        <div className="noLog">
          请求中...
        </div>
      )
    }
    if (this.logRef) {
      this.logRef.writelns(res)
    }
    return res
  }
  onDatePickerChange = (v, str) => {
    this.setState({
      date: str,
      page: 1,
    }, this.fetchData)
  }
  changeLogPage = page => {
    this.setState({
      page,
    }, this.fetchData)
  }
  renderHeader = () => {
    const { count } = this.props
    return (
      <div className="titleBox">
        <span className="fa-right">
          <Pagination
            pageSize={100}
            onChange={this.changeLogPage}
            simple
            current={this.state.page}
            total={count}
          />
        </span>
        <DatePicker
          value={this.state.date}
          onChange={this.onDatePickerChange}
          disabledDate={current => current && current.getTime() > Date.now()}
        />
        <i className="fa fa-refresh refreshIcon" onClick={() => this.changeLogPage(1)}/>
      </div>
    )
  }
  render() {
    this.getColorLogs()
    return (
      <div className="clusterSysServiceManageDetailLog">
        <Spin spinning={this.props.isFetching}>
          <TenxLogs
            header={this.renderHeader()}
            ref={ref => (this.logRef = ref)}
          />
        </Spin>
      </div>
    )
  }
}
