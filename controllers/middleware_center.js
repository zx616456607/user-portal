/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Middleware center controller
 *
 *
 * @author zhangxuan
 * @date 2018-09-11
 */
'use strict'

const portHelper = require('./port_helper')
const apiFactory = require('../services/api_factory')

exports.getAppClassifies = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appcenters.getBy(['groups'])
  this.body = result
}

exports.getApps = function* () {
  const query = this.request.query
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.appcenters.getBy(null, query)
  this.body = result
}

exports.deployApp = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'appcenters'],null, body)
  this.body = result
}

exports.checkAppNameExist = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'appcenters', name, 'exist'])
  this.body = result
}

// 获取应用集群列表
exports.getAppClusterList = function *() {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'appcenters'])
  this.body = {
    result
  }
}

// 获取应用集群详情
exports.getAppClusterDetail = function *() {
  const cluster = this.params.cluster
  const name = this.params.name
  const loginUser = this.session.loginUser

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'appcenters', name])
  this.body = {
    result
  }
}

// 删除应用集群
exports.deleteClusterDetail = function *() {
  const cluster = this.params.cluster
  const body = this.request.body
  const loginUser = this.session.loginUser

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'appcenters', 'delete'], null, body)
  this.body = {
    result
  }
}

// 启动应用集群
exports.startClusterDetail = function *() {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'appcenters', 'start'], null, body)
  this.body = {
    result
  }
}

// 停止应用集群
exports.stopClusterDetail = function *() {
  const body = this.request.body
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'appcenters', 'stop'], null, body)
  this.body = {
    result
  }
}

// 重启应用集群
exports.rebootClusterDetail = function *() {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'appcenters', 'reboot'], null, body)
  this.body = {
    result
  }
}

// 获取应用集群服务列表
exports.getAppClusterServerList = function *() {
  const cluster = this.params.cluster
  const appName = this.params.name
  const loginUser = this.session.loginUser

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'appcenters', appName, 'services'])
  const lbgroupSettings =  yield api.getBy([cluster, 'proxies'])

  const services = result.data
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
    total: result.data.total || 1,
    count: result.data.count || 2,
    availableReplicas: result.data.runningDeployment
  }
  this.body = body
}