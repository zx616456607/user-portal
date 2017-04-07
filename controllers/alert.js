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
const logger = require('../utils/logger.js').getLogger('alert')
const co = require('co')

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
  var self = this
  var index = 0
  yield new Promise(function(resolve, reject) {
    result.data.emails.map(function(item) {
      co(function *(){
        yield email.sendNotifyGroupInvitationEmail(item.addr, loginUser.user, loginUser.email, item.code)
        index++
        if (index == result.data.emails.length) {
          resolve()
        }
      }).catch(function (err) {
        logger.error(method, "Failed to send email: " + JSON.stringify(err))
        reject(err)
      })
    })
  })
  this.body = {}
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



/*--------------alert setting--------------------*/

exports.getAlertSetting = function* () {
  const cluster = this.params.cluster
  const user = this.session.loginUser
  let owner = user.user
  const teamspace = user.teamspace
  const api = apiFactory.getApi(user)
  const spi = apiFactory.getSpi(user)
  if(teamspace){
    const teamID = this.query.teamID
    if(!teamID) {
      const err = new Error("teamID is require")
      err.status = 400
      throw err
    }
    const teamCreator = yield api.teams.getBy([teamID, 'creator'])
    owner = teamCreator.data.userName
  }
  const response = yield spi.alerts.getBy(['strategy'], {
    clusterID: cluster,
    namespace: teamspace || user.namespace,
    owner: owner
  })
  this.body = response
}

exports.addAlertSetting = function*() {
  const cluster = this.params.cluster
  const body = this.request.body
  const user = this.session.loginUser
  body.user = user.user
  body.namespace = user.namespace
  body.clusterID = cluster
  const spi = apiFactory.getSpi(user)
  console.log(body)
  const response = yield spi.alerts.createBy(['strategy'], null, body)
  console.log(response)
  this.body = response
}
