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
  let cpuMetric
  let memoryMetric
  try {
    let podList = [];
    clusters.nodes.nodes.map((node) => {
      podList.push(node.objectMeta.name);
    });
    let cpuBody = {
      targetType: 'node',
      type: 'cpu/usage_rate',
      source: 'prometheus'
    }
    let memoryBody = {
      targetType: 'node',
      type: 'memory/usage',
      source: 'prometheus'
    }
    const metricsReqArray = []
    metricsReqArray.push(api.clusters.getBy([cluster, 'metric', podList, 'metric', 'instant'], cpuBody))
    metricsReqArray.push(api.clusters.getBy([cluster, 'metric', podList, 'metric', 'instant'], memoryBody))
    const metricsReqArrayResult = yield metricsReqArray
    cpuMetric = metricsReqArrayResult[0].data
    memoryMetric = metricsReqArrayResult[1].data
  } catch (error) {
    // Catch error for show node list
  }

  this.body = {
    data: {
      clusters,
      cpuMetric,
      memoryMetric,
      license
    }
  }
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
    source: 'prometheus',
    type: 'cpu/usage_rate',
    start: query.start
  }
  let memoryq = {
    source: 'prometheus',
    type: 'memory/usage',
    start: query.start
  }
  let re_rateq = {
    source: 'prometheus',
    type: 'network/rx_rate',
    start:query.start
  }
  let te_rateq = {
    source: 'prometheus',
    type: 'network/tx_rate',
    start: query.start
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

  const results = yield reqArray
  this.body = {
    cpus: results[0][node],
    memory: results[1][node],
    rxRate: results[2][node],
    txRate: results[3][node]
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
  reqArray.push(api.getBy([cluster,node,'metric/instant'], cpu))
  reqArray.push(api.getBy([cluster,node,'metric/instant'], mem))
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
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'nodes', node, 'labels'])
  this.body = result ? result.data : {}
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
  if (nodeName) {
    clusterNodeNames = [nodeName]
  } else {
    clusterNodeNames = yield getClusterNodeNames(api.clusters, cluster)
  }
  const labelsOfNodes = yield clusterNodeNames.map(nodeName => getLabelsOfNode(api.clusters, cluster, nodeName))
  let result = new Map(userDefinedLabels)
  let nodes = {}
  labelsOfNodes.forEach(node => {
    nodes = Object.assign(nodes, {
      [node.name]: node.labels
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
