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
      "Authorization": 'Basic ' + Buffer(authInfo.user + ':' + authInfo.password).toString('base64')
    }
  }
  return {
    "Username": authInfo.user,
    "Authorization": `token ${authInfo.token}`,
    "namespace": authInfo.namespace
  }
}