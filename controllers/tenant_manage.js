/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Tenant controller
 *
 * v0.1 - 2017-08-01
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getTenantOverview = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)

  const result = yield api.users.getBy([ 'rentersum' ])
  this.body = result
}