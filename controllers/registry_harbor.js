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
const apiFactory = require('../services/api_factory')

var HarborAuthCache = []

// Get projects from harbor server
exports.searchProjects = function* () {
  const registry = this.params.registry
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var q = query.q || ""
  let authInfo = yield getAuthInfo(getRegistryConfig().url, loginUser)
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

function getRegistryConfig() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    return registryConfigLoader.GetRegistryConfig()
  }
  // Default registry url
  return {url: "localhost"}
}

/*
Cache user/habor auth info, get from k8s secret if miss cache
*/
function* getAuthInfo(registry, loginUser) {
  // Initialize the registry auth cache
  registry = registry.replace('http://', '').replace('https://', '')
  if (!HarborAuthCache[registry]) {
    HarborAuthCache[registry] = []
  }
  if (HarborAuthCache[registry][loginUser.user]) {
    return HarborAuthCache[registry][loginUser.user]
  } else {
    // Request API to get from secret
    const api = apiFactory.getApi(loginUser)
    const result = yield api.registries.getBy([registry, 'secrets'], null)
    HarborAuthCache[registry][loginUser.user] = result.data.authHeader
  }
  return HarborAuthCache[registry][loginUser.user]
}