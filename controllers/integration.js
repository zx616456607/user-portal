/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Integration controller
 *
 * v0.1 - 2016-11-24
 * @author GaoJian
 */
'use strict'
const Service = require('../kubernetes/objects/service')
const apiFactory = require('../services/api_factory')

exports.getAllIntegrations = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.getBy(['']);
  this.body = {
    result,
  }
}

