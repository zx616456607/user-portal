/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Middlewares for app
 * v0.1 - 2016-11-07
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('./api_factory')
const logger = require('../utils/logger').getLogger('middlewares')
const constants = require('../constants')
const USER_CURRENT_CONFIG = constants.USER_CURRENT_CONFIG

/**
 * Set user current config: teamspace, cluster
 * cookie[USER_CURRENT_CONFIG]=`${teamID},${space.namespace},${clusterID}`
 */
exports.setUserCurrentConfig = function* (next) {
  const method = 'setCurrent'
  let config = this.cookies.get(USER_CURRENT_CONFIG)
  if (config && config.split(',').length === 3) {
    logger.info(method, `skip set current config cookie`)
    return yield next
  }
  const loginUser = this.session.loginUser
  // Get default clusters
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy(['default'])
  const clusters = result.clusters || [{}]
  config = `default,default,${clusters[0].clusterID}`
  logger.info(method, `set current config cookie to: ${config}`)
  this.cookies.set(USER_CURRENT_CONFIG, config, {
    httpOnly: false
  })
  yield next
}

/**
 * Auth user by session
 */
exports.auth = function* (next) {
  const loginUser = this.session.loginUser
  if (!loginUser) {
    this.type = 'text'
    this.body = 'Login expired'
    switch (this.accepts('json', 'html')) {
      case 'html':
        this.status = 301
        this.redirect('/login')
        return
      default:
        let error = new Error('LOGIN_EXPIRED')
        error.status = 403
        throw error
    }
  }
  yield next
}
