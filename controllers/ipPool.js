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

exports.getMacvlanIPPoolList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const result = yield api.getBy([ cluster, 'networking', 'macvlan', 'ippools' ])
  this.body = result
}

exports.createMacvlanIPPool = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.createBy([cluster, 'networking', 'macvlan', 'ippools' ], null, body)
  this.body = result
}

exports.deleteMacvlanIPPool = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const name = this.params.name
  const result = yield api.deleteBy([ cluster, 'networking', 'macvlan', 'ippools', name ], null)
  this.body = result
}

// Assign
exports.getIPAssignment = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const query = this.query
  const result = yield api.getBy([ cluster, 'networking', 'macvlan', 'ipassignments' ], query)
  this.body = result
}

exports.createProjectPool = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.createBy([cluster, 'networking', 'macvlan', 'ipassignments' ], null, body)
  this.body = result
}

exports.deleteProjectPool = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const name = this.params.name
  const result = yield api.deleteBy([ cluster, 'networking', 'macvlan', 'ipassignments', name ], null)
  this.body = result
}

exports.getIPAllocations = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const query = this.query
  const result = yield api.getBy([ cluster, 'networking', 'macvlan', 'ipallocations' ], query)
  this.body = result
}
