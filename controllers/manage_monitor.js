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

const moment = require('moment')
const Service = require('../kubernetes/objects/service')
const apiFactory = require('../services/api_factory')
const elasticdump = require('../services/elasticdump')
const logger = require('../utils/logger').getLogger('manage_monitor')

exports.getOperationAuditLog = function* () {
  let reqBody = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.audits.createBy(['logs'], null, reqBody);
  this.body = {
    logs: result.data
  }
}

// 获取操作对象筛选条件api
exports.getOperationalTargetFilters = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.audits.getBy(["menus"], null, null)
  this.body = result
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

exports.dumpServiceSearchLog = function* () {
  const clusterID = this.params.cluster
  const services = this.params.services
  const query = this.query
  const loginUser = this.session.loginUser
  yield dumpLog.apply(this, [ clusterID, loginUser, query, services ])
}

exports.dumpInstancesSearchLog = function* () {
  const clusterID = this.params.cluster
  const instances = this.params.instances
  const query = this.query
  const loginUser = this.session.loginUser
  yield dumpLog.apply(this, [ clusterID, loginUser, query, null, instances.split(',') ])
}

function* dumpLog(clusterID, loginUser, query, containerName, podNames) {
  const method = 'dumpLog'
  const spi = apiFactory.getTenxSysSignSpi(loginUser)
  const result = yield spi.clusters.getBy([clusterID, 'access'])
  const cluster = result.data
  const timestamp = elasticdump.getTimestamp(query)
  const gte = timestamp.gte
  const lte = timestamp.lte
  const isFile = query.logType === 'file'
  let namespace = loginUser.teamspace || loginUser.namespace
  if (namespace === 'default') {
    namespace = loginUser.namespace
  }
  const searchBody = {
    namespace: namespace,
    options:{
      containerName,
      podNames,
      gte,
      lte,
      isFile,
    }
  }

  let logName = containerName || podNames.join('|')
  logName = `${logName}-${moment().format('YYYY-MM-DD-HH-mm-ss')}`

  const scope = this
  this.status = 200
  this.set('content-disposition', `attachment; filename="${logName}.log.gz"`)
  this.set('content-type', 'application/force-download')
  try {
    yield elasticdump.dump(cluster, searchBody, scope)
  } catch (error){
    logger.error(method, error.stack)
  }
}

exports.getServiceLogfiles = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const instances = this.params.instances
  const reqBody = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'logs', 'instances', instances, 'logfiles'], null, reqBody);
  this.body = result
}

exports.getClusterOfQueryLog = function* () {
  const method = 'getClusterOfQueryLog'
  const projectName = this.params.project_name
  let namespace = this.params.namespace
  if (namespace === 'default') {
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
    const result = yield projectApi.projects.getBy([projectName, 'visible-clusters'], null)
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
    if (err.message && err.message.code === 403) {
      throw err
    }
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
  const apps = result.data && result.data.apps || []
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

exports.getPanelList = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'metric', 'panels'], null)
  this.body = result
}

exports.checkPanelName = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const name = this.params.name
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'metric', 'panels', name, 'check'])
  this.body = result
}

exports.createPanel = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'metric', 'panels'], null, body)
  this.body = result
}

exports.updatePanel = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const panelID = this.params.panelID
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'metric', 'panels', panelID], null, body)
  this.body = result
}

exports.deletePanel = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'metric', 'panels', 'batch-delete'], null, body)
  this.body = result
}

exports.getChartList = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'metric', 'charts'], query)
  this.body = result
}

exports.checkChartName = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const name = this.params.name
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'metric', 'charts', name, 'check'], query)
  this.body = result
}

exports.createCharts = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'metric', 'charts'], null, body)
  this.body = result
}

exports.updateCharts = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const id = this.params.id
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'metric', 'charts', id], null, body)
  this.body = result
}

exports.deleteCharts = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'metric', 'charts', 'batch-delete'], null, body)
  this.body = result
}

exports.getMetrics = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'metric'], query)
  this.body = result
}

exports.getProxiesServices = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'proxies', id, 'services'])
  this.body = result
}

exports.getMonitorMetrics = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const lbgroup = this.params.lbgroup
  const services = this.params.services
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'metric', 'nexport', lbgroup, 'service', services, 'metrics'], query)
  this.body = result
}
