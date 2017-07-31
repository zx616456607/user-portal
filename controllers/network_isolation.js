/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */

'use strict'

const apiFactory = require('../services/api_factory')

exports.getCurrentSetting = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const namespace = this.params.namespace
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([clusterID, 'namespaces', namespace, 'networkisolation'])
  this.body = result ? result.data : {}
}

exports.setIsolationRule = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const namespace = this.params.namespace
  const rule = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([clusterID, 'namespaces', namespace, 'networkisolation'], null, rule)
  this.body = result ? result.data : {}
}

exports.restoreDefault = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const namespace = this.params.namespace
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([clusterID, 'namespaces', namespace, 'networkisolation'])
  this.body = result ? result.data : {}
}
