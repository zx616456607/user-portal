/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * sysServiceManage controller
 *
 * v0.1 - 2018-12-26
 * @author songsz
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getServiceList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const query = this.query
  this.body = yield api.getBy([ cluster, 'services', 'system' ], query)
}

exports.getServiceLogs = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const { cluster, service } = this.params
  this.body = yield  api.getBy([ cluster, 'logs', 'instances', service, 'logs' ], this.query)
}
