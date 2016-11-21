/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getClusterOperations = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  let queryObj = { cluster}
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["operations"], queryObj)
  const data = result || {}
  this.body = {
    data
  }
}