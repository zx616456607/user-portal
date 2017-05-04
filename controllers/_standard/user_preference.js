/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * User preference (upgrade): for Public Cloud Only
 *
 * v0.1 - 2016-12-24
 * @author Zhangpc
*/
'use strict'

const apiFactory = require('../../services/api_factory')
const logger = require('../../utils/logger').getLogger('wechat_pay')

exports.upgradeOrRenewalsEdition = function* () {
  const method = 'upgradeOrRenewalsEdition'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getTenxSysSignSpi(loginUser)
  const body = this.request.body
  const result = yield spi['user-preference'].createBy(['edition'], null, body)
  this.body = result
}

exports.getEdition = function* () {
  const method = 'getEdition'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getTenxSysSignSpi(loginUser)
  const query = this.query
  const result = yield spi['user-preference'].getBy(['edition'], query)
  this.body = result.data
}