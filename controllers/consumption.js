/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App manage controller
 *
 * v0.1 - 2016-12-07
 * @author mengyuan
 */

'use strict'

const apiFactory = require('../services/api_factory')

exports.getDetail = function* () {      
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.consumptions.getBy(['detail'], this.query)
  this.body = {
    data: result.data
  }
}

exports.getTrend = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.consumptions.getBy(['trend'])
  this.body = {
    data: result.data
  }
}