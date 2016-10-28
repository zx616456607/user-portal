/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  configGroup list
 *
 * v2.0 - 2016/9/28
 * @author Bai Yu
 */

'use strict'
const apiFactory = require('../services/api_factory')
const ConfigGroupsApi = require('../tenx_api/v2')
const configGroups = {
  protocol: 'http',
  host: '192.168.1.103:48000',
  version: 'v2',
  auth: {
    user: 'huangxin',
    token: 'vmrptixssqmwojepukeedbpkgujtypbklggnjazhsmrlfyef',
    namespace: 'huangxin'
  },
  timeout: 600
}
const configApi = new ConfigGroupsApi(configGroups)

exports.getConfigGroup = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let response = yield api.getBy([cluster, 'configgroups'])
  this.status = response.code
  this.body = {
    data: response.data,
    cluster
  }
}

exports.getConfigGroupName = function* () {
  const cluster = this.params.cluster
  let configName = this.params.name
  let response = yield configApi.configGroup.getBy([cluster, 'configgroups', configName])
  this.status = response.code
  this.body = {
    data: response.data.extended
  }
}

exports.createConfigGroup = function* () {
  const cluster = this.params.cluster
  let groupName = this.request.body.groupName
  if (!cluster || !groupName) {
    this.status = 400
    this.body = { message: 'error' }
  }
  let response = yield configApi.configGroup.createBy([cluster, 'configgroups', groupName])

  this.status = response.code
  this.body = {
    data: response.data
  }
}
exports.deleteConfigGroup = function* () {
  const cluster = this.params.cluster
  let groups = this.request.body
  if (groups.groups.length == 0) {
    this.status = 400
    this.body = { message: 'Not Parameter' }
  }
  let response = yield configApi.configGroup.batchDeleteBy([cluster, 'configgroups', 'batch-delete'], null, groups)
  // go delete`
  this.status = response.code
  this.body = {
    message: '删除成功了'
  }
}

//  create config group files
exports.createConfigFiles = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  let data = this.request.body.groupFiles
  if (!cluster || !data) {
    this.status = 400
    this.body = { message: 'error' }
  }
  let response = yield configApi.configGroup.createBy([cluster, 'configgroups', group, 'configs', fileName], null, data)

  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.loadConfigFiles = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  let response = yield configApi.configGroup.getBy([cluster, 'configgroups', group, 'configs', fileName])

  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.updateConfigName = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  let data = this.request.body.desc
  console.log('update in ', data)
  let response = yield configApi.configGroup.updateBy([cluster, 'configgroups', group, 'configs', fileName], null, data)

  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.deleteConfigFiles = function* () {
  const cluster = this.params.cluster
  const group = this.params.group
  const data = this.request.body
  let response = yield configApi.configGroup.batchDeleteBy([cluster, 'configgroups', group, 'configs', 'batch-delete'], null, data)
  this.status = response.code
  this.body = {
    data: response.data
  }
}