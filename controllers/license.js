/**
 * Licensed Materials - Property of tenxcloud.com

 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-09
 * @author meng yuan
 */

'use strict'
const apiFactory = require('../services/api_factory')
const indexService = require('../services')

exports.getLicense = function* () {
  const loginUser = this.session.loginUser
  const result = yield indexService.getLicense(loginUser)
  this.body = result
}