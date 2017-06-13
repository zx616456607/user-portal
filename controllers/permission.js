/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/*
 * Permission controller
 *
 * v0.1 - 2017-06-07
 * @author lijunbao
*/

'use strict'

const apiFactory = require('../services/api_factory')
const logger     = require('../utils/logger.js').getLogger("permission")
const markdown   = require('markdown-it')()

exports.list = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.get(query)
  this.body = {
    data: result
  }
}
exports.get = function* (){
  const id = this.params.id
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy([id,'retrieve'],query)
  this.body = {
  	data: result
  }
}

exports.listPermission = function* (){
	const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy(['permission'],query)
  this.body = {
  	data: result
  }
}

exports.getPermission = function* (){
	const id = this.params.id
	const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy(['permission',id,'retrieve'],query)
  this.body = {
  	data: result
  }
}

exports.getAllDependent = function* (){
	const id = this.params.id
	const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getPermissionApi(loginUser)
  const result = yield api.getBy([id,'dependent'],query)
  this.body = {
  	data: result
  }
}