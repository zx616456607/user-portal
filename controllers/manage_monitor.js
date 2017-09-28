/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Database cache controller
 *
 * v0.1 - 2016-11-01
 * @author GaoJian
 */
'use strict'
const Service = require('../kubernetes/objects/service')
const apiFactory = require('../services/api_factory')
const logger = require('../utils/logger').getLogger('manage_monitor')

exports.getOperationAuditLog = function* () {
  let reqBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  reqBody.namespace = loginUser.teamspeace || loginUser.namespace
  const result = yield api.audits.createBy(['logs'], null, reqBody);
  this.body = {
    logs: result.data
  }
}

exports.getSearchLog = function* () {
  const cluster = this.params.cluster
  const instances = this.params.instances
  const reqBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'logs', 'instances', instances, 'logs'], null, reqBody);
  this.body = {
    logs: result.data
  }
}

exports.getServiceSearchLog = function* () {
  const cluster = this.params.cluster
  const services = this.params.services
  const reqBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'logs', 'services', services, 'logs'], null, reqBody);
  this.body = {
    logs: result.data
  }
}
exports.getClusterOfQueryLog = function* () {
  const method = 'getClusterOfQueryLog'
  const projectName = this.params.project_name
  let namespace = this.params.namespace
  if(namespace === 'default') {
    namespace = this.session.loginUser.namespace
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  let clusters
  if (projectName === 'default') {
    const spi = apiFactory.getSpi(loginUser)
    const result = yield spi.clusters.getBy(['default'])
    clusters = result.clusters || []
  } else {
    const projectApi = apiFactory.getApi(loginUser)
    const result = yield projectApi.projects.getBy([projectName, 'clusters'], null)
    clusters = result.data.clusters || []
  }
  let tempResult = [];
  try {
    clusters.map((item, index) => {
      tempResult.push(api.clusters.getBy([item.clusterID, 'instances', namespace, 'instances']))
    });
    let temp = yield tempResult;
    clusters.map((item, index) => {
      clusters[index].instanceNum = temp[index].data && temp[index].data.total || 0;
    });
  } catch (err) {
    logger.error(method, err.stack)
  }
  this.body = {
    data: clusters,
  }
}

exports.getServiceOfQueryLog = function* () {
  const cluster = this.params.cluster_id
  let namespace = this.params.namespace
  if(namespace === 'default') {
    namespace = this.session.loginUser.namespace
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'apps', namespace, 'apps'], { size: 100 })
  const apps = result.data.apps
  let serviceList = []
  apps.map((app) => {
    if (!app.services) {
      app.services = []
    }
    app.services.map((service) => {
      let tmpBody = {
        serviceName: service.metadata.name,
        instanceNum: service.spec.replicas,
        annotations: service.spec.template.metadata
      }
      serviceList.push(tmpBody)
    });
  })
  this.body = {
    data: serviceList
  }
}
