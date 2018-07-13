/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * DNS Record controller
 *
 * v0.1 - 2018-7-10
 * @author lvjunfeng
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.createDnsItem = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.createBy([cluster, 'endpoints' ], null, body)
  this.body = result
}

exports.getDnsList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const result = yield api.getBy([ cluster, 'endpoints' ])
  this.body = result
}

exports.getDnsItemDetail = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const name = this.params.name
  const result = yield api.getBy([ cluster, 'endpoints', name ])
  this.body = result
}

exports.updataDnsItem = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.updateBy([ cluster, 'endpoints' ], null, body)
  this.body = result
}

exports.deleteDnsItem = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const name = this.params.name
  const result = yield api.deleteBy([ cluster, 'endpoints', name ], null, )
  this.body = result
}



