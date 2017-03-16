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
const url = require('url')
const config = require('../configs')
const devOps = require('../configs/devops')

exports.changeGlobalConfig = function* () {
  const cluster = this.params.cluster
  const type = this.params.type
  const entity = this.request.body
  // entity.configDetail = JSON.stringify(entity.detail)
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
    configDetail: JSON.stringify({
      external_protocol: entity.cicdDetail.protocol,
      external_host: entity.cicdDetail.url,
      statusPath: devOps.statusPath,
      logPath: devOps.logPath,
      host: devOps.host,
      protocol: devOps.protocol
    })
  }
  let apiHost = entity.apiServerDetail.url
  let urlObject = url.parse(apiHost)
  apiHost = urlObject.host
  let protocol = urlObject.protocol.replace(':', '')
  let apiServerEntity = {
    configID: entity.apiServerID,
    configDetail: JSON.stringify({
      protocol: config.tenx_api.protocol,
      host: config.tenx_api.host,
      external_protocol: protocol,
      external_host: apiHost
    })
  }
  if (entity.cicdID) {
    body.cicd = yield api.configs.updateBy(['cicd'], null, cicdEntity)
  } else {
    body.cicd = yield api.configs.createBy(['cicd'], null, cicdEntity)
  }
  if (entity.apiServerID) {
    body.apiServer = yield api.configs.updateBy(['apiServer'], null, apiServerEntity)
  } else {
    body.apiServer = yield api.configs.createBy(['apiServer'], null, apiServerEntity)
  }
  return body
}


function* registryConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'registry'
  const urlObject = url.parse(entity.detail.host)
  entity.configDetail = JSON.stringify({
    protocol: urlObject.protocol.replace(':', ''),
    host: urlObject.host,
    port: urlObject.port,
    v2AuthServer: entity.detail.v2AuthServer,
    v2Server: entity.detail.v2Server
  })
  let response
  if (entity.configID) {
    response = yield api.configs.updateBy([type], null, entity)
  } else {
    response = yield api.configs.createBy([type], null, entity)
  }
  return response
}

function* mailConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'mail'
  entity.configDetail = JSON.stringify({
    secure: true,
    senderMail: entity.detail.senderMail,
    senderPassword: entity.detail.senderPassword,
    mailServer: entity.detail.mailServer,
    service_mail: entity.detail.mailServer,
  })
  let response
  if (entity.configID) {
    response = yield api.configs.updateBy([type], null, entity)
  } else {
    response = yield api.configs.createBy([type], null, entity)
  }
  return response
}

function* storageConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'rbd'
  entity.configDetail = JSON.stringify(entity.detail)
  let response
  if (entity.configID) {
    response = yield api.configs.updateBy([type], null, entity)
  } else {
    response = yield api.configs.createBy([type], null, entity)
  }
  return response
}

exports.getGlobalConfig = function* () {
  const cluster = this.params.cluster
  const spi = apiFactory.getTenxSysSignSpi()
  const response = yield spi.configs.get()
  this.status = response.code
  this.body = response
}
