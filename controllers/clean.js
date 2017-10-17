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
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.updateBy(['settings'], null, body)
  this.body = result
}

exports.getCleanerSettings = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.getBy(['settings'])
  this.body = result
}

exports.getSystemSettings = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.getBy(['settings', 'logs'])
  this.body = result
}

exports.closeLogsAutoClean = function* () {
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.createBy(['closer'], null, body)
  this.body = result
}

exports.getCleanerLogs = function* () {
  const query = this.query || {}
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.getBy(['logs'],query)
  this.body = result
}

exports.startCleanSystemLogs = function* () {
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.createBy(['logs'], null, body)
  this.body = result
}

exports.startCleanMonitor = function* () {
  const query = this.query || {}
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.updateBy(['monitor'], query, null)
  this.body = result
}

exports.getSystemCleanerLogs = function* () {
  const query = this.query || {}
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.createBy(['records'], query, body)
  this.body = result
}