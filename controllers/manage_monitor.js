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
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy(['audits', 'logs'], null, body);
  this.body = {
    logs: result,
  }
}

