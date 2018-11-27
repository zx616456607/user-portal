/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster AutoScaler controller
 *
 * v0.1 - 2018-04-08
 * @author Rensw
 */
'use strict'
const yaml = require('js-yaml')
const apiFactory = require('../services/api_factory')
const Deployment = require('../kubernetes/objects/deployment')
const Service = require('../kubernetes/objects/service')
const constants = require('../constants')
const portHelper = require('./port_helper')

exports.getAnnouncements = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const query = this.query
  query.filter = query.filter ? decodeURIComponent(query.filter) : ''
  this.body = yield api.workorders.getBy(['announcements' ], query)
}

exports.getAnnouncement = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id
  const api = apiFactory.getApi(loginUser)
  const query = this.query
  this.body = yield api.workorders.getBy(['announcements', id ], query)
}

exports.createAnnouncement = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body

  const result = yield api.workorders.createBy([ 'announcements' ], null, body)
  this.body = result
}

exports.deleteAnnouncement = function *() {
  const id = this.params.id
  const loginUser = this.session.loginUser

  const api = apiFactory.getApi(loginUser)
  const result = yield api.workorders.deleteBy(['announcements', id])
  this.body = {
    result
  }
}

exports.getWorkOrderList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const query = this.query
  query.filter = query.filter ? decodeURIComponent(query.filter) : ''
  this.body = yield api.workorders.getBy([], query)
}

exports.getWorkOrderDetails = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id
  const api = apiFactory.getApi(loginUser)
  const query = this.query
  this.body = yield api.workorders.getBy([ id ], query)
}

exports.getWorkOrderMessages = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id
  const api = apiFactory.getApi(loginUser)
  const query = this.query
  this.body = yield api.workorders.getBy([ id, 'messages' ], query)
}



exports.createWorkOrder = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body

  const result = yield api.workorders.createBy([], null, body)
  this.body = result
}

exports.addWorkOrderMessages = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const id = this.params.id

  const result = yield api.workorders.createBy([ id, 'messages'  ], null, body)
  this.body = result
}


exports.changeWorkOrderStatus = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const id = this.params.id
  const body = this.request.body

  const result = yield api.workorders.updateBy([ id ], null, body)
  this.body = result
}

exports.delWorkOrder = function *() {
  const id = this.params.id
  const loginUser = this.session.loginUser

  const api = apiFactory.getApi(loginUser)
  const result = yield api.workorders.deleteBy([ id ])
  this.body = {
    result
  }
}
