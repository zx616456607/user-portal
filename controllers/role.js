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
const logger     = require('../utils/logger.js').getLogger("role")
const markdown   = require('markdown-it')()

exports.create = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.createBy([],null,body)
  this.body = {
  	data: result
  }
}

exports.get = function* () {
	const loginUser = this.session.loginUser
	const id = this.params.id
	const query = this.query || {}
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.getBy([id],query)
  this.body = {
  	data: result
  }

}

exports.update = function* (){
	const loginUser = this.session.loginUser
	const body = this.request.body
	const id = this.params.id
	const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.update(id, body)
  this.body = {
  	data: result
  }
}

exports.remove = function* (){
  const loginUser = this.session.loginUser
  const id= this.params.id
  const query = this.query || {}
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.deleteBy([id],query)
  this.body = {
    data: result
  }

}

exports.addPermission = function* (){
  const loginUser = this.session.loginUser
  const id = this.params.id
  const body = this.request.body
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.createBy([id,'addPermission'],null,body)
  this.body = {
    data: result
  }
}

exports.removePermission = function* (){
  const loginUser = this.session.loginUser
  const id = this.params.id
  const body = this.request.body
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.createBy([id,'removePermission'],null,body)
  this.body = {
    data: result
  }
}

exports.list = function* (){
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.get(query)
  this.body = {
    data: result
  }
}

exports.existence = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.getBy([name,'existence'],null)
  this.body = {
    data: result
  }
}

exports.allowUpdate = function* (){
  const loginUser = this.session.loginUser
  const id = this.params.id
  const api = apiFactory.getRoleApi(loginUser)
  const result = yield api.getBy([id,'allowUpdate'],null)
  this.body = {
    data: result
  }
}


exports.usersAddRoles = function* () {
  const roleID = this.params.roleID
  const scope = this.params.scope
  const scopeID = this.params.scopeID
  const body = this.request.body;
  const api = apiFactory.getRoleApi(this.session.loginUser)
  const result = yield api.createBy([roleID,scope,scopeID],null,body)
  this.body = {
    data: result
  }
}

exports.usersLoseRoles = function* () {
  const roleID = this.params.roleID
  const scope = this.params.scope
  const scopeID = this.params.scopeID
  const body = this.request.body;
  const api = apiFactory.getRoleApi(this.session.loginUser)
  const result = yield api.createBy([roleID,scope,scopeID,'batch-delete'],null,body)
  this.body = {
    data: result
  }
}

exports.roleWithMembers = function* () {
  const roleID = this.params.roleID
  const scope = this.params.scope
  const scopeID = this.params.scopeID
  const api = apiFactory.getRoleApi(this.session.loginUser)
  const result = yield api.getBy([roleID,scope,scopeID,'users'],null)
  this.body = {
    data: result
  }
}

exports.getProjectDetail = function* (){
  const roleID = this.params.roleID
  const body = this.request.body
  const api = apiFactory.getRoleApi(this.session.loginUser)
  const result = yield api.getBy([roleID,'projects'],null)
  this.body = {
    data: result
  }
}