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
const logger = require('../utils/logger.js').getLogger("app_manage")
const yaml = require('js-yaml')
const apiFactory = require('../services/api_factory')
const Deployment = require('../kubernetes/objects/deployment')
const Service = require('../kubernetes/objects/service')
const constants = require('../constants')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const portHelper = require('./port_helper')

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
  let api = apiFactory.getK8sApi(loginUser)
  if (!app.appPkgID || Object.keys(app.appPkgID).length === 0 ){
    api = apiFactory.getK8sApi(loginUser)
  }else{
    api = apiFactory.getApi(loginUser).pkg
  }
  let result
  if (this.request.url.indexOf('/ai') > -1) {
    result = yield api.createBy([cluster, 'apps','ai'], null, app)
  } else {
    result = yield api.createBy([cluster, 'apps' ], null, app)
  }
  this.body = {
    cluster,
    data: result.data
  }
}

exports.createPlugin = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const basicInfo = this.request.body
  if (!basicInfo || !basicInfo.templateID) {
    const err = new Error('No plugin templateID provided.')
    err.status = 400
    throw err
  }
  const templateApi = apiFactory.getTemplateApi(loginUser)
  const pluginTemplate = yield templateApi.getBy([basicInfo.templateID])
  if (pluginTemplate.data.type != 4) {
    const err = new Error('Template not for plugin.')
  }
  let yamlContent = pluginTemplate.data.content
  const api = apiFactory.getK8sApi(loginUser)
  let params = {
    pluginName: basicInfo.pluginName,
    template: yamlContent
  }
  const result = yield api.createBy([cluster, 'plugins'], null, params)
  this.body = {
    cluster,
    data: result.data
  }
}

exports.updateAppDesc = function *() {
  const cluster = this.params.cluster
  const name = this.params.app_name
  let data = this.request.body
  if (!data || !data.desc) {
    data = {
      desc: ''
    }
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'apps', name, 'desc'], null, data)
  this.body = {
    cluster,
    data: result.data
  }
}

exports.getApps = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const { project } = this.request.headers || { project: null }
  const headers = {}
  if (project) {
    Object.assign(headers, { project, teamspace: project })
  }
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 0 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (query.sortOrder) {
    queryObj.sort_order = query.sortOrder
  }
  if (query.sortBy) {
    queryObj.sort_by = query.sortBy
  }
  const api = apiFactory.getK8sApi(loginUser)
  let result
  if (this.request.url.indexOf('/ai') > -1) {
    result = yield api.getBy([cluster, 'apps', 'ai'], queryObj, { headers })
  } else {
    result = yield api.getBy([cluster, 'apps'], queryObj, { headers })
  }
  const lbgroupSettings =  yield api.getBy([cluster, 'proxies'])
  const apps = result.data && result.data.apps
  apps && apps.map((app) => {
    if (!app.services) {
      app.services = []
    }
    app.appStatus = 0
    app.serviceCount = app.services.length
    app.instanceCount = 0
    app.services.map((deployment) => {
      app.instanceCount += deployment.spec.replicas
      portHelper.addPort(deployment, app.k8s_services, lbgroupSettings.data)
    })
    if (app.serviceCount < 1 || app.instanceCount < 1) {
      app.appStatus = 1
    }
  })
  this.body = {
    cluster,
    data: apps || [],
    total: result.data && result.data.total || 0,
    count: result.data && result.data.count || 0,
  }
}

exports.deleteApps = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const apps = body.apps
  if (!apps) {
    const err = new Error('App names is required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  //获取app下的service，　并删除其对应的cd规则
  // const appResult = yield api.getBy([cluster, 'apps', apps.join(',')])
  // const appsData = appResult.data
  // const deleteCDRuleServiceName = []
  // if(appsData) {
  //   apps.forEach(key => {
  //     const app = appsData[key]
  //     if(app.services && app.services.length > 0) {
  //       app.services.forEach(service => {
  //         deleteCDRuleServiceName.push(service.metadata.name)
  //       })
  //     }
  //   })
  //   const devOpsApi = apiFactory.getDevOpsApi(loginUser)
  //   if (deleteCDRuleServiceName.length > 0) {
  //     try {
  //       yield devOpsApi.deleteBy(['cd-rules'], {
  //         cluster,
  //         name: deleteCDRuleServiceName.join(',')
  //       })
  //     } catch (err) {
  //       if (err.statusCode === 403) {
  //         logger.warn("Failed to delete cd rules as it's not permitted")
  //       } else {
  //         throw err
  //       }
  //     }
  //   }
  // }
  const result = yield api.batchDeleteBy([cluster, 'apps', 'batch-delete'], null, body)
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
  const body = this.request.body
  if (!body || !body.template) {
    const err = new Error('Service template is required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy(
    [cluster, 'apps', appName, 'services'],
    null, body
  )
  this.body = {
    cluster,
    appName,
    data: result.data
  }
}

exports.getAppDetail = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'apps', appName])
  const lbgroupSettings =  yield api.getBy([cluster, 'proxies'])
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
  app.services.map((deployment) => {
    app.instanceCount += deployment.spec.replicas
    portHelper.addPort(deployment, app.k8s_services, lbgroupSettings.data)
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
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', appName, 'services'], queryObj)
  const lbgroupSettings =  yield api.getBy([cluster, 'proxies'])

  const services = result.data.services

  let deployments = []
  services.map((service) => {
    service.deployment.images = []
    service.deployment.spec.template.spec.containers.map((container) => {
      service.deployment.images.push(container.image)
    })
    let annotations = service.deployment.spec.template.metadata.annotations
    if (annotations && annotations.appPkgName && annotations.appPkgTag){
       service.deployment["wrapper"] = {
         "appPkgName":annotations.appPkgName,
         "appPkgTag":annotations.appPkgTag
       }
    }
    portHelper.addPort(service.deployment, service.service, lbgroupSettings.data)
    service.deployment.volumeTypeList = service.volumeTypeList
    deployments.push(service.deployment)
  })

  const body = {
    cluster,
    appName,
    data: deployments,
    total: result.data.total,
    count: result.data.count,
    availableReplicas: result.data.runningDeployment
  }
  this.body = body
}

exports.getAppOrchfile = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'apps', 'detail', appName])
  const app = result.data[appName]
  if (!app) {
    const err = new Error(`App '${appName}' not exits.`)
    err.status = 404
    throw err
  }
  if (!app.services) {
    app.services = []
  }
  if (!app.k8s_services) {
    app.k8s_services = []
  }

  let data = ""
  app.services.map((service) => {
    if (data != "") {
      data += "---\n"
    }
    data += yaml.dump(service)
  })
  app.k8s_services.map((k8s_service) => {
    if (data != "") {
      data += "---\n"
    }
    data += yaml.dump(k8s_service)
  })
  this.body = {
    cluster,
    appName,
    data,
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
