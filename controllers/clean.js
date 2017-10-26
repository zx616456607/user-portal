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
  const result = yield api.cleaner.updateBy(['cicd', 'settings'], null, body)
  this.body = result
}

exports.getCleanerSettings = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.getBy(['cicd', 'settings'])
  this.body = result
}

exports.getSystemSettings = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.getBy(['systemlog', 'settings'])
  this.body = result
}

exports.deleteLogsAutoClean = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.deleteBy(['systemlog', 'cron'], null)
  this.body = result
}

exports.getCleanerLogs = function* () {
  const query = this.query || {}
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.getBy(['cicd', 'logs'],query)
  this.body = result
}

exports.startCleanSystemLogs = function* () {
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const result = yield api.cleaner.createBy(['systemlog', 'clean'], null, body)
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
  const result = yield api.cleaner.createBy(['systemlog', 'records'], query, body)
  this.body = result
}

exports.deleteCleanLogs = function*(){
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser, 120000)
  const cicdCleanResult = yield api.cleaner.updateBy(['cicd', 'settings'], null, body)
  if (cicdCleanResult.statusCode != 200){
    this.body = cicdCleanResult
    return
  }
  const systemResult = yield api.cleaner.deleteBy(['systemlog','records'])
  this.body = systemResult
}