/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Database cache controller
 *
 * v0.1 - 2016-11-01
 * @author GaoJian
 */
'use strict'
const Service = require('../kubernetes/objects/service')
const apiFactory = require('../services/api_factory')

exports.getOperationAuditLog = function* () {
  const reqBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.audits.createBy(['logs'], null, reqBody);
  this.body = {
    logs: result.data
  }
}

exports.getSearchLog = function* () {
  const cluster = this.params.cluster
  const instances = this.params.instances
  const reqBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'instances', instances, 'logs'], null, reqBody);
  this.body = {
    logs: result.data
  }
}
