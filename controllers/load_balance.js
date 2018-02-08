/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Load balance controller
 *
 * v0.1 - 2018-01-30
 * @author zhangxuan
 */
'use strict'

const apiFactory = require('../services/api_factory')
const registryConfigLoader = require('../registry/registryConfigLoader')

exports.getLBIPList = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'loadbalances', 'ip'])
  this.body = result
}

exports.createLB = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  let newBody = Object.assign({}, body, {
    registry: getRegistryURL()
  })
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'loadbalances'], null, newBody)
  this.body = result
}

exports.editLB = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const displayName = this.params.displayname
  const body = this.request.body
  let newBody = Object.assign({}, body, {
    registry: getRegistryURL()
  })
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'loadbalances', name, 'displayname', displayName], null, newBody)
  this.body = result
}

exports.getLBList = function* () {
  const cluster = this.params.cluster
  const query = this.query
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'loadbalances'])
  let { data } = result
  result.total = data.length || 0
  if (data.length) {
    if (query.creationTime) {
      switch (query.creationTime) {
        case 'd':
          data.sort((a, b) => 
            new Date(b.metadata.creationTimestamp).getTime() - new Date(a.metadata.creationTimestamp).getTime())
          break
        case 'a':
          data.sort((a, b) => 
            new Date(a.metadata.creationTimestamp).getTime() - new Date(b.metadata.creationTimestamp).getTime())
          break
        default:
          break
      }
    }
    if (query.name) {
      data = data.filter(item => item.metadata.annotations.displayName.indexOf(query.name) > -1)
      result.total = data.length
    }
    if (query.page && query.size) {
      data = data.slice((query.page - 1) * query.size, query.size)
    }
    result.data = data
  }
  
  this.body = result
}

exports.getLBDetail = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const displayName = this.params.displayname
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'loadbalances', name, 'displayname', displayName])
  this.body = result
}

exports.deleteLB = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const displayName = this.params.displayname
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'loadbalances', name, 'displayname', displayName])
  this.body = result
}

exports.createAppIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'loadbalances', lbname, 'ingress', 'app'], null, body)
  this.body = result
}

exports.createIngress = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'loadbalances', name, 'ingress'], null, body)
  this.body = result
}

exports.updateIngress = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const displayName = this.params.displayname
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'loadbalances', name, 'ingress', displayName], null, body)
  this.body = result
}
exports.deleteIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const name = this.params.name
  const displayName = this.params.displayname
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'loadbalances', lbname, 'ingresses', name, 'displayname', displayName])
  this.body = result
}

function getRegistryURL() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    let url = registryConfigLoader.GetRegistryConfig().url
    if (url.indexOf('://') > 0) {
      url = url.split('://')[1]
    }
    return url
  }
  // Default registry url
  return "localhost"
}