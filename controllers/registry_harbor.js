/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Registry controller for Harbor
 *
 * v0.1 - 2017-06-02
 */
'use strict'

const logger     = require('../utils/logger.js').getLogger("registry_harbor")
const harborAPIs = require('../registry/lib/harborAPIs')
const registryConfigLoader = require('../registry/registryConfigLoader')
const apiFactory   = require('../services/api_factory')
const securityUtil = require('../utils/security')

// Get projects from harbor server
exports.searchProjects = function* () {
  const registry = this.params.registry
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var q = query.q || ""
  let authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(getRegistryConfig(), authInfo)
  const result = yield new Promise(function (resolve, reject) {
    harborAPI.searchProjects(q, function(err, statusCode, projects) {
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        reject("Error from request: " + statusCode)
        return
      }
      resolve(projects)
    })
  })
  this.body = {
    server: getRegistryConfig().url,
    data: result
  }
}

// [GET] /jobs/replication
exports.getReplicationJobs = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationJobs(ctx.query, callback))

// [DELETE] /jobs/replication/{id}
exports.deleteReplicationJob = harborHandler(
  (harbor, ctx, callback) => harbor.deleteReplicationJob(ctx.params.id, callback))

// [GET] /jobs/replication/{id}/log
exports.getReplicationJobLogs = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationJobLogs(ctx.params.id, callback))

// [GET] /policies/replication
exports.getReplicationPolicies = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationPolicies(ctx.query, callback))

// [POST] /policies/replication
exports.newReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.newReplicationPolicy(ctx.request.body, callback))

// [GET] /policies/replication/{id}
exports.getReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationPolicy(ctx.params.id, callback))

// [PUT] /policies/replication/{id}
exports.modifyReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.modifyReplicationPolicy(ctx.params.id, ctx.request.body, callback))

// [PUT] /policies/replication/{id}/enablement  -- { enable: 0 } / { enable: 1 }
exports.enableReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.enableReplicationPolicy(ctx.params.id, ctx.request.body, callback))

// [GET] /targets
exports.getReplicationTargets = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationTargets(ctx.query, callback))

// [POST] /targets
exports.newReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.newReplicationTarget(ctx.request.body, callback))

// [POST] /targets/ping
exports.pingReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.pingReplicationTarget(ctx.request.body, callback))

// [POST] /targets/{id}/ping
exports.pingReplicationTargetByID = harborHandler(
  (harbor, ctx, callback) => harbor.pingReplicationTargetByID(ctx.params.id, callback))

// [PUT] /targets/{id}
exports.modifyReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.modifyReplicationTarget(ctx.params.id, ctx.request.body, callback))

// [GET] /targets/{id}
exports.getReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationTarget(ctx.params.id, callback))

// [DELETE] /targets/{id}
exports.deleteReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.deleteReplicationTarget(ctx.params.id, callback))

// [GET] /targets/{id}/policies
exports.getReplicationTargetRelatedPolicies = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationTargetRelatedPolicies(ctx.params.id, callback))

function getRegistryConfig() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    return registryConfigLoader.GetRegistryConfig()
  }
  // Default registry url
  return {url: "localhost"}
}

function harborHandler(handler) {
  return function* () {
    const config = getRegistryConfig()
    const loginUser = this.session.loginUser
    const auth = yield getAuthInfo(loginUser)
    const harbor = new harborAPIs(config, auth)
    const result = yield new Promise((resolve, reject) => {
      handler(harbor, this, (err, statusCode, result) => {
        if (err) {
          reject(err)
        } else if (statusCode > 300) {
          err = new Error("call harbor native api failed")
          err.status = statusCode
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
    this.body = {
      data: result
    }
  }
}
/*
Get registry auth info from user session
*/
function* getAuthInfo(loginUser) {
  return securityUtil.decryptContent(loginUser.registryAuth)
}
