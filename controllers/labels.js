/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */

'use strict'

const apiFactory = require('../services/api_factory')

exports.getLabels = function* () {
  const loginUser = this.session.loginUser
  const target = this.query.target
  const api = apiFactory.getLabelsApi(loginUser)
  const result = yield api.getBy([], {target: target})
  this.body = result ? result.data : {}
}

exports.addLabels = function* () {
  const loginUser = this.session.loginUser
  const labels = this.request.body
  const api = apiFactory.getLabelsApi(loginUser)
  const result = yield api.createBy([], null, labels)
  this.body = result ? {data: result.data} : {}
}

exports.updateLabel = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id
  const label = this.request.body
  const api = apiFactory.getLabelsApi(loginUser)
  const result = yield api.updateBy([id], null, {
    key: label.key,
    value: label.value
  })
  this.body = result ? result.data : {}
}

exports.deleteLabel = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id
  const api = apiFactory.getLabelsApi(loginUser)
  const result = yield api.deleteBy([id])
  this.body = result ? result.data : {}
}