/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Middleware center controller
 *
 *
 * @author zhangxuan
 * @date 2018-09-11
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getAppClassifies = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appcenters.getBy(['groups'])
  this.body = result
}

exports.getApps = function* () {
  const query = this.request.query
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appcenters.getBy(null, query)
  this.body = result
}

exports.deployApp = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'appcenters'],null, body)
  this.body = result
}

exports.checkAppNameExist = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'appcenters', name, 'exist'])
  this.body = result
}
