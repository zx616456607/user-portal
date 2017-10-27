/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */
'use strict'

const logger     = require('../utils/logger.js').getLogger('overview_cluster')
const apiFactory = require('../services/api_factory')

function* getOverview(cluster, loginUser, queryObj) {
  const api = apiFactory.getApi(loginUser, 15000) // 15 seconds timeout
  const k8sapi = apiFactory.getK8sApi(loginUser)
  const mapping = {
    operations: api.overview.getBy(["space-operations"], queryObj),
    sysinfo: api.overview.getBy(["clusters", cluster, "system-info"]),
    appstatus: api.overview.getBy(["clusters", cluster, "appstatus"]),
    dbservices: k8sapi.getBy([cluster, "dbservices"]),
    spaceconsumption: api.overview.getBy(["clusters", cluster, "space-consumption"]),
    clusterStaticSummary: k8sapi.getBy([cluster, 'summary', 'static']),
  }
  const keys = Object.getOwnPropertyNames(mapping)
  const result = yield keys.reduce((apis, key, index) => {
    apis[index] = mapping[key]
    mapping[key] = index
    return apis
  }, [])
  keys.forEach(key => {
    mapping[key] = result[mapping[key]]
  })
  return mapping
}

// TODO: should we break down these methods as it's bad proformance for overview
exports.getClusterOverview = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  let queryObj = { cluster }
  const result = yield getOverview(cluster, loginUser, queryObj)
  let operations = {}
  if (result && result.operations && result.operations.data) {
    operations = result.operations.data
  }
  let sysinfo = {}
  if (result && result.sysinfo && result.sysinfo.data) {
    sysinfo = result.sysinfo.data
  }
  // TODO: Setup ES cluster to replace this
  // Handle yellow status specially for now
  if (sysinfo.logging && sysinfo.logging.status == "warning") {
    // yellow status
    sysinfo.logging.status = "normal"
  }
  let storage = {}
  // if (result && result[2] && result[2].data) {
  //   storage = result[2].data
  // }
  let appstatus = {}
  if (result && result.appstatus && result.appstatus.data) {
    appstatus = result.appstatus.data
  }
  let dbservices = {}
  if (result && result.dbservices && result.dbservices.data) {
    dbservices = result.dbservices.data
  }
  let spaceconsumption = {}
  if (result && result.spaceconsumption && result.spaceconsumption.data) {
    spaceconsumption = result.spaceconsumption.data
  }
  let clusterStaticSummary = {}
  if (result && result.clusterStaticSummary && result.clusterStaticSummary.data) {
    clusterStaticSummary = result.clusterStaticSummary.data
  }

  // Check node summary separately
  let nodesummary = {}
  try {
    // Set timeout to 20 seconds
    const api = apiFactory.getApi(loginUser)
    let summaryResult = yield api.overview.getBy(["clusters", cluster, "nodesummary"], null, {"timeout": 20 * 1000})
    if (summaryResult && summaryResult.data) {
      nodesummary = summaryResult.data
    }
  } catch (error) {
    logger.error("Failed to get node summary information: " + JSON.stringify(error))
  }

  this.body = {
    operations,
    sysinfo,
    storage,
    appstatus,
    nodesummary,
    dbservices,
    spaceconsumption,
    clusterStaticSummary
  }
}

// add the overview for standard version
exports.getStdClusterOverview = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  let queryObj = { cluster }
  const api = apiFactory.getApi(loginUser)
  const k8sapi = apiFactory.getK8sApi(loginUser)
  const result =
    yield [api.overview.getBy(["space-operations"], queryObj),
    api.overview.getBy(["clusters", cluster, "system-info"]),
    //api.overview.getBy(["clusters", cluster, "storagestatus"]),
    api.overview.getBy(["clusters", cluster, "appstatus"]),
    k8sapi.getBy([cluster, "dbservices"]),
    api.overview.getBy(["space-consumption"]),]
  let operations = {}
  if (result && result[0] && result[0].data) {
    operations = result[0].data
  }
  let sysinfo = {}
  if (result && result[1] && result[1].data) {
    sysinfo = result[1].data
  }
  // TODO: Setup ES cluster to replace this
  // Handle yellow status specially for now
  if (sysinfo.logging && sysinfo.logging.status == "warning") {
    // yellow status
    sysinfo.logging.status = "normal"
  }
  let storage = {}
  if (result && result[2] && result[2].data) {
    storage = result[2].data
  }
  let appstatus = {}
  if (result && result[3] && result[3].data) {
    appstatus = result[3].data
  }
  let dbservices = {}
  if (result && result[4] && result[4].data) {
    dbservices = result[4].data
  }
  let spaceconsumption = {}
  if (result && result[5] && result[5].data) {
    spaceconsumption = result[5].data
  }
  this.body = {
    operations,
    sysinfo,
    storage,
    appstatus,
    dbservices,
    spaceconsumption,
  }
}

exports.getClusterOperations = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  let queryObj = { cluster }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["space-operations"], queryObj)
  const data = result || {}
  this.body = {
    data
  }
}

exports.getClusterSysinfo = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["clusters", cluster, "system-info"])
  let data = {}
  if (result && result.data) {
    data = result.data
  }
  this.body = {
    data
  }
}

/*
exports.getClusterStorage = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["clusters", cluster, "storagestatus"])
  let data = {}
  if (result && result.data) {
    data = result.data
  }
  this.body = {
    data
  }
}*/

exports.getClusterAppStatus = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["clusters", cluster, "appstatus"])
  let data = {}
  if (result && result.data) {
    data = result.data
  }
  this.body = {
    data
  }
}

exports.getClusterDbServices = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, "dbservices"])
  let data = {}
  if (result && result.data) {
    data = result.data
  }
  this.body = {
    data
  }
}

exports.getClusterNodeSummary = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["clusters", cluster, "nodesummary"])
  let data = {}
  if (result && result.data) {
    data = result.data
  }
  this.body = {
    data
  }
}

exports.getClusterSummary = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  const k8sapi = apiFactory.getK8sApi(loginUser)
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield [
    k8sapi.getBy([cluster, 'summary']),
    volumeApi.getBy([cluster, 'volumes', 'pool-status'])]
  let clusterSummary = {}
  if (result && result[0] && result[0].data) {
    clusterSummary = result[0].data
  }
  let volumeSummary = {}
  if (result && result[1] && result[1].data) {
    volumeSummary = result[1].data
  }
  this.body = {
    clusterSummary,
    volumeSummary
  }
}

