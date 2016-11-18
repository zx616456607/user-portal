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

// const apiFactory = require('./api_factory')
const logger = require('../utils/logger').getLogger('middlewares')
const constants = require('../constants')
const USER_CURRENT_CONFIG = constants.USER_CURRENT_CONFIG
const indexService = require('./')

/**
 * Set user current config: teamspace, cluster
 * cookie[USER_CURRENT_CONFIG]=`${teamID},${space.namespace},${clusterID}`
 */
exports.setUserCurrentConfig = function* (next) {
  if (!this.session.loginUser) {
    return yield next
  }
  const method = 'setCurrent'
  let config = this.cookies.get(USER_CURRENT_CONFIG)
  if (config && config.split(',').length === 3) {
    logger.info(method, `skip set current config cookie`)
    return yield next
  }
  yield indexService.setUserCurrentConfigCookie.apply(this, [this.session.loginUser])
  yield next
}

/**
 * Auth user by session
 */
exports.auth = function* (next) {
  const loginUser = this.session.loginUser
  if (!loginUser) {
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
  let teamspace = this.headers.teamspace
  if (teamspace === 'default') {
    teamspace = null
  }
  this.session.loginUser.teamspace = teamspace
  yield next
}