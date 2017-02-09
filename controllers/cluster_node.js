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

exports.getClusterNodes = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  
  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.getBy([cluster, 'nodes']);
  const clusters = result.data || []
  
  this.status = result.code
  this.body = {
    data: clusters,
  }
}

exports.changeNodeSchedule = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  
  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.createBy([cluster, 'nodes', node, 'schedule']);
  
  this.status = result.code
}

exports.deleteNode = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  
  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.deleteBy([cluster, 'nodes', node]);
  
  this.status = result.code
}