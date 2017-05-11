/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster manage controller
 *
 * v0.1 - 2016-11-12
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')
const constants = require('../constants')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const NO_CLUSTER_FLAG = constants.NO_CLUSTER_FLAG
const DEFAULT_CLUSTER_MARK = constants.DEFAULT_CLUSTER_MARK
const DEFAULT_LICENSE = constants.DEFAULT_LICENSE

exports.getClusters = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let filter = query.filter
  let sort = query.sort ? query.sort : 'a,creationTime'
  if (isNaN(page) || page < DEFAULT_PAGE) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  let from = size * (page - 1)
  if (size == -1) {
    from == -1
  }
  let queryObj = { from, size, sort }
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (filter) {
    queryObj.filter = filter
  }
  const reqArray = []
  const k8sApi = apiFactory.getK8sApi(loginUser)
  const api = apiFactory.getApi(loginUser)
  reqArray.push(k8sApi.get(queryObj))
  reqArray.push(api.licenses.getBy(["merged"]))
  const results = yield reqArray
  const clusters = results[0].clusters || []
  if (clusters.length > 0) {
    delete this.session.loginUser[NO_CLUSTER_FLAG]
  }
  const license = results[1].data || DEFAULT_LICENSE
  if (!license.max_nodes || license.max_nodes < DEFAULT_LICENSE.max_nodes) {
    license.max_nodes = DEFAULT_LICENSE.max_nodes
  }
  if (!license.max_clusters || license.max_clusters < DEFAULT_LICENSE.max_clusters) {
    license.max_clusters = DEFAULT_LICENSE.max_clusters
  }
  this.body = {
    license,
    data: clusters,
    total: results[0].listMeta.total,
    count: results[0].listMeta.size
  }
}

exports.updateCluster = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body
  const result = yield api.update(cluster, body)
  this.body = result
}

exports.updateConfigs = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body
  const result = yield api.updateBy([cluster, 'configs'], null, body)
  this.body = result
}

exports.deleteCluster = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  // Check all cluster first
  const clustersResult = yield api.get()
  const clusters = clustersResult.clusters || []
  let defaultClusterSum = 0
  let isCurrentClusterDefalut = false
  clusters.map(cluster => {
    if (cluster.isDefault === DEFAULT_CLUSTER_MARK) {
      defaultClusterSum ++
      if (cluster.clusterID === clusterID) {
        isCurrentClusterDefalut = true
      }
    }
  })
  if (defaultClusterSum === 1 && isCurrentClusterDefalut) {
    throw new Error('不能删除该集群，该集群为首个添加的集群，已授权为企业内全部用户使用的集群；')
    return
  }
  const result = yield api.delete(clusterID)
  this.body = result
}

exports.createCluster = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body
  const result = yield api.createBy(['add'], null, body)
  if (body.isDefault === DEFAULT_CLUSTER_MARK) {
    delete this.session.loginUser[NO_CLUSTER_FLAG]
  }
  this.body = result
}

exports.getClusterSummary = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const reqArray = []
  const resData = {
    static: {},
    dynamic: {}
  }
  reqArray.push(api.getBy([cluster, 'summary', 'static']))
  reqArray.push(api.getBy([cluster, 'summary', 'dynamic']))
  try {
    const results = yield reqArray
    resData.static = results[0].data
    resData.dynamic = results[1].data
  } catch (error) {
    // Catch error here
  }
  this.body = resData
}

// For bind node when create service(lite only)
exports.getNodes = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'nodes']);
  this.body = {
    cluster,
    data: result.data,
  }
}

exports.getAddClusterCMD = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.getBy(['add'])
  this.body = result.data
}

exports.getProxy = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'proxy'])
  this.body = {
    [cluster]: {
      data: result.data
    }
  }
}

exports.updateProxy = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.createBy([cluster, 'proxy', 'update'], null, this.request.body)
  this.body = {
    cluster,
    data: result.data
  }
}

exports.getClusterNodeAddr = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'proxy', 'node_addr'])
  this.body = {
    cluster,
    data: result.data
  }
}

exports.getClusterPlugins = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'plugins'])
  this.body = {
    cluster,
    data: result.data
  }
}

exports.updateClusterPlugins = function* () {
  const cluster = this.params.cluster
  const pluginName = this.params.name
  const api = apiFactory.getK8sApi(this.session.loginUser)
  if(this.query.reset != undefined) {
    const result = yield api.updateBy([cluster, 'plugins', pluginName], {
      reset: this.query.reset
    })
    this.body = {
      data: result.data
    }
    return
  }
  const body = this.request.body
  if(!body.cpu || !body.memory) {
    const err = new Error('cpu, memory, hostName is require')
    err.status = 400
    throw err
  }
  const cpu = parseFloat(body.cpu) * 1000
  const memory = parseInt(body.memory)
  const result = yield api.updateBy([cluster, 'plugins', pluginName], null, {
    limit: {
      cpu,
      memory
    },
    request: {
      cpu,
      memory
    },
    hostName: body.hostName
  })
  this.body = result
}
