/**
 * Licensed Materials - Property of tenxcloud.com

 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-02
 * @author meng yuan
 */

'use strict'
const qs = require('querystring')
const apiFactory = require('../services/api_factory')
const config = require('../configs')

// get namespace and token from session
exports.getTokenInfo = function* () {
  this.body = {
    username: this.session.loginUser.user,
    token: this.session.loginUser.token,
  }
}

exports.authJWT = function* () {
  const loginUser = this.session.loginUser
  const redirect = this.query.redirect
  const userquery = this.query.userquery
  const api = apiFactory.getApi(loginUser)
  const result = yield api.auth.get()
  if (!redirect) {
    this.body = result
    return
  }
  const query = {
    jwt: result.data.token,
    authUrl: config.url + this.path,
  }
  this.redirect(`${redirect}?${qs.stringify(query)}&${userquery}`)
}
