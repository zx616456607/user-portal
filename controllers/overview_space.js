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

exports.getSpaceOperations = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["space-operations"])
  const data = result || {}
  this.body = {
    data
  }
}

exports.getSpaceTemplateStats = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["templates"])
  const data = result || {}
  this.body = {
    data
  }
}

exports.getSpaceWarnings = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["warnings"])
  const data = result || {}
  this.body = {
    data
  }
}