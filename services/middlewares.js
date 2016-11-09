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
 * cookie[USER_CURRENT_CONFIG]=`${teamID},${spaceID},${clusterID}`
 */
exports.setUserCurrentConfig = function* (next) {
  const method = 'setCurrent'
  let config = this.cookies.get(USER_CURRENT_CONFIG)
  console.log(`config--------------------------------`)
  console.log(config)
  if (config && config.split(',').length === 3) {
    logger.info(method, `skip set current config cookie`)
    return yield next
  }
  const loginUser = this.session.loginUser
  // const api = apiFactory.getApi(loginUser)
  // @Todo: get default clusters
  // const clusters = api.get()
  const clusters = [
    {
      "clusterID": "cce1c71ea85a5638b22c15d86c1f61df",
      "clusterName": "cce1c71ea85a5638b22c15d86c1f61df",
      "apiProtocol": "https",
      "apiHost": "192.168.1.93:6443",
      "apiToken": "c0d7rQicMtZJkeFllBaCZSMjfaCbASDV",
      "apiVersion": "v1",
      "description": "产品环境",
      "publicIPs": "[\"192.168.1.103\"]",
      "bindingDomains": "[\"test.tenxcloud.com\"]",
      "webTerminal": "t.tenxcloud.com",
      "creationTime": "2016-07-23T10:49:58+08:00"
    }
  ]
  config = `default,default,${clusters[0].clusterID}`
  logger.info(method, `set current config cookie to: ${config}`)
  this.cookies.set(USER_CURRENT_CONFIG, config, {
    httpOnly: false
  })
  yield next
}