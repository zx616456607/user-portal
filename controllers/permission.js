/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/*
 * Permission controller
 *
 * v0.1 - 2017-06-07
 * @author lijunbao
*/

'use strict'

const apiFactory = require('../services/api_factory')
const logger = require('../utils/logger.js').getLogger("permission")

exports.list = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.get(query)
  this.body = {
    data: result
  }
}
exports.get = function* () {
  const id = this.params.id
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy([id, 'retrieve'], query)
  this.body = {
    data: result
  }
}

exports.listWithCount = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy(['withCount'], query)
  this.body = {
    data: result
  }
}

exports.getAllDependent = function* () {
  const id = this.params.id
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy([id, 'dependent'], query)
  this.body = {
    data: result
  }
}

exports.listResourceOperations = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.getBy(['resource-operations'])
  this.body = {
    data: result
  }
}

exports.getAccessControlsOfRole = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.getBy(['access-controls'], this.query)
  this.body = {
    data: result
  }
}

exports.setAccessControlsForRole = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.createBy(['access-controls'], null, this.request.body)
  this.body = {
    data: result
  }
}

exports.removeAccessControlsFromRole = function* () {
  const api = apiFactory.getPermissionApi(this.session.loginUser)
  const result = yield api.deleteBy(['access-controls', this.params.ruleIds])
  this.body = {
    data: result
  }
}
