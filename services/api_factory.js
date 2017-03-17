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

exports.getApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
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