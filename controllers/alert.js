/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author mengyuan
 */
'use strict'

const apiFactory = require('../services/api_factory')
const email = require('../utils/email')
const logger     = require('../utils/logger.js').getLogger('alert')

exports.getRecordFilters = function* () {
  if (!this.query || this.query.cluster == undefined) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const query = {
    cluster: this.query.cluster
  }
  const result = yield api.alerts.getBy(["record-filters"], query)
  this.body = result
}

exports.getRecords = function* () {
  let query = {}
  if (this.query) {
    query.cluster = this.query.cluster || ''
    query.strategyName = this.query.strategyName || ''
    query.targetType = this.query.targetType != undefined ? this.query.targetType : ''
    query.targetName = this.query.targetName
    query.status = this.query.status != undefined ? this.query.status : ''
    query.beginTime = this.query.beginTime || ''
    query.endTime = this.query.endTime || ''
    query.from = this.query.from != undefined ? this.query.from : ''
    query.size = this.query.size != undefined ? this.query.size : ''
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.getBy(["records"], query)
  this.body = result
}

exports.deleteRecords = function* () {
  let query = {
    strategyID: '',
  }
  if (this.query && this.query.strategyID) {
    query.strategyID = this.query.strategyID
  }

  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.deleteBy(["records"], query)
  this.body = result
}

exports.listNotifyGroups = function* () {
  let query = {
    name: '',
  }
  if (this.query && this.query.name) {
    query.name = this.query.name
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.getBy(["groups"], query)
  this.body = result
}

exports.createNotifyGroup = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.createBy(["groups"], null, this.request.body)
  this.body = result
}

exports.modifyNotifyGroup = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.updateBy(["groups", this.params.groupid], null, this.request.body)
  this.body = result
}

exports.batchDeleteNotifyGroups = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.createBy(["groups", 'batch-delete'], null, this.request.body)
  this.body = result
}

exports.sendInvitation = function* () {
  const method = 'alert.sendInvitation'
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.alerts.createBy(['invitations'], null, this.request.body)

  // get email addr and code, then send out the code
  try {
    result.data.emails.map(function(item) {
      email.sendNotifyGroupInvitationEmail(item.addr, loginUser.user, loginUser.email, item.code)
    })
  } catch (e) {
    logger.error(method, "send invite into notify group email failed.", e)
    const err = new Error('send email failed')
    err.status = 500
    throw err
  }
  this.body = {
    data: ''
  }
}

exports.acceptInvitation = function* () {
  if (!this.query || !this.query.code) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const body = {
    code: this.query.code
  }
  const result = yield spi.alerts.createBy(["invitations", 'join'], null, body)
  this.body = result
}

exports.checkEmailAcceptInvitation = function* () {
  if (!this.query || !this.query.emails) {
    const err = new Error('invalid parameter')
    err.status = 400
    throw err
  }

  const query = {
    emails: this.query.emails,
  }

  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.alerts.getBy(["invitations", 'status'], query)

  this.body = result
}