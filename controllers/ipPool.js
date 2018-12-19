/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * ipPool controller
 *
 * v0.1 - 2018-11-08
 * @author lvjunfeng
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getIPPoolList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const query = this.query
  const result = yield api.getBy([ cluster, 'pools' ], query)
  this.body = result
}

exports.createIPPool = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.createBy([cluster, 'pool' ], null, body)
  this.body = result
}

exports.deleteIPPool = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.createBy([ cluster, 'pool-delete' ], null, body)
  this.body = result
}

exports.getIPPoolExist = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const query = this.query
  const result = yield api.getBy([ cluster, 'is-pool-exist' ], query)
  this.body = result
}

exports.getIPPoolInUse = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const query = this.query
  const result = yield api.getBy([ cluster, 'is-pool-in-use' ], query)
  this.body = result
}
