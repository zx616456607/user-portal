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
  const displayName = this.params.displayname
  const agentType = this.params.agentType
  let newBody = Object.assign({}, body, {
    registry: getRegistryURL()
  })
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'loadbalances', 'displayname', displayName, 'agentType', agentType], null, newBody)
  this.body = result
}

exports.editLB = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const displayName = this.params.displayname
  const body = this.request.body
  const agentType = this.params.agentType
  let newBody = Object.assign({}, body, {
    registry: getRegistryURL()
  })
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'loadbalances', name, 'displayname', displayName, 'agentType', agentType], null, newBody)
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
  const agentType = this.params.agentType
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'loadbalances', name, 'displayname', displayName, 'agentType', agentType])
  this.body = result
}

exports.createAppIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const body = this.request.body
  const ingressname = this.params.ingressname
  const displayName = this.params.displayname
  const agentType = this.params.agentType
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'loadbalances', lbname, 'ingress', ingressname, 'app', 'displayname', displayName, 'agentType', agentType], null, body)
  this.body = result
}

exports.createIngress = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const body = this.request.body
  const ingressname = this.params.ingressname
  const displayName = this.params.displayname
  const agentType = this.params.agentType
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'loadbalances', name, 'ingress', ingressname, 'displayname', displayName, 'agentType', agentType], null, body)
  this.body = result
}

exports.updateIngress = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const displayName = this.params.displayname
  const lbDisplayName = this.params.lbdisplayname
  const agentType = this.params.agentType
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'loadbalances', name, 'ingress', displayName, 'displayname', lbDisplayName, 'agentType', agentType], null, body)
  this.body = result
}
exports.deleteIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const name = this.params.name
  const ingressDisplayname = this.params.ingressdisplayname
  const displayName = this.params.displayname
  const agentType = this.params.agentType
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'loadbalances', lbname, 'ingresses', name, ingressDisplayname, 'displayname', displayName, 'agentType', agentType])
  this.body = result
}

exports.getServiceLB = function* () {
  const cluster = this.params.cluster
  const name = this.params.name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'loadbalances', 'services', name, 'controller'])
  this.body = result
}

exports.unbindService = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const serviceName = this.params.servicename
  const agentType = this.params.agentType
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'loadbalances', lbname, 'services', serviceName, 'agentType', agentType])
  this.body = result
}

exports.nameAndHostCheck = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const query = this.query
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'loadbalances', lbname, 'ingresses', 'exist'], query)
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

exports.createTcpUdpIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const type = this.params.type
  const name = this.params.name
  const agentType = this.params.agentType
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'loadbalances', lbname, 'stream', 'type', type, 'displayname', name, 'agentType', agentType], null, body)
  this.body = result
}

exports.getTcpUdpIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const type = this.params.type
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'loadbalances', lbname, 'stream', 'protocols', type])
  this.body = result
}

exports.updateTcpUdpIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const type = this.params.type
  const name = this.params.name
  const agentType = this.params.agentType
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'loadbalances', lbname, 'stream', 'type', type, 'displayname', name, 'agentType', agentType], null, body)
  this.body = result
}

exports.deleteTcpUdpIngress = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const type = this.params.type
  const ports = this.params.ports
  const name = this.params.name
  const agentType = this.params.agentType
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'loadbalances', lbname, 'stream', 'protocols', type, 'ports', ports, 'displayname', name, 'agentType', agentType])
  this.body = result
}

exports.updateWhiteList = function* () {
  const cluster = this.params.cluster
  const lbname = this.params.lbname
  const name = this.params.name
  const agentType = this.params.agentType
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'loadbalances', lbname, 'whiteList', 'displayname', name, 'agentType', agentType], null, body)
  this.body = result
}

exports.isCreateLbPermission = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy(['undefined', 'loadbalances', 'checkpermission'])
  this.body = result
}

exports.getVipIsUsed = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const vip = this.params.vip
  const result = yield api.getBy([ cluster, 'loadbalances', 'vip', vip ])
  this.body = result
}

exports.getMonitorData = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const name = this.params.name
  const query = this.query
  const result = yield api.getBy([ cluster, 'metric', 'loadbalance', name, 'metrics' ], query)
  this.body = result
}