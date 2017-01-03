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

const apiFactory = require('../services/api_factory')

// TODO: should we break down these methods as it's bad proformance for overview
exports.getClusterOverview = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  let queryObj = { cluster}
  const api = apiFactory.getApi(loginUser)
  const k8sapi = apiFactory.getK8sApi(loginUser)
  const result =
      yield [api.overview.getBy(["space-operations"], queryObj),
             api.overview.getBy(["clusters", cluster, "system-info"]),
             api.overview.getBy(["clusters", cluster, "storagestatus"]),
             api.overview.getBy(["clusters", cluster, "appstatus"]),
             api.overview.getBy(["clusters", cluster, "nodesummary"]),
             k8sapi.getBy([cluster, "dbservices"]),
             api.overview.getBy(["clusters", cluster, "space-consumption"]),]
  let operations = {}
  if (result && result[0] && result[0].data) {
    operations = result[0].data
  }
  let sysinfo = {}
  if (result && result[1] && result[1].data) {
    sysinfo = result[1].data
  }
  let storage = {}
  if (result && result[2] && result[2].data) {
    storage = result[2].data
  }
  let appstatus = {}
  if (result && result[3] && result[3].data) {
    appstatus = result[3].data
  }
  let nodesummary = {}
  if (result && result[4] && result[4].data) {
    nodesummary = result[4].data
  }
  let dbservices = {}
  if (result && result[5] && result[5].data) {
    dbservices = result[5].data
  }
  let spaceconsumption = {}
  if (result && result[6] && result[6].data) {
    spaceconsumption = result[6].data
  }
  this.body = {
    operations,
    sysinfo,
    storage,
    appstatus,
    nodesummary,
    dbservices,
    spaceconsumption,
  }
}

// add the overview for standard version
exports.getStdClusterOverview = function* () {
  let cluster = this.params.cluster_id
  const loginUser = this.session.loginUser
  let queryObj = { cluster}
  const api = apiFactory.getApi(loginUser)
  const k8sapi = apiFactory.getK8sApi(loginUser)
  const result =
      yield [api.overview.getBy(["space-operations"], queryObj),
             api.overview.getBy(["clusters", cluster, "system-info"]),
             api.overview.getBy(["clusters", cluster, "storagestatus"]),
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
  let queryObj = { cluster}
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
}

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