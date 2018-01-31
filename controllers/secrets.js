/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Secrets config controller
 *
 * v0.1 - 2018-01-31
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.createGroup = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const groupName = this.params.groupName
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.createBy([ clusterID, 'secrets', groupName ])
  this.body = result
}

exports.removeGroup = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const groupName = this.params.groupName
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.deleteBy([ clusterID, 'secrets', groupName ])
  this.body = result
}

exports.getGroups = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.getBy([ clusterID, 'secrets'])
  this.body = result
}

exports.addKeyIntoGroup = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const groupName = this.params.groupName
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body

  const result = yield api.createBy(
    [ clusterID, 'secrets', groupName, 'entries' ],
    null,
    body
  )
  this.body = result
}

exports.updateKeyIntoGroup = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const groupName = this.params.groupName
  const api = apiFactory.getK8sApi(loginUser)
  const body = this.request.body

  const result = yield api.updateBy(
    [ clusterID, 'secrets', groupName, 'entries' ],
    null,
    body
  )
  this.body = result
}

exports.removeKeyFromGroup = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const groupName = this.params.groupName
  const key = this.params.key
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.deleteBy([ clusterID, 'secrets', groupName, 'entries', key ])
  this.body = result
}
