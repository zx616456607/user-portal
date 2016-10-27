/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Registry controller
 *
 * v0.1 - 2016-10-08
 * @author Zhangpc
 * @author Lei 3rdparty docker registry integration
 */
'use strict'

const registryConfig      = require('../configs/registry')
const apiFactory          = require('../services/api_factory')
const registryService     = require('../services/tenx_registry')
const SpecRegistryService = require('../services/docker_registry')

const securityUtil        = require('../utils/security')
const logger              = require('../utils/logger.js').getLogger("registry")
const crypto              = require('crypto')
const algorithm           = 'aes-256-ctr'

exports.getImages = function* () {
  const registry = this.params.registry
  const loginUser = this.session.loginUser
  /*const config = {
    protocol: registryConfig.ext_server.protocol,
    host: registryConfig.ext_server.host,
    auth: {
      type: 'basic',
      user: registryConfig.user,
      password: registryConfig.password,
    }
  }
  const api = apiFactory.getRegistryApi(config)
  const result = yield api.getBy([registry])*/
  const result = yield registryService.getPublicImages(loginUser.user)
  this.body = {
    registry,
    server: registryConfig.v2Server,
    data: result
  }
}

exports.getPrivateImages = function* () {
  const loginUser = this.session.loginUser
  const result = yield registryService.getPrivateRepositories(loginUser.user, 1)

  this.body = {
    data: result
  }
}

exports.getFavouriteImages = function* () {
  const loginUser = this.session.loginUser
  const result = yield registryService.getFavouriteRepositories(loginUser.user, 1)

  this.body = {
    data: result
  }
}

// content-type of body must be application/json
exports.updateImageInfo = function* () {
  const loginUser = this.session.loginUser
  var properties = this.request.body
  var imageObj = {}
  imageObj.name = this.params.image
  Object.keys(properties).forEach(function(key) {
    imageObj[key] = properties[key]
  })

  const result = yield registryService.updateImageInfo(loginUser.user, imageObj)

  this.body = {
    data: result
  }
}

exports.getImageTags = function* () {
  const registry = this.params.registry
  const imageFullName = this.params.user + '/' + this.params.name
  const loginUser = this.session.loginUser
  const result = yield registryService.getImageTags(loginUser.user, imageFullName)
  this.body = {
    registry,
    server: registryConfig.v2Server,
    name: imageFullName,
    data: result
  }
}

exports.getImageConfigs = function* () {
  const registry = this.params.registry
  const imageFullName = this.params.user + '/' + this.params.name
  const tag = this.params.tag
  const loginUser = this.session.loginUser
  const result = yield registryService.getImageConfigs(loginUser.user, imageFullName, tag)
  this.body = {
    registry,
    server: registryConfig.v2Server,
    name: imageFullName,
    tag,
    data: result
  }
}

exports.getImageInfo = function* () {
  const registry = this.params.registry
  const imageFullName = this.params.user + '/' + this.params.name
  const tag = this.params.tag
  const loginUser = this.session.loginUser
  const result = yield registryService.getImageInfo(loginUser.user, imageFullName)
  // this.status = result.code
  this.body = {
    registry,
    server: registryConfig.v2Server,
    name: imageFullName,
    data: result
  }
}

/*
Methods below only for thirdparty(custom) docker registry integration
*/
// Add custom docker registry to the database repository
exports.addPrivateRegistry = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const reqData = this.request.body
  const api = apiFactory.getManagedRegistryApi(loginUser)
  // Encrypt the password before save to database
  reqData.encrypted_password = securityUtil.encryptContent(reqData.password, loginUser.token, algorithm)
  const result = yield api.createBy([name], null, reqData)

  this.status = result.code
  this.body = result
}
// Remove custom docker registry from database repository
exports.deletePrivateRegistry = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id

  const api = apiFactory.getManagedRegistryApi(loginUser)
  const result = yield api.delete(id)

  this.status = result.code
  this.body = result
}
// List custom docker registries
exports.getPrivateRegistries = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getManagedRegistryApi(loginUser)
  // Get the list of private docker registry
  const result = yield api.get()

  this.status = result.code
  this.body = {
      server: registryConfig.v2Server,
      data: result.data
  }
}
// List repositories of custom docker registry
exports.specListRepositories = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getCatalog()

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}
// Get the tags of specified image
exports.specGetImageTags = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id
  const image = this.params.image

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getImageTags(image)

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}
// Get the config info of specified image and tag
exports.specGetImageTagInfo = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id
  const image = this.params.image
  const tag = this.params.tag

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getImageTagInfo(image, tag)

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}

exports.specGetImageTagSize = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id
  const image = this.params.image
  const tag = this.params.tag

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getImageTagSize(image, tag)

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}
// Get registry server information
function* _getRegistryServerInfo(session, user, id){
  var serverInfo = {}
  // Try to get from session first
  if (session.registries && session.registries[id]) {
    serverInfo = {
      "server":     session.registries[id].server,
      "authServer": session.registries[id].authServer,
      "username":   session.registries[id].username,
      "password":   session.registries[id].password
    }
  } else {
    // Get from API server and save to session
    if (!session.registries) {
      session.registries = {}
    }
    const api = apiFactory.getManagedRegistryApi(user)
    // Get the list of private docker registry
    const result = yield api.get()
    if (result.code === 200) {
      for (var i in result.data) {
        if (result.data[i].id === id) {
          // Add registry info to session
          session.registries[id] = {
            "server":     result.data[i].url,
            "authServer": result.data[i].auth_url,
            "username":   result.data[i].username,
            "password":   result.data[i].encrypted_password
          }
          serverInfo = session.registries[id]
          break
        }
      }
    }
  }
  return serverInfo
}

exports.imageStore = function *() {
  const store  = this.request.body
  if (store) {
    this.code = 200
    this.body = '更新成功！'
  }
}