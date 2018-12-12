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
const registryConfigLoader = require('../registry/registryConfigLoader')
const parse = require('co-busboy')
const FormData = require('form-data')

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
  if (!results[0].listMeta) {
    results[0].listMeta = {}
  }
  this.body = {
    license,
    data: clusters,
    total: results[0].listMeta.total || 0,
    count: results[0].listMeta.size || 0
  }
}

exports.updateCluster = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body
  body.clusterName = FilterEmoji(body.clusterName)
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
      defaultClusterSum++
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

exports.createClusterByKubeConfig = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const stream = yield getFormData(this)
  const result = yield api.uploadFile(['add', 'kubeconfig'], null, stream, { headers: stream.getHeaders()})
  this.body = result
}

function* getFormData(ctx) {
  const formData = new FormData()
  const parts = parse(ctx, {
    autoFields: true,
    checkFile: function (fieldname, file, filename) {
      formData.append(fieldname, file, {
        filename: filename
      })
    },
    checkField: function (name, value) {
      formData.append(name, value)
    }
  })
  yield parts
  return formData
}

exports.autoCreateCluster = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy(['add', 'auto_create'], null, body)
  this.body = result
}

exports.autoCreateNode = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy(['add', 'auto_create', 'node'], null, body)
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
  reqArray.push(api.getBy([cluster, 'summary', 'static'], this.query))
  reqArray.push(api.getBy([cluster, 'summary', 'dynamic'], this.query))
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
exports.getNodes = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'nodes']);
  this.body = {
    cluster,
    data: result.data,
  }
}

exports.getNodesIngresses = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const spi = apiFactory.getApi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'nodes', 'ingresses']);
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
  const result = yield api.getBy([cluster, 'proxies'])
  this.body = {
    [cluster]: {
      data: result.data
    }
  }
}

exports.updateProxies = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.createBy([cluster, 'proxies'], null, this.request.body)
  this.body = {
    cluster,
    data: result.data
  }
}

exports.updateProxy = function* () {
  const cluster = this.params.cluster
  const groupID = this.params.groupID
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([cluster, 'proxies', 'groupID'], null, this.request.body)
  this.body = {
    cluster,
    data: result.data
  }
}

exports.setDefaultProxy = function* () {
  const cluster = this.params.cluster
  const groupID = this.params.groupID
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([cluster, 'proxies', groupID, 'as_default'])
  this.body = {
    cluster,
    data: result.data
  }
}

exports.getClusterNodeAddr = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'proxies', 'node_addr'])
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
    [cluster]: {
      data: result.data
    }
  }
}

exports.updateClusterPlugins = function* () {
  const cluster = this.params.cluster
  const pluginName = this.params.name
  const api = apiFactory.getK8sApi(this.session.loginUser)
  if (this.query.reset != undefined) {
    const result = yield api.updateBy([cluster, 'plugins', pluginName], {
      reset: this.query.reset
    })
    this.body = {
      data: result.data
    }
    return
  }
  const body = this.request.body
  if (body.cpu == undefined || body.memory == undefined || body.hostName == undefined) {
    const err = new Error('cpu, memory, hostName is require')
    err.status = 400
    throw err
  }
  const cpu = parseFloat(body.cpu) != 0 ? parseFloat(body.cpu) * 1000 : undefined
  const memory = parseInt(body.memory) != 0 ? parseInt(body.memory) : undefined
  const hostName = body.hostName != "" ? body.hostName : undefined
  let requestBody = {
    resourceRange: {
      limit: {
      },
      request: {
      }
    }
  }
  if (cpu) {
    requestBody.resourceRange.limit.cpu = requestBody.resourceRange.request.cpu = cpu
  }
  if (memory) {
    requestBody.resourceRange.limit.memory = requestBody.resourceRange.request.memory = memory
  }
  if (hostName) {
    requestBody.hostName = hostName
  }
  const result = yield api.updateBy([cluster, 'plugins', pluginName], null, requestBody)
  this.body = result
}


exports.createPlugins = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body || !body.template || !body.pluginName) {
    const err = new Error('template and pluginName is require')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const templateApi = apiFactory.getTemplateApi(loginUser)
  const templateResult = yield templateApi.getBy([body.template])
  let templateContent = templateResult.data.content
  if (!templateContent) {
    const err = new Error('Plugin template is null')
    err.status = 400
    throw err
  }
  templateContent = templateContent.replace(/\{\{registry\}\}/g, getRegistryURL())
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'plugins'], null, {
    cluster: cluster,
    pluginName: body.pluginName,
    template: templateContent
  })
  this.body = result
}

exports.batchStopPlugins = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body || !body.pluginNames || body.pluginNames.length == 0) {
    const err = new Error('pluginNames is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([cluster, 'plugins', 'batch-stop'], null, {
    pluginNames: body.pluginNames
  })
  this.body = result
}

exports.batchStartPlugins = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!body || !body.pluginNames || body.pluginNames.length == 0) {
    const err = new Error('pluginNames is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([cluster, 'plugins', 'batch-start'], null, {
    pluginNames: body.pluginNames
  })
  this.body = result
}


exports.batchDeletePlugins = function* () {
  const cluster = this.params.cluster
  const body = this.query.pluginNames
  if (!body) {
    const err = new Error('pluginNames is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([cluster, 'plugins', 'batch-delete'], null, {
    pluginNames: body.split(',')
  })
  this.body = result
}

exports.initPlugins = function* () {
  const names = ['elasticsearch-logging']
  const name = this.params.name
  const cluster = this.params.cluster
  if(names.indexOf(name) < 0) {
    const err = new Error('Not support plugin')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.createBy([cluster, 'plugins', name, 'init'], null, null)
  this.body = result
}

exports.getClusterNetworkMode = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'network'])
  this.body = result.data
}

function getRegistryURL() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    let url = registryConfigLoader.GetRegistryConfig().url
    if (url.indexOf('://') > 0) {
      url = url.split('://')[1]
    }
    return url
  }
  // Default registry url
  return "localhost"
}
function FilterEmoji(str) {
  var reg = /[^\u4e00-\u9fa5|\u0000-\u00ff|\u3002|\uFF1F|\uFF01|\uff0c|\u3001|\uff1b|\uff1a|\u3008-\u300f|\u2018|\u2019|\u201c|\u201d|\uff08|\uff09|\u2014|\u2026|\u2013|\uff0e]/g;
  str = str.replace(reg, '');
  return str
}

exports.FilterEmoji = FilterEmoji

exports.getKubeproxy = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([ cluster, 'kubeproxy' ])
  this.body = result.data
}

exports.updateKubeproxy = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([ cluster, 'kubeproxy' ], null, body)
  this.body = result
}

exports.setHarbor = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([ cluster, 'configs', 'harbor' ], null, body)
  this.body = result
}
exports.getRegisteredServiceList = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'daas', 'dubbo', 'services'])
  this.body = result
}

exports.getNodeDetail = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'nodes', name, 'drain', 'preliminary'])
  this.body = result
}
exports.nodeMaintain = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const name = this.params.name
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'nodes', name, 'drain'], null, body)
  this.body = result
}

exports.exitMaintain = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'nodes', name, 'uncordon'])
  this.body = result
}

exports.getNotMigratedCount = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'nodes', name, 'drain', 'podmetric'])
  this.body = result
}
