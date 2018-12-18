/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/


/**
 *
 * Job container
 *
 * @author Songsz
 * @update Zhouhaitao
 * @date 2018-12-18
 *
 */
import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { DEFAULT_TIME_FORMAT } from '../../../../../../../constants/index'
import TenxLogs from '@tenx-ui/logs'
import './style/index.less'
import * as statefulSetActions from '../../../../../../actions/statefulSet'

const mapStateToProps = state => {
  const { cluster } = state.entities.current
  const { statefulSet } = state
  const { isFetching, data } = statefulSet.logs
  const { logs } = data
  return {
    clusterID: cluster.clusterID,
    logs,
    isFetching,
  }
}

@connect(mapStateToProps, {
  getPodsList: statefulSetActions.getPodsList,
  getNativeLogs: statefulSetActions.getNativeLogs,
})
class Log extends React.PureComponent {
  async componentDidMount() {
    const timeNow = moment(new Date()).format(DEFAULT_TIME_FORMAT.split(' ')[0])
    const { dbName, clusterID, getPodsList, getNativeLogs } = this.props
    await getPodsList(clusterID, 'StatefulSet', dbName)
    const body = {
      from: 0,
      size: 50,
      date_start: timeNow,
      date_end: timeNow,
      log_type: 'stdout',
      kind: 'pod',
    }
    getNativeLogs(clusterID, body)
  }
  getColorLogs = () => {
    const { logs } = this.props
    const res = []
    logs && logs.map(log => res.push(
      <div className="stateful-set-logs">
        <span className="name">[{log.name}]&nbsp;</span>
        <span className="date">[{
          moment(parseInt(log.time_nano / 1000))
            .format(DEFAULT_TIME_FORMAT)
        }]&nbsp;</span>
        <span className="content">{log.log}</span>
      </div>
    ))
    if (!res.length) {
      res.push(
        <div className="noLog">
        暂无日志
        </div>
      )
    }
    if (this.logRef) {
      this.logRef.clearLogs()
      this.logRef.writelns(res)
    }
    return res
  }
  render() {
    this.getColorLogs()
    return (
      <TenxLogs
        ref={ref => (this.logRef = ref)}
      />
    )
  }
}

export default Log
