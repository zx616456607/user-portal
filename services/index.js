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

const apiFactory = require('./api_factory')
const logger = require('../utils/logger').getLogger('services/index')
const constants = require('../constants')
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