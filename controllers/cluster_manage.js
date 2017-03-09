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

exports.getClusters = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let filter = query.filter
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
  let queryObj = { from, size }
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (filter) {
    queryObj.filter = filter
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.get(queryObj)
  const clusters = result.clusters || []
  this.body = {
    data: clusters,
    total: result.listMeta.total,
    count: result.listMeta.size
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

exports.deleteCluster = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.delete(cluster)
  this.body = result
}

exports.createCluster = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body
  const result = yield api.createBy(['add'], null, body)
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