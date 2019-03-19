/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster node controller
 *
 * v0.1 - 2017-2-8
 * @author Gaojian
 */
'use strict'

const apiFactory = require('../services/api_factory')
const constants = require('../constants')
const isEmpty = require('lodash/isEmpty')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const DEFAULT_LICENSE = constants.DEFAULT_LICENSE

exports.getClusterNodes = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster

  const api = apiFactory.getApi(loginUser)
  const reqArray = []
  reqArray.push(api.clusters.getBy([cluster, 'nodes']))
  reqArray.push(api.licenses.getBy(["merged"]))
  const reqArrayResult = yield reqArray
  const clusters = reqArrayResult[0].data || []
  const license = reqArrayResult[1].data || DEFAULT_LICENSE
  if (!license.max_nodes || license.max_nodes < DEFAULT_LICENSE.max_nodes) {
    license.max_nodes = DEFAULT_LICENSE.max_nodes
  }
  if (!license.max_clusters || license.max_clusters < DEFAULT_LICENSE.max_clusters) {
    license.max_clusters = DEFAULT_LICENSE.max_clusters
  }
  const isMaintainingReqArr = []
  clusters.nodes.nodes.forEach(node => {
    node.objectMeta.labels = JSON.stringify(node.objectMeta.labels)
    const { objectMeta, schedulable } = node
    const { annotations } = objectMeta
    // 服务迁移中
    if (!schedulable && annotations.maintenance && (annotations.maintenance === 'true')) {
      isMaintainingReqArr.push(api.clusters.getBy([cluster, 'nodes', node.objectMeta.name, 'drain', 'podmetric']).then(result => {
        return Object.assign({}, result.data[node.objectMeta.name], { name: node.objectMeta.name })
      }))
    }
  })
  let isMaintainingResult
  if (!isEmpty(isMaintainingReqArr)) {
    isMaintainingResult = yield isMaintainingReqArr
  }
  if (!isEmpty(isMaintainingResult)) {
    clusters.nodes.nodes.forEach(node => {
      const currentResult = isMaintainingResult.filter(res => res.name === node.objectMeta.name)[0]
      if (currentResult) {
        let { current, total } = currentResult
        if (current < total && current !== 0) {
          node.objectMeta.annotations.maintainStatus = 'processing'
          node.objectMeta.annotations.current = current
          node.objectMeta.annotations.total = total
        }
      }
    })
  }
  this.body = {
    data: {
      clusters,
      license
    }
  }
}

exports.getClusterNodesMetric = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getApi(loginUser)
  const podList = this.query.pods
  const cpuBody = {
    targetType: 'node',
    type: 'cpu/usage_rate',
    source: 'prometheus'
  }
  const memoryBody = {
    targetType: 'node',
    type: 'memory/usage',
    source: 'prometheus'
  }
  const diskUsage = {
    targetType: 'node',
    type: 'disk/usage',
    source: 'prometheus'
  }
  const metricsReqArray = []
  metricsReqArray.push(api.clusters.getBy([cluster, 'metric', podList, 'metric', 'instant'], cpuBody))
  metricsReqArray.push(api.clusters.getBy([cluster, 'metric', podList, 'metric', 'instant'], memoryBody))
  metricsReqArray.push(api.clusters.getBy([cluster, 'metric', podList, 'metric', 'instant'], diskUsage))
  const metricsReqArrayResult = yield metricsReqArray
  const cpuMetric = metricsReqArrayResult[0].data
  const memoryMetric = metricsReqArrayResult[1].data
  const diskUsageMetric = metricsReqArrayResult[2].data
  this.body = {
    data: {
      cpuMetric,
      memoryMetric,
      diskUsageMetric,
    }
  }
}

exports.getResourceConsumption = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.getBy([cluster, 'nodes', 'resource-consumption'], query)
}

exports.changeNodeSchedule = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const schedulable = this.request.body

  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.createBy([cluster, 'nodes', node, 'schedule'], null, schedulable);

  this.status = result.code
  this.body = {
    data: result.data
  }
}

