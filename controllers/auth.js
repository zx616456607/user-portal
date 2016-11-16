/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Auth controller
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
*/
'use strict'
const apiFactory = require('../services/api_factory')
const logger = require('../utils/logger').getLogger('controllers/auth')

exports.verifyUser = function* () {
  const body = this.request.body
  if (!body || (!body.username && !body.email) || !body.password) {
    const err = new Error('username(email) and password are required.')
    err.status = 400
    throw err
  }
  const data = {
    password: body.password,
  }
  if (body.username) {
    data.username = body.username
  }
  if (body.email) {
    data.email = body.email
  }
  const spi = apiFactory.getSpi(this.session.loginUser)
  this.result = yield spi.users.createBy(['verify'], null, data)
}