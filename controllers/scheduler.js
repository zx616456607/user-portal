/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * scheduler controller
 *
 * v0.1 -
 * @author
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.addServiceTag = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const service = this.params.service
  const body = this.request.body
  const result = yield api.createBy([cluster, 'services', service, 'labels' ], null, body)
  this.body = result
}

exports.getAllServiceTag = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const body = this.request.body
  const result = yield api.getBy([ cluster, 'services' ], null, body)
  this.body = result
}

exports.updataServiceTag = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const service = this.params.service
  const body = this.request.body
  const result = yield api.updateBy([cluster, 'services', service, 'labels' ], null, body)
  this.body = result
}

exports.delateServiceTag = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const service = this.params.service
  const labels = this.params.labels
  const result = yield api.deleteBy([cluster, 'services', service, 'labels', labels], null, labels)
  this.body = result
}



