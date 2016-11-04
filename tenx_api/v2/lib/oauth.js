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

exports.getAuthHeader = function (authInfo) {
  if (!authInfo) {
    return {}
  }
  if (authInfo.type === 'basic') {
    return {
      "authorization": 'Basic ' + Buffer(authInfo.user + ':' + authInfo.password).toString('base64')
    }
  }
  const auth = {
    "username": authInfo.user,
    "authorization": `token ${authInfo.token}`,
  }
  if (authInfo.teamspace) {
    auth.teamspace = authInfo.teamspace
  }
  return auth
}