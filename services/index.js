/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index services for app
 * v0.1 - 2016-11-17
 * @author Zhangpc
 */
'use strict'

const crypto = require('crypto')
const i18n = require('i18next')
const _ = require('lodash')
const apiFactory = require('./api_factory')
const logger = require('../utils/logger').getLogger('services/index')
const constants = require('../constants')
const config = require('../configs')
const devOps = require('../configs/devops')
const constantsConfig = require('../configs/constants')
const USER_CURRENT_CONFIG = constants.USER_CURRENT_CONFIG

exports.setUserCurrentConfigCookie = function* (loginUser) {
  const method = 'setUserCurrentConfigCookie'
  // Get default clusters
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy(['default'])
  const clusters = result.clusters || [{}]
  const config = `default,default,${clusters[0].clusterID}`
  logger.info(method, `set current config cookie to: ${config}`)
  this.cookies.set(USER_CURRENT_CONFIG, config, {
    httpOnly: false
  })
}

/**
 * Add config into user for frontend
 *
 * @param {Object} user
 * @returns {Object}
 */
exports.addConfigsForFrontend = function (user) {
  const NODE_ENV = config.node_env
  const NODE_ENV_PROD = constantsConfig.NODE_ENV_PROD
  // Add api config
  const tenxApi = config.tenx_api
  user.tenxApi = {
    protocol: (NODE_ENV === NODE_ENV_PROD ? tenxApi.external_protocol : tenxApi.protocol),
    host: (NODE_ENV === NODE_ENV_PROD ? tenxApi.external_host : tenxApi.host),
  }
  // Add devOps config
  const cicdConfig = _.cloneDeep(devOps)
  if (NODE_ENV === NODE_ENV_PROD) {
    cicdConfig.protocol = cicdConfig.external_protocol
    cicdConfig.host = cicdConfig.external_host
  }
  delete cicdConfig.external_protocol
  delete cicdConfig.external_host
  user.cicdApi = cicdConfig
  // Add if email configed
  const emailConfig = config.mail_server
  user.emailConfiged = !!emailConfig.auth.pass
  user.proxy_type = constants.PROXY_TYPE
  return user
}

exports.checkWechatAccountIsExist = function* (body) {
  const api = apiFactory.getApi()
  try {
    let result = yield api.users.createBy(['login'], null, body)
    return {
      result,
      exist: true
    }
  } catch (error) {
    return {
      error,
      exist: false
    }
  }
}