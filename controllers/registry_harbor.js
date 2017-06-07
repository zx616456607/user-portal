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
const constants = require('../constants')
const utils = require('../utils')

const securityUtil = require('../utils/security')

// [GET] /users/current
exports.getCurrentUser = harborHandler(
  (harbor, ctx, callback) => harbor.getCurrentUser(callback))

// [GET] /projects?page=1&page_size=10&page_name=test&is_public=1
exports.getProjects = harborHandler(
  (harbor, ctx, callback) => harbor.getProjects(ctx.query, callback))

// [POST] /projects
exports.createProject = harborHandler(
  (harbor, ctx, callback) => harbor.createProject(ctx.request.body, callback))

// [GET] /projects/:project_id
exports.getProjectDetail = harborHandler(
  (harbor, ctx, callback) => harbor.getProjectDetail(ctx.params.project_id, callback))

// [DELETE] /projects/:project_id
exports.deleteProject = harborHandler(
  (harbor, ctx, callback) => harbor.deleteProject(ctx.params.project_id, callback))

// [PUT] /projects/:project_id/publicity
exports.updateProjectPublicity = harborHandler(
  (harbor, ctx, callback) => harbor.updateProjectPublicity(ctx.params.project_id, ctx.request.body, callback))

// [GET] /repositories
exports.getProjectRepositories = harborHandler(
  (harbor, ctx, callback) => harbor.getProjectRepositories(ctx.query, callback))

// [GET] /statistics
exports.getStatistics = harborHandler(
  (harbor, ctx, callback) => {
    const query = utils.isEmptyObject(ctx.query) ? null : ctx.query
    harbor.getStatistics(query, callback)
  })

/*------------------log start------------------------*/
exports.getLogs = harborHandler(
  (harbor, ctx, callback) => {
    const query = utils.isEmptyObject(ctx.query) ? null : ctx.query
    harbor.getLogs(query, callback)
  })

exports.getProjectLogs = harborHandler(
  (harbor, ctx, callback, headers) => {
    const projectID = ctx.params.projectID
    const query = utils.isEmptyObject(ctx.query) ? null : ctx.query
    const body = ctx.request.body
    body.project_id = parseInt(projectID)
    harbor.getProjectLogs(projectID, query, body, callback)
  })

/*------------------log end-------------------------*/


/*------------------systeminfo start--------------------------------*/

exports.getSystemInfo = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getSystemInfo(callback)
  })

exports.getSystemInfoVolumes = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getSystemInfoVolumes(callback)
  })

exports.getSystemInfoCert = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getSystemInfoCert(callback)
  })
/*------------------systeminfo end--------------------------------*/


/*------------------configurations start--------------------------------*/

exports.getConfigurations = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getConfigurations(callback)
  })

exports.updateConfigurations = harborHandler(
  (harbor, ctx, callback) => {
    const body = utils.isEmptyObject(ctx.request.body) ? null : ctx.request.body
    harbor.updateConfigurations(body, callback)
  })

exports.resetConfigurations = harborHandler(
  (harbor, ctx, callback) => {
    harbor.resetConfigurations(callback)
  })
/*------------------configurations end--------------------------------*/
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

/*------------------log start------------------------*/
exports.getLogs = function* () {
  const loginUser = this.session.loginUser
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const query = utils.isEmptyObject(this.query) ? null : this.query
  const result = yield new Promise((resolve, reject) => {
    harborAPI.getLogs(query, (err, statusCode, logs) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(logs)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}

exports.getProjectLogs = function* () {
  const loginUser = this.session.loginUser
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const projectID = this.params.projectID
  const query = utils.isEmptyObject(this.query) ? null : this.query
  const body = this.request.body
  body.project_id = parseInt(projectID)
  const result = yield new Promise((resolve, reject) => {
    harborAPI.getProjectLogs(projectID, query, body, (err, statusCode, logs) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(logs)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}
/*------------------log end-------------------------*/


/*------------------systeminfo start--------------------------------*/
exports.getSystemInfo = function* () {
  const loginUser = this.session.loginUser
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const result = yield new Promise((resolve, reject) => {
    harborAPI.getSystemInfo((err, statusCode, logs) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(logs)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}

exports.getSystemInfoVolumes = function* () {
  const loginUser = this.session.loginUser
  if(loginUser.role != constants.ADMIN_ROLE) {
    const err = new Error('No admin user')
    throw err
  }
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const result = yield new Promise((resolve, reject) => {
    harborAPI.getSystemInfoVolumes((err, statusCode, volumes) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(volumes)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}

exports.getSystemInfoCert = function* () {
  const loginUser = this.session.loginUser
  if(loginUser.role != constants.ADMIN_ROLE) {
    const err = new Error('No admin user')
    throw err
  }
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const result = yield new Promise((resolve, reject) => {
    harborAPI.getSystemInfoCert((err, statusCode, cert) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(cert)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}
/*------------------systeminfo end--------------------------------*/


/*------------------configurations start--------------------------------*/
exports.getConfigurations = function* () {
  const loginUser = this.session.loginUser
  if(loginUser.role != constants.ADMIN_ROLE) {
    const err = new Error('No admin user')
    throw err
  }
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const result = yield new Promise((resolve, reject) => {
    harborAPI.getConfigurations((err, statusCode, configurations) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(configurations)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}

exports.updateConfigurations = function* () {
  const loginUser = this.session.loginUser
  if(loginUser.role != constants.ADMIN_ROLE) {
    const err = new Error('No admin user')
    throw err
  }
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const body = utils.isEmptyObject(this.request.body) ? null : this.request.body
  const result = yield new Promise((resolve, reject) => {
    harborAPI.updateConfigurations(body, (err, statusCode, updateResult) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(updateResult)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}

exports.resetConfigurations = function* () {
  const loginUser = this.session.loginUser
  if(loginUser.role != constants.ADMIN_ROLE) {
    const err = new Error('No admin user')
    throw err
  }
  const registryConfig = getRegistryConfig()
  const authInfo = yield getAuthInfo(loginUser)
  const harborAPI = new harborAPIs(registryConfig, authInfo)
  const result = yield new Promise((resolve, reject) => {
    harborAPI.resetConfigurations((err, statusCode, resetResult) => {
      if(err) {
        return reject(err)
      }
      if(statusCode > 300) {
        return reject(`Error from request: ${statusCode}`)
      }
      resolve(resetResult)
    })
  })
  this.body = {
    server: registryConfig.url,
    data: result
  }
}
/*------------------configurations end--------------------------------*/

function getRegistryConfig() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    return registryConfigLoader.GetRegistryConfig()
  }
  // Default registry url
  return {url: "localhost"}
}

/*
Get registry auth info from user session
*/
function* getAuthInfo(loginUser) {
  return securityUtil.decryptContent(loginUser.registryAuth)
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
          resolve({ result, headers })
        }
      })
    })
    const body = {
      server: getRegistryConfig().url,
      data: result.result,
    }
    const total = result.headers['x-total-count']
    if (total !== undefined) {
      body.total = parseInt(total)
    }
    this.body = body
  }
}
/*
Get registry auth info from user session
*/
function* getAuthInfo(loginUser) {
  return securityUtil.decryptContent(loginUser.registryAuth)
}
