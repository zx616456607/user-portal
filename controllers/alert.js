/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author mengyuan
 */
'use strict'

const apiFactory = require('../services/api_factory')

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
  this.body = {
    result
  }
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
  this.body = {
    result
  }
}

exports.deleteRecords = function* () {
  let query = {
    strategyID: '',
  }
  if (this.query && this.query.strategyID) {
    strategyID = this.query.strategyID
  }

  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.alerts.deleteBy(["records"], query)
  this.body = {
    result
  }
}