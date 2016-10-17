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

exports.getK8sApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.clusters
}

exports.getRegistryApi = function (registryConfig) {
  const api = new tenxApi(registryConfig)
  return api.registries
}

exports.getSpi = function (loginUser) {
  const spiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    api_prefix: 'spi',
    auth: loginUser
  }
  const spi = new tenxApi(spiConfig)
  return spi
}