exports.deleteNode = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node

  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.deleteBy([cluster, 'nodes', node]);

  this.status = result.code
  this.body = {
    data: result.data
  }
}

exports.getKubectls = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'kubectls'])
  this.body = result.data
}

exports.getAddNodeCMD = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const spi = apiFactory.getApi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'nodes', 'add'])
  this.body = result.data
}
// cluster node detail pod list
exports.getPodlist = function* () {
  const cluster = this.params.cluster
  const node = this.params.node
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.getBy([cluster, 'nodes', node, 'podlist'])
  this.body = result.data
}
// host info
exports.getClustersInfo = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster,'nodes',node])
  if (result.data) {
    const maintainResult = yield api.getBy([cluster, 'nodes', node, 'drain', 'podmetric'])
    let { current, total } = maintainResult.data
    if (current < total && current !== 0) {
      result.data.node.objectMeta.annotations.maintainStatus = 'processing'
      result.data.node.objectMeta.annotations.current = current
      result.data.node.objectMeta.annotations.total = total
    }
  }
  this.body = result ? result.data : {}
}
//  host metrics
exports.getClustersMetrics = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const type = this.params.type
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  let cpuq = {
    type: 'cpu/usage_rate',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let memoryq = {
    type: 'memory/usage',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let re_rateq = {
    type: 'network/rx_rate',
    source: 'prometheus',
    start:query.start,
    end: query.end
  }
  let te_rateq = {
    type: 'network/tx_rate',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let te_disk_read = {
    type: 'disk/node_readio',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let te_disk_write = {
    type: 'disk/node_writeio',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let tcp_listen = {
    type: 'tcp/listen_state',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let tcp_est = {
    type: 'tcp/est_state',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let tcp_close_wait_state = {
    type: 'tcp/close_wait_state',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  let tcp_time_wait_state = {
    type: 'tcp/time_wait_state',
    source: 'prometheus',
    start: query.start,
    end: query.end
  }
  const reqArray = []
  // metrics cpu use
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'], cpuq))
  // metrics memory
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],memoryq))
  // metrics network/rx_rate
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],re_rateq))
  // metrics network/tx_rate
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],te_rateq))
  // metrics te_node_read
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],te_disk_read))
  // metrics te_node_write
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],te_disk_write))
  // metrics tcp_listen
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],tcp_listen))
  // metrics tcp_est
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],tcp_est))
  // metrics tcp_close_wait
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],tcp_close_wait_state))
  // metrics tcp_time_wait
  reqArray.push(api.getBy([cluster,'metric','nodes',node,'metrics'],tcp_time_wait_state))
  const results = yield reqArray
  this.body = {
    cpus: results[0][node],
    memory: results[1][node],
    rxRate: results[2][node],
    txRate: results[3][node],
    diskReadIo: results[4][node],
    diskWriteIo: results[5][node],
    tcpListen: results[6][node],
    tcpEst: results[7][node],
    tcpCloseWait: results[8][node],
    tcpTimeWait: results[9][node]
  }
}

const clusterTypeOpt = {
  'cpu': 'cpu/usage_rate',
  'memory': 'memory/usage',
  'rxRate': 'network/rx_rate',
  'txRate': 'network/tx_rate',
  'diskReadIo': 'disk/node_readio',
  'diskWriteIo': 'disk/node_writeio'
}

exports.loadClustersTypeMetrics = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  let newQuery = {
    source: 'prometheus',
    type: query.type,
    start: query.start
  }
  const result = yield api.getBy([cluster,'metric','nodes',node,'metrics'], newQuery)
  this.body = result
}

// host cpu || memory || rxrate || txrate || readio || writeio
exports.getClustersTypeMetrics = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const type = this.params.type
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  let cpuq = {
    source: 'influxdb',
    type: clusterTypeOpt[type],
    start: query.start
  }
  const result = yield api.getBy([cluster, 'metric', 'nodes', node, 'metrics'], cpuq)
  this.body = {
    [type]: result[node]
  }
}

