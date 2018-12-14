/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster create failed logs
 *
 * v0.1 - 2018-12-12
 * @author zhangxuan
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Modal, Button } from 'antd'
import isEmpty from 'lodash/isEmpty'
import TenxLogs from '@tenx-ui/logs/lib'
import '@tenx-ui/logs/assets/index.css'
import TenxWebsocket from '@tenx-ui/webSocket/lib/websocket'
import './style/index.less'
import { getDeepValue } from '../../../util/util'
import { MAX_LOGS_NUMBER } from '../../../../src/constants'
import { formatDate } from '../../../../src/common/tools'
import { ecma48SgrEscape } from '../../../../src/common/ecma48_sgr_escape'
import * as ClusterActions from '../../../../src/actions/cluster'
import * as EntitiesActions from '../../../../src/actions/entities'
import * as ProjectActions from '../../../../src/actions/project'
import NotificationHandler from '../../../../src/components/Notification'

const RETRY_TIMTEOUT = 5000
const notify = new NotificationHandler()

const mapStateToProps = state => {
  const loginUser = getDeepValue(state, [ 'entities', 'loginUser', 'info' ])
  const current = getDeepValue(state, [ 'entities', 'current' ])
  const activeCluster = getDeepValue(state, [ 'terminal', 'active', 'cluster' ])
  const failedData = getDeepValue(state, [ 'cluster', 'createFailedData', 'data' ])
  return {
    loginUser,
    current,
    activeCluster,
    failedData,
  }
}

@connect(mapStateToProps, {
  getCreateClusterFailedData: ClusterActions.getCreateClusterFailedData,
  restartFailedCluster: ClusterActions.restartFailedCluster,
  loadClusterList: ClusterActions.loadClusterList,
  loadLoginUserDetail: EntitiesActions.loadLoginUserDetail,
  getProjectVisibleClusters: ProjectActions.getProjectVisibleClusters,
})

export default class CreateClusterLog extends React.PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequire,
    onCancel: PropTypes.func.isRequire,
  }

  state = {}

  componentDidMount() {
    const { getCreateClusterFailedData, activeCluster } = this.props
    getCreateClusterFailedData(activeCluster)
  }

  componentWillUnmount() {
    const ws = this.ws
    ws && ws.close()
  }

  handleRetry = async () => {
    const {
      onCancel, restartFailedCluster, activeCluster, loadClusterList,
      loadLoginUserDetail, getProjectVisibleClusters, current,
    } = this.prop
    this.setState({
      loading: true,
    })
    const res = await restartFailedCluster(activeCluster)
    if (res.error) {
      this.setState({
        loading: false,
      })
      notify.warn('重新创建失败')
      return
    }
    loadLoginUserDetail()
    getProjectVisibleClusters(current.space.namespace)
    await loadClusterList({ size: 100 })
    this.setState({
      loading: false,
    })
    notify.success('重新创建成功')
    onCancel()
  }

  renderFooter = () => {
    return [
      <Button type="primary" key="retry">重新创建</Button>,
      <Button type="ghost" key="cancel" className="cancel-btn">取消</Button>,
    ]
  }

  onLogsWebsocketSetup = ws => {
    if (this.logRef) {
      this.logRef.clearLogs()
    }
    this.setState({
      logsLoading: true,
    })
    const { loginUser, current, failedData } = this.props
    if (isEmpty(failedData)) return
    this.ws = ws
    const { watchToken } = loginUser
    const { namespace, cluster, podName } = failedData
    const watchAuthInfo = {
      accessToken: watchToken,
      namespace,
      type: 'log',
      name: podName,
      cluster,
    }
    if (current.space.namespace !== 'default') {
      watchAuthInfo.teamspace = current.space.namespace
    }
    if (current.space.userName) {
      watchAuthInfo.onbehalfuser = current.space.userName
    }
    ws.send(JSON.stringify(watchAuthInfo))
    ws.onmessage = event => {
      if (event.data === 'TENXCLOUD_END_OF_STREAM') {
        this.setState({
          reconnect: false,
        })
        return
      }
      clearTimeout(this.logsLoadingTimeout)
      this.logsLoadingTimeout = setTimeout(() => {
        this.setState({
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
      const logsLen = logArray.length
      if (logsLen > MAX_LOGS_NUMBER) {
        logArray.splice(0, (logsLen - MAX_LOGS_NUMBER))
      }
      const temp = []
      logArray.forEach(log => {
        if (log) {
          temp.push({
            name,
            log,
          })
        }
      })
      if (this.logRef) {
        this.logRef.writelns(this.getLogs(temp))
      }
    }
    ws.onCloseExtend = () => {
      this.setState({
        logsLoading: true,
      })
    }
  }

  getLogs = logs => {
    const { logsLoading } = this.state
    if (!logsLoading && logs.length < 1) {
      return <div className="logDetail">
        <span>No logs.</span>
      </div>
    }
    return logs.map(this.renderLog)
  }

  renderLog = (logObj, index) => {
    let { name, log, mark } = logObj
    const dateReg = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,})?(Z|(\+\d{2}:\d{2}))\b/
    const logDateArray = log.match(dateReg)
    let logDate
    if (logDateArray && logDateArray[0]) {
      logDate = logDateArray[0]
      log = log.replace(logDate, '')
    }
    return (
      <div className="logDetail" key={`logs_${index}`}>
        <span style={{ color: 'yellow' }}>[{name}] </span>
        {
          logDate &&
          <span style={{ color: 'orange' }}>[{formatDate(logDate)}] </span>
        }
        {
          mark &&
          <span style={{ color: '#57c5f7' }}>[{mark}] </span>
        }
        <span dangerouslySetInnerHTML={{ __html: ecma48SgrEscape(log) }}/>
      </div>
    )
  }
  render() {
    const { reconnect, loading } = this.state
    const { visible, onCancel, loginUser } = this.props
    const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
    return (
      <Modal
        title="添加集群日志"
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleRetry}
        footer={this.renderFooter()}
        wrapClassName="create-cluster-log"
        width={720}
        confirmLoading={loading}
      >
        <TenxLogs
          ref={ref => (this.logRef = ref)}
          logs={[ <div className="logDetail">
            <span>loading ...</span>
          </div> ]}
        />
        <TenxWebsocket
          url={`${protocol}//${loginUser.tenxApi.host}/spi/v2/watch`}
          onSetup={this.onLogsWebsocketSetup}
          reconnect={reconnect}
        />
        <div className="hintColor tips">Tips：可根据日志提示在相应的节点上调试配置</div>
      </Modal>
    )
  }
}
