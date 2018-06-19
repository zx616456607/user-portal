/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * APM controller
 *
 * v0.1 - 2017-09-12
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getModelsets = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getAIOpsApi(loginUser)

  const result = yield api.getBy([ 'clusters', cluster, 'modelsets' ])
  this.body = result
}
