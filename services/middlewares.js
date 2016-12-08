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
  this.session.loginUser = { user: 'mengyuan',
  id: 397,
  namespace: 'mengyuan',
  email: 'mengyuan@tenxcloud.com',
  phone: '',
  token: 'vdarbhiorastaietwkulcssyzvsfmyscauiosusmybpzazde',
  role: 1,
  balance: 0,
  tenxApi: { protocol: 'http', host: '192.168.1.103:48000' },
  cicdApi:
   { protocol: 'http',
     host: '192.168.1.103:38090',
     statusPath: '/stagebuild/status',
     logPath: '/stagebuild/log' },
  watchToken: '2deb73077e4566a8084abde1a55031ce',
  teamspace: null }
  const loginUser = this.session.loginUser
  if (!loginUser) {
    let redirectUrl = '/login'
    let requestUrl = this.request.url
    if (requestUrl.indexOf(redirectUrl) < 0 && requestUrl !== '/') {
      redirectUrl += `?redirect=${requestUrl}`
    }
    switch (this.accepts('json', 'html')) {
      case 'html':
        this.status = 302
        this.redirect(redirectUrl)
        return
      default:
        this.status = 401
        this.body = {
          message: 'LOGIN_EXPIRED'
        }
        return
    }
  }
  let teamspace = this.headers.teamspace
  if (teamspace === 'default') {
    teamspace = null
  }
  this.session.loginUser.teamspace = teamspace
  yield next
}