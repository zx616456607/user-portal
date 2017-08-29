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
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([clusterID, 'networkisolation'])
  this.body = result ? result.data : {}
}

exports.setIsolationRule = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const rule = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([clusterID, 'networkisolation'], null, rule)
  this.body = result ? result.data : {}
}

exports.restoreDefault = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([clusterID, 'networkisolation'])
  this.body = result ? result.data : {}
}