// host cpu and memory used
exports.getClustersInstant = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  const reqArray = []
  let cpu = {
    targetType: 'node',
    type: 'cpu/usage_rate',
    source: 'prometheus'
  }
  let mem = {
    targetType: 'node',
    type: 'memory/usage',
    source: 'prometheus'
  }
  // metrics cpu use
  reqArray.push(api.getBy([cluster,'metric',node,'metric/instant'], cpu))
  reqArray.push(api.getBy([cluster,'metric',node,'metric/instant'], mem))
  const results = yield reqArray
  this.body = {
    cpus: results[0].data[node],
    memory:results[1].data[node],
  }
}

exports.getNodeLabels = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const raw = Object.getOwnPropertyNames(this.query).indexOf('raw') !== -1
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'nodes', node, 'labels'])
  const data = result ? result.data : {}
  this.body = raw ? {raw: JSON.stringify(data)} : data
}

exports.updateNodeLabels = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const labels = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'nodes', node, 'labels'], {}, labels)
  this.body = result ? result.data : {}
}

exports.getLabelSummary = function*() {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const nodeName = this.query.nodeName
  const api = apiFactory.getApi(loginUser)
  yield* editingView(cluster, api, this, nodeName)
}

function* editingView(cluster, api, ctx, nodeName) {
  const userDefinedLabels = yield getUserDefinedLabelsForEditingView(api.labels, cluster)
  let clusterNodeNames = null
  let labelsOfNodes = null
  if (nodeName) {
    labelsOfNodes = yield api.clusters.getBy([cluster, 'nodes', nodeName, 'labels'])
    labelsOfNodes = labelsOfNodes ? [{name: nodeName, labels: labelsOfNodes.data}] : []
  } else {
    labelsOfNodes = yield api.clusters.getBy([cluster, 'nodes', 'labels'])
    labelsOfNodes = labelsOfNodes ? labelsOfNodes.data : {}
  }
  // const labelsOfNodes = yield clusterNodeNames.map(nodeName => getLabelsOfNode(api.clusters, cluster, nodeName))
  let result = new Map(userDefinedLabels)
  let nodes = {}
  labelsOfNodes.forEach(node => {
    nodes = Object.assign(nodes, {
      [node.name]: JSON.stringify(node.labels)
    })
    Object.getOwnPropertyNames(node.labels).forEach(key => {
      const value = node.labels[key]
      const dk = distinctKey(key, value)
      if (!result.has(dk)) {
        result.set(dk, aLabel(key, value))
      }
      result.get(dk).targets.add(node.name)
    })
  })
  ctx.body = {
    nodes: nodes,
    summary: Array.from(result.values())
  }
}


function getUserDefinedLabelsForEditingView(api, clusterID) {
  return api.getBy([], {target: 'node', clusterID: clusterID}).then(result => {
    const labels = result ? result.data : {}
    const lookup = new Map(labels.map(label => [
      distinctKey(label.key, label.value),
      {
        id: label.id,
        key: label.key,
        value: label.value,
        createAt: label.createAt,
        clusterID: label.clusterID,
        isUserDefined: true,
        targets: new Set()
      }
    ]))
    return lookup
  })
}

function getClusterNodeNames(api, clusterID) {
  return api.getBy([clusterID, 'nodes']).then(result => {
    return result ? result.data.nodes.nodes.map(node => node.objectMeta.name) : []
  })
}

function getLabelsOfNode(api, clusterID, nodeName) {
  return api.getBy([clusterID, 'nodes', nodeName, 'labels']).then(result => {
    const labels = result ? result.data : {}
    return {
      name: nodeName,
      labels: labels
    }
  })
}

function aLabel(key, value) {
  return {
    key: key,
    value: value,
    isUserDefined: false,
    targets: new Set()
  }
}

function distinctKey(key, value) {
  return key + value
}

exports.getAffectedPods = function*() {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const labels = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, node, 'affectedpods'], null, labels)
  this.body = result ? result.data : {}
}
