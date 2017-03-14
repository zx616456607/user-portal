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
const config = require('../configs')
const devOps = require('../configs/devops')

exports.changeGlobalConfig = function* () {
  const cluster = this.params.cluster
  const type = this.params.type
  const entity = this.request.body
  entity.configDetail = JSON.stringify(entity.detail)
  if (type == 'cicd') {
    this.body = yield cicdConfig.bind(this, entity)
    return
  }
  if (type == 'registry') {
    this.body = yield registryConfig.bind(this, entity)
    return
  }
  if (type == 'mail') {
    this.body = yield mailConfig.bind(this, entity)
    return
  }
  if (type == 'rbd') {
    this.body = yield storageConfig.bind(this, entity)
    return
  }
}

function* cicdConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  let body = {}
  let cicdEntity = {
    configID: entity.cicdID,
    configDetail: JSON.stringify(entity.cicdDetail)
  }
  let apiServerEntity = {
    configID: entity.apiServerID,
    configDetail: JSON.stringify(entity.apiServerDetail)
  }
  if (entity.cicdID) {
    body.cicd = yield api.config.updateBy(['type', 'cicd'], null, cicdEntity)
  } else {
    body.cicd = yield api.config.createBy(['type', 'cicd'], null, cicdEntity)
  }
  if (entity.apiServerID) {
    body.apiServer = yield api.config.updateBy(['type', 'apiServer'], null, apiServerEntity)
  } else {
    body.apiServer = yield api.config.createBy(['type', 'apiServer'], null, apiServerEntity)
  }
  return body
}


function* registryConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'registry'
  if (entity.configID) {
    const response = yield api.config.updateBy(['type', type], null, entity)
    return response
  } else {
    const response = yield api.config.createBy(['type', type], null, entity)
    return response
  }
}

function* mailConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'mail'
  if (entity.configID) {
    const response = yield api.config.updateBy(['type', type], null, entity)
    return response
  } else {
    const response = yield api.config.createBy(['type', type], null, entity)
    return response
  }
}

function* storageConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'rbd'
  if (entity.configID) {
    const response = yield api.config.updateBy(['type', type], null, entity)
    return response
  } else {
    const response = yield api.config.createBy(['type', type], null, entity)
    return response
  }
}

exports.getGlobalConfig = function* () {
  const cluster = this.params.cluster
  const spi = apiFactory.getTenxSysSignSpi()
  const response = yield spi.config.get()
  this.status = response.code
  this.body = response
}
