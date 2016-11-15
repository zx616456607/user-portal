/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-14
 * @author shouhong.zhang
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getAppStatus = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  //const result = yield api.users.getBy([userID])
  appStatus = [
    {
      status: Running, 
      count: 50 
    },
    {
      status: Stopped, 
      count: 40 
    },
    {
      status: Operating, 
      count: 10 
    }
  ]
  this.body = {
    data: appStatus
  }
}

exports.getServiceStatus = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  //const result = yield api.users.getBy([userID])
  serviceStatus = [
    {
      status: Running, 
      count: 50 
    },
    {
      status: Stopped, 
      count: 50 
    },
    {
      status: Operating, 
      count: 50 
    },
    {
      status: Exception, 
      count: 50 
    }
  ]
  this.body = {
    data: serviceStatus 
  }
}

exports.getPodStatus = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  //const result = yield api.users.getBy([userID])
  podStatus = [
    {
      status: Running, 
      count: 50 
    },
    {
      status: Stopped, 
      count: 50 
    },
    {
      status: Operating, 
      count: 50 
    }
  ]
  this.body = {
    data: podStatus
  }
}
