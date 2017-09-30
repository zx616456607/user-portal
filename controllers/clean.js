/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * clean tool controller
 *
 * v0.1 - 2017-09-28
 * @author houxz
 */
'use strict'

const constants = require('../constants')
const apiFactory = require('../services/api_factory')

exports.startCleaner = function* () {
  const target = this.params.target
  const type = this.params.type
  const body = this.request.body
  if ((body.scope !== 0 && !body.scope) || !target || !type ) {
    const err = new Error('clean scope,target and type are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.cleaner.updateBy([target,type], null, body)
  this.body = result
}

exports.getCleanerSettings = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.cleaner.getBy(['settings'])
  this.body = result
}

exports.getCleanerLogs = function* () {
  const query = this.query || {}
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.cleaner.getBy(['logs'],query)
  this.body = result
}

exports.startCleanSystemLogs = function* () {
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.cleaner.createBy(['logs'], null, body)
  this.body = result
}

exports.startCleanMonitor = function* () {
  const query = this.query || {}
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.cleaner.updateBy(['monitor'], query, null)
  this.body = result
}

exports.getSystemCleanerLogs = function* () {
  const query = this.query || {}
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.cleaner.createBy(['records'], query, body)
  this.body = result
}