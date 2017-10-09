/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * quota controller
 *
 * v0.1 - 2017-9-25
 * @author Zhaoyb
 */
'use strict'
const apiFactory = require('../services/api_factory')

exports.clusterList = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const query = this.query || {}
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'resourcequota'], query)
  this.body = result
}
exports.clusterGet = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const query = this.query || {}
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'resourcequota', 'inuse'], query)
  this.body = result
}

exports.clusterPut = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'resourcequota'], null, body)
  this.body = result
}

exports.list = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const api = apiFactory.getQuotaApi(loginUser)
  const result = yield api.getBy(['inuse'], query)
  this.body = result
}

exports.get = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const api = apiFactory.getQuotaApi(loginUser)
  const result = yield api.get(query)
  this.body = result
}

exports.update = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getQuotaApi(loginUser)
  const result = yield api.update(null, body)
  this.body = result
}
