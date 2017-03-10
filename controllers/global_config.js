/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Setting manage controller
 *
 * v0.1 - 2017-03-09
 * @author Yangyubiao
 */

'use strict'

const apiFactory = require('../services/api_factory.js')

exports.changeGlobalConfig = function* () {
  const cluster = this.params.cluster
  const type = this.params.type
  const entity = this.request.body
  entity.configDetail = JSON.stringify(entity.detail)
  const api = apiFactory.getApi(this.session.loginUser)
  if (entity.configID) {
    const response = yield api.config.updateBy(['type', type], null, entity)
    this.status = response.code
    this.body = response
  } else {
    const response = yield api.config.createBy(['cluster', cluster, 'type', type], null, entity)
    this.status = response.code
    this.body = response
  }
}

exports.getGlobalConfig = function* () {
  const cluster = this.params.cluster
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.config.getBy(['cluster', cluster])
  this.status = response.code
  this.body = response
}
