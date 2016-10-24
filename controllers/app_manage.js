/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App manage controller
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */
'use strict'
const yaml = require('js-yaml')
const apiFactory = require('../services/api_factory')
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

exports.createApp = function* () {
  const cluster = this.params.cluster
  const app = this.request.body
  if (!app || !app.name) {
    const err = new Error('App name is required.')
    err.status = 400
    throw err
  }
  if (!app || !app.template) {
    const err = new Error('App template is required.')
    err.status = 400
    throw err
  }
  // app.desc = yaml.dump(app.desc)
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'apps'], null, app)
  this.body = {
    cluster,
    data: result.data
  }
}

exports.getApps = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > 100) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'apps'], queryObj)
  const apps = result.data.apps
  apps.map((app) => {
    if (!app.services) {
      app.services = []
    }
    app.appStatus = 0
    app.serviceCount = app.services.length
    app.instanceCount = 0
    app.services.map((service) => {
      app.instanceCount += service.spec.replicas
    })
    if (app.serviceCount < 1 || app.instanceCount < 1) {
      app.appStatus = 1
    }
  })
  this.body = {
    cluster,
    data: apps || [],
    total: result.data.total,
    count: result.data.count,
  }
}

exports.deleteApps = function* () {
  const cluster = this.params.cluster
  const apps = this.request.body
  if (!apps) {
    const err = new Error('App names is required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.batchDeleteBy([cluster, 'apps', 'batch-delete'], null, { apps })
  this.body = {
    cluster,
    data: result
  }
}

exports.stopApps = function* () {
  const cluster = this.params.cluster
  const apps = this.request.body
  if (!apps) {
    const err = new Error('App names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'apps', 'batch-stop'], null, { apps })
  this.body = {
    cluster,
    data: result
  }
}

exports.startApps = function* () {
  const cluster = this.params.cluster
  const apps = this.request.body
  if (!apps) {
    const err = new Error('App names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'apps', 'batch-start'], null, { apps })
  this.body = {
    cluster,
    data: result
  }
}

exports.restartApps = function* () {
  const cluster = this.params.cluster
  const apps = this.request.body
  if (!apps) {
    const err = new Error('App names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'apps', 'batch-restart'], null, { apps })
  this.body = {
    cluster,
    data: result
  }
}

exports.getAppsStatus = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.addService = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  this.body = {
    cluster,
    appName
  }
}

exports.getAppDetail = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'apps', appName])
  const app = result.data[appName]
  if (!app) {
    const err = new Error(`App '${appName}' not exits.`)
    err.status = 404
    throw err
  }
  if (!app.services) {
    app.services = []
  }
  app.appStatus = 0
  app.serviceCount = app.services.length
  app.instanceCount = 0
  app.services.map((service) => {
    app.instanceCount += service.spec.replicas
  })
  if (app.serviceCount < 1 || app.instanceCount < 1) {
    app.appStatus = 1
  }
  this.body = {
    cluster,
    appName,
    data: app
  }
}

exports.getAppServices = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > 100) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'apps', appName, 'services'], queryObj)
  const services = result.data.services

  services.map((service) => {
    service.images = []
    service.spec.template.spec.containers.map((container) => {
      service.images.push(container.image)
    })
  })

  this.body = {
    cluster,
    appName,
    data: result.data.services,
    total: result.data.total,
    count: result.data.count,
  }
}

exports.getAppOrchfile = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const data = []
  this.body = {
    cluster,
    appName,
    data
  }
}

exports.getAppLogs = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const data = []
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster, 'apps', appName, 'oplog'])
  this.status = response.code
  if (response.data[appName]) {
    response.data = response.data[appName]
  }
  this.body = response
}

exports.checkAppName = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster, 'apps', appName, 'existence'])
  this.status = response.code
  this.body = response
}

exports.checkServiceName = function* () {
  const cluster = this.params.cluster
  const service = this.params.service
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster, 'apps', service, 'existence'])
  this.status = response.code
  this.body = response
}