/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OAuth tools
 *
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */
'use strict'

const config = require('../../../configs')

exports.getAuthHeader = function (authInfo) {
  if (!authInfo) {
    return {}
  }
  if (authInfo.type === 'basic') {
    return {
      "authorization": 'Basic ' + Buffer(authInfo.user + ':' + authInfo.password).toString('base64')
    }
  }
  const auth = {}
  if (authInfo.user) {
    auth.username = authInfo.user
  }
  if (authInfo.token) {
    auth.authorization = `token ${authInfo.token}`
  }
  if (authInfo.teamspace) {
    auth.teamspace = authInfo.teamspace
  }
  // TenxCloud System Signature for payment etc.
  const tenxSysSign = authInfo[config.tenxSysSign.key]
  if (tenxSysSign) {
    auth[config.tenxSysSign.key] = tenxSysSign
  }
  return auth
}