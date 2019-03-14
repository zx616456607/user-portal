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
import TenxLogs from '@tenx-ui/logs/lib'
import '@tenx-ui/logs/assets/index.css'
import TenxWebsocket from '@tenx-ui/webSocket/lib/websocket'
import './style/index.less'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { MAX_LOGS_NUMBER, UPDATE_INTERVAL } from '../../../../src/constants'
import { formatDate } from '../../../../src/common/tools'
import { ecma48SgrEscape } from '../../../../src/common/ecma48_sgr_escape'
import * as ClusterActions from '../../../../src/actions/cluster'
import * as EntitiesActions from '../../../../src/actions/entities'
import * as ProjectActions from '../../../../src/actions/project'
import NotificationHandler from '../../../../src/components/Notification'
import isEmpty from 'lodash/isEmpty'

const RETRY_TIMTEOUT = 5000
const notify = new NotificationHandler()

const POD_STATUS = ['Running', 'Succeeded', 'Failed']

const mapStateToProps = (state, props) => {
  const { logClusterID } = props
  const loginUser = getDeepValue(state, [ 'entities', 'loginUser', 'info' ])
  const current = getDeepValue(state, [ 'entities', 'current' ])
  const failedData = getDeepValue(state, [ 'cluster', 'createFailedData', 'data' ])
  const creatingClusterIntervalData = getDeepValue(state, [ 'cluster', 'creatingClusterInterval', 'data' ])
  const addingHostsIntervalData = getDeepValue(state, [ 'cluster', 'addingHostsInterval', 'data' ])
  const clusterDetail = getDeepValue(state, [ 'cluster', 'clusterDetail', logClusterID, 'data' ])
  return {
    loginUser,
    current,
    failedData,
    creatingClusterIntervalData,
    addingHostsIntervalData,
    clusterDetail,
  }
}

@connect(mapStateToProps, {
  getCreateClusterFailedData: ClusterActions.getCreateClusterFailedData,
  fetchClearCreateClusterFailedData: ClusterActions.fetchClearCreateClusterFailedData,
  restartFailedCluster: ClusterActions.restartFailedCluster,
  loadClusterList: ClusterActions.loadClusterList,
  loadLoginUserDetail: EntitiesActions.loadLoginUserDetail,
  getProjectVisibleClusters: ProjectActions.getProjectVisibleClusters,
  creatingClusterInterval: ClusterActions.creatingClusterInterval,
  addingHostsInterval: ClusterActions.addingHostsInterval,
  getClusterDetail: ClusterActions.getClusterDetail,
})

