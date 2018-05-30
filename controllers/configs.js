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

exports.listConfigGroups = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const { project } = this.request.headers || { project: null }
  const headers = {}
  if (project) {
    Object.assign(headers, { project, teamspace: project })
  }
  const api = apiFactory.getK8sApi(loginUser)
  let response = yield api.getBy([cluster, 'configgroups'], null, { headers })
  this.status = response.code
  if (response.code >= 400) {
    const err = new Error(`list configgrups fails, error: ${response.data}`)
    err.status = response.code
    throw err
  }
  let data = [];
  response.data.forEach(function(configgroup){
    let annotations = configgroup.native.metadata.annotations
    let labelsIsEmpty = annotations && annotations['configlabels'] !== '' && annotations['configlabels'] !== undefined ? annotations['configlabels'].split(',') : []
    let item = {
      name: configgroup.native.metadata.name,
      configs: [],
      creationTimestamp: configgroup.native.metadata.creationTimestamp,
      annotations: annotations ? labelsIsEmpty : []
    }
    if (configgroup.extended && configgroup.extended && configgroup.extended.configs) {
      configgroup.extended.configs.forEach(function(c) {
        item.configs.push({name: c.name, rawName: c.rawName})
      })
    }
    item.size = item.configs.length
    data.push(item)
  })
  this.body = {
    data: data,
    cluster
  }
}

exports.getConfigGroupName = function* () {
  const cluster = this.params.cluster
  let configName = this.params.name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)

  let response = yield api.getBy([cluster, 'configgroups', configName])
  this.status = response.code
  this.body = {
    data: response.data.extended
  }
}

exports.createConfigGroup = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  if (!cluster || !body.groupName) {
    this.status = 400
    this.body = { message: 'invalid cluster or config group name' }
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let response = yield api.createBy([cluster, 'configgroups',  body.groupName], null, body)
  if (response.code >= 400) {
    const err = new Error(`list config groups fails ${response.body}`)
    err.status = response.code
    throw err
  }

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
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let response = yield api.batchDeleteBy([cluster, 'configgroups', 'batch-delete'], null, groups)
  if (response.code >= 400) {
    const err = new Error(`delete config groups fails: ${response.body}`)
    err.status = response.code
    throw err
  }
  this.status = response.code
  this.body = {
    message: response.data
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
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let response = yield api.createBy([cluster, 'configgroups', group, 'configs', fileName], null, data)
  if (response.code >= 400) {
    const err = new Error(`create config files fails: ${response.body}`)
    err.status = response.code
    throw err
  }
  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.loadConfigFiles = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)

  let response = yield api.getBy([cluster, 'configgroups', group, 'configs', fileName])
  if (response.code >= 400) {
    const err = new Error(`load config files fails: ${response.body}`)
    err.status = response.code
    throw err
  }
  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.updateConfigFile = function* () {
  const cluster = this.params.cluster
  const fileName = this.params.name
  const group = this.params.group
  let data = this.request.body.desc
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)

  let response = yield api.updateBy([cluster, 'configgroups', group, 'configs', fileName], null, data)
  if (response.code >= 400) {
    const err = new Error(`update config file ${filename} fails: ${response.body}`)
    err.status = response.code
    throw err
  }
  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.deleteConfigFiles = function* () {
  const cluster = this.params.cluster
  const group = this.params.group
  const data = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)

  let response = yield api.batchDeleteBy([cluster, 'configgroups', group, 'configs', 'batch-delete'], null, data)
  this.status = response.code
  this.body = {
    message: response.data
  }
}

exports.updateConfigAnnotations = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const data = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let response = yield api.updateBy([cluster,'configgroups',name],null,data)
  this.status = response.code
  this.body = {
    data: response.data
  }
}

exports.checkConfigGroupName = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const response = yield api.getBy([cluster, 'configgroups', name, 'verify'])
  this.body = response
}
