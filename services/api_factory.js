/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * API factory
 *
 * v0.1 - 2016-09-13
 * @author Zhangpc
 */
'use strict'
const tenxApi = require('../tenx_api/v2')
const config = require('../configs')
config.tenx_api = global.globalConfig.tenx_api
const devopsConfig = global.globalConfig.cicdConfig
const vmWrapConfig = global.globalConfig.vmWrapConfig
const registriyApi = require('../registry')
const aiopsConfig = global.globalConfig.aiopsConfig

////////////////////////////////////////////////////////////////////////////////////////////
// !! 调用以下函数时必须要将 `this.session.loginUser` 传过来，
// !! 因为调用 API 时会从 loginUser 中取到 ip 作为 `X-Forwarded-For`放到 headers 中转发给其他服务
////////////////////////////////////////////////////////////////////////////////////////////

exports.getApi = function (loginUser, timeout) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser,
    timeout
  }
  const api = new tenxApi(apiConfig)
  return api
}

exports.getK8sApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.clusters
}

exports.getMeshApi = function (loginUser) {
  const apiConfig = {
    protocol: config.mesh_api.protocol,
    host: config.mesh_api.host,
    version: config.mesh_api.version,
    auth: loginUser,
  }
  const api = new tenxApi(apiConfig)
  return api
}

/*
API factory to handle thirdparty docker registry integration
*/
exports.getManagedRegistryApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.registries
}

/*
API factory to handle application templates
*/
exports.getTemplateApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.templates
}

/*
API factory to handle DevOps service
*/
exports.getDevOpsApi = function (loginUser) {
  const apiConfig = {
    protocol: devopsConfig.protocol,
    host: devopsConfig.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.devops
}

/**
 * API factory to handle AIOps service
 */
exports.getAIOpsApi = function (loginUser) {
  const apiConfig = {
    protocol: aiopsConfig.protocol,
    host: aiopsConfig.host,
    version: aiopsConfig.apiVersion || 'v3',
    auth: loginUser,
  }
  const api = new tenxApi(apiConfig)
  return api.ai
}

exports.getRegistryApi = function (registryConfig) {
  const api = new tenxApi(registryConfig)
  return api.registries
}

exports.getSpi = function (loginUser, specifyConfig) {
  let _config = specifyConfig || config.tenx_api
  const spiConfig = {
    protocol: _config.protocol,
    host: _config.host,
    api_prefix: 'spi',
    auth: loginUser
  }
  const spi = new tenxApi(spiConfig)
  return spi
}

// Spi with tenxSysSign in header for payment etc.
exports.getTenxSysSignSpi = function (loginUser) {
  if (!loginUser) loginUser = {}
  const config = require('../configs')
  config.tenx_api = global.globalConfig.tenx_api
  const tenxSysSign = config.tenxSysSign
  loginUser[tenxSysSign.key] = tenxSysSign.value
  const spiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    api_prefix: 'spi',
    auth: loginUser
  }
  const spi = new tenxApi(spiConfig)
  return spi
}

exports.getRegistryApi = function () {
  const api = new registriyApi(this.session.loginUser)
  return api
}

exports.getLabelsApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.labels
}

exports.getOemInfoApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.oem
}

exports.getPermissionApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.permission
}

exports.getRoleApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.role
}

/*
API factory to handle VM wrap service
*/
exports.getVMWrapApi = function (loginUser) {
  const apiConfig = {
    protocol: vmWrapConfig.protocol,
    host: vmWrapConfig.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api
}
exports.getQuotaApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.resourcequota
}