export default class CreateClusterLog extends React.PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequire,
    logClusterID: PropTypes.string.isRequire,
    isCreating: PropTypes.bool,
    onCancel: PropTypes.func.isRequire,
  }

  state = {
    wsconnect: true,
  }

  async componentDidMount() {
    const {
      logClusterID,
      getClusterDetail,
    } = this.props
    await getClusterDetail(logClusterID)
    this.interLoadFailedData(this.props)
  }

  async componentWillReceiveProps(nextProps) {
    const {
      clusterDetail: newDetail,
      fetchClearCreateClusterFailedData,
    } = nextProps
    const { clusterDetail: oldDetail } = this.props
    if (oldDetail && newDetail &&
      (oldDetail.createStatus === 1) && (newDetail.createStatus === 4)) {
      this.setState({
        wsconnect: false,
      })
      await fetchClearCreateClusterFailedData()
      await this.interLoadFailedData(nextProps)
      this.setState({
        wsconnect: true,
      })
    }
  }

  componentWillUnmount() {
    const {
      creatingClusterIntervalData, addingHostsIntervalData, fetchClearCreateClusterFailedData,
    } = this.props
    if (!isEmpty(creatingClusterIntervalData)) {
      this.clearIntervalLoadClusters()
    }
    if (!isEmpty(addingHostsIntervalData)) {
      this.clearAddingHostsInterval()
    }
    fetchClearCreateClusterFailedData()
    const ws = this.ws
    ws && ws.close()
    clearInterval(this.intervalFailed)
  }

  interLoadFailedData = async props => {
    const { logClusterID, clusterDetail, getCreateClusterFailedData } = props
    clearInterval(this.intervalFailed)
    const res
      = await getCreateClusterFailedData(logClusterID, { log_type: clusterDetail.createStatus })
    const detail = getDeepValue(res, [ 'response', 'result', 'data' ])
    if (getDeepValue(detail, [ 'podStatus' ]) === 'Running') {
      return
    }
    this.intervalFailed = setInterval(async () => {
      const result =
        await getCreateClusterFailedData(logClusterID, { log_type: clusterDetail.createStatus })
      const failedDetail = getDeepValue(result, [ 'response', 'result', 'data' ])
      if (getDeepValue(failedDetail, [ 'podStatus' ]) === 'Running') {
        clearInterval(this.intervalFailed)
      }
    }, UPDATE_INTERVAL)
  }

  loadClusterDetail = async (cluster, status) => {
    const { getClusterDetail, addingHostsIntervalData, creatingClusterIntervalData } = this.props
    await getClusterDetail(cluster)
    const { clusterDetail } = this.props
    const createStatus = getDeepValue(clusterDetail, [ cluster, 'data', 'createStatus' ])
    if (status === 1 && createStatus !== 1) {
      // createStatus 从 1 => 其他，清空该集群详情定时器
      let interval
      creatingClusterIntervalData.forEach(item => {
        interval = item[cluster]
      })
      if (interval) {
        clearInterval(interval)
      }
      return
    }
    if (status === 4 && createStatus !== 4) {
      // createStatus 从 4 => 其他，清空该集群详情定时器
      let interval
      addingHostsIntervalData.forEach(item => {
        interval = item[cluster]
      })
      if (interval) {
        clearInterval(interval)
      }
    }
  }

  intervalLoadCreatingClusters = creatingClusters => {
    if (isEmpty(creatingClusters)) {
      return
    }
    const { creatingClusterInterval } = this.props
    const intervalArray = []
    creatingClusters.forEach(cluster => {
      this.loadClusterDetail(cluster, 1)
      intervalArray.push({
        [cluster]: setInterval(() => {
          this.loadClusterDetail(cluster, 1)
        }, UPDATE_INTERVAL),
      })
    })
    creatingClusterInterval(intervalArray)
  }

  clearIntervalLoadClusters = callback => {
    const { creatingClusterIntervalData } = this.props
    if (isEmpty(creatingClusterIntervalData)) {
      if (callback) {
        callback()
      }
      return
    }
    creatingClusterIntervalData.forEach(item => {
      const interval = Object.values(item)[0]
      clearInterval(interval)
    })
    if (callback) {
      callback()
    }
  }

  intervalLoadAddingHostsClusters = addingHostsClusters => {
    if (isEmpty(addingHostsClusters)) {
      return
    }
    const { addingHostsInterval } = this.props
    const intervalArray = []
    addingHostsClusters.forEach(cluster => {
      this.loadClusterDetail(cluster, 4)
      intervalArray.push({
        [cluster]: setInterval(() => {
          this.loadClusterDetail(cluster, 4)
        }, UPDATE_INTERVAL),
      })
    })
    addingHostsInterval(intervalArray)
  }

  clearAddingHostsInterval = callback => {
    const { addingHostsIntervalData } = this.props
    if (isEmpty(addingHostsIntervalData)) {
      if (callback) {
        callback()
      }
      return
    }
    addingHostsIntervalData.forEach(item => {
      const interval = Object.values(item)[0]
      clearInterval(interval)
    })
  }

  handleRetry = async () => {
    const {
      onCancel, restartFailedCluster, logClusterID, loadClusterList,
      loadLoginUserDetail, getProjectVisibleClusters, current, clusterDetail,
    } = this.props
    const createStatus = getDeepValue(clusterDetail, [ logClusterID, 'data', 'createStatus' ])
    this.setState({
      loading: true,
    })
    const query = {
      error_type: createStatus,
    }
    const res = await restartFailedCluster(logClusterID, query)
    if (res.error) {
      this.setState({
        loading: false,
      })
      notify.warn('重新创建失败')
      return
    }
    loadLoginUserDetail()
    getProjectVisibleClusters(current.space.namespace)
    await loadClusterList({ size: 100 }, {
      success: {
        func: result => {
          const creatingClusters = []
          const addingHostsClusters = []
          const clusters = result.data || []
          clusters.forEach(({ createStatus, clusterID }) => {
            if (createStatus === 1) {
              creatingClusters.push(clusterID)
            }
            if (createStatus === 4) {
              addingHostsClusters.push(clusterID)
            }
          })
          this.clearIntervalLoadClusters(() => this.intervalLoadCreatingClusters(creatingClusters))
          this.clearAddingHostsInterval(() =>
            this.intervalLoadAddingHostsClusters(addingHostsClusters))
        },
        isAsync: true,
      },
    })
    this.setState({
      loading: false,
    })
    notify.success('重新创建成功')
    onCancel()
  }

  renderFooter = () => {
    const { isCreating, onCancel } = this.props
    return [
      !isCreating && <Button type="primary" key="retry" onClick={this.handleRetry}>重新创建</Button>,
      <Button type="ghost" key="cancel" className="cancel-btn" onClick={onCancel}>关闭</Button>,
    ]
  }

  onLogsWebsocketSetup = async ws => {
    if (this.logRef) {
      this.logRef.clearLogs()
    }
    this.setState({
      logsLoading: true,
    })
    const { loginUser, current, failedData, getClusterDetail, logClusterID } = this.props
    this.ws = ws
    const { watchToken, namespace } = loginUser
    const { namespace: teamspace, cluster, podName } = failedData
    const watchAuthInfo = {
      accessToken: watchToken,
      namespace,
      type: 'log',
      name: podName,
      cluster,
    }
    if (current.space.namespace !== 'default') {
      watchAuthInfo.teamspace = teamspace || current.space.namespace
    }
    if (current.space.userName) {
      watchAuthInfo.onbehalfuser = current.space.userName
    }
    ws.send(JSON.stringify(watchAuthInfo))
    ws.onmessage = async event => {
      if (event.data === 'Log end') {
        await getClusterDetail(logClusterID)
        const { clusterDetail } = this.props
        const msg = this.renderStatusText(clusterDetail)
        this.setState({
          reconnect: false,
        })
        switch (clusterDetail.createStatus) {
          case 3:
          case 5:
            return notify.warn(msg)
          case 2:
            return notify.success(msg)
          default:
            return
        }
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

  renderStatusText = clusterDetail => {
    const { failedData } = this.props
    // 0 不需要展示 1.创建集群中 2.创建集群成功 3.创建集群失败 4.添加节点中 5.添加添加节点失败
    if (!clusterDetail || !failedData) {
      return
    }
    const { podName, podStatus, message } = failedData
    if (!podName) {
      return `【pod 创建失败】${message}`
    }
    if (podStatus === 'Pending') {
      switch (clusterDetail.createStatus) {
        case 1:
          return '集群创建任务启动中'
        case 4:
          return '集群添加节点任务启动中'
        default:
          return
      }
    }
    switch (clusterDetail.createStatus) {
      case 1:
        return '创建集群中'
      case 2:
        return '创建集群成功'
      case 3:
        return '创建集群失败'
      case 4:
        return '添加节点中'
      case 5:
        return '添加节点失败'
      default:
        return
    }
  }

  render() {
    const { wsconnect, loading, reconnect } = this.state
    const { visible, onCancel, loginUser, failedData, clusterDetail } = this.props
    const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:'
    return (
      <Modal
        title={`日志（${this.renderStatusText(clusterDetail)}）`}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleRetry}
        footer={this.renderFooter()}
        wrapClassName="create-cluster-log"
        width={800}
        confirmLoading={loading}
      >
        <TenxLogs
          ref={ref => (this.logRef = ref)}
          logs={[ <div className="logDetail">
            <span>loading ...</span>
          </div> ]}
        />
        {
          wsconnect && failedData && !isEmpty(failedData) && failedData.podName &&
          POD_STATUS.includes(failedData.podStatus) &&
          <TenxWebsocket
            url={`${protocol}//${loginUser.tenxApi.host}/spi/v2/watch`}
            onSetup={this.onLogsWebsocketSetup}
            reconnect={reconnect}
          />
        }
        <div className="hintColor tips">Tips：可根据日志提示在相应的节点上调试配置</div>
      </Modal>
    )
  }
}
