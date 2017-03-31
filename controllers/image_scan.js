/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author YangYuBiao
 */

'use strict'
const apiFactory = require('../services/api_factory')
const imageScanConfig = require('../configs/image_scan')
const registrieApi = require('../registry/index')
const SpecRegistryService = require('../services/docker_registry')
const securityUtil = require('../utils/security')
const logger = require('../utils/logger.js').getLogger("imageScan")
const algorithm = 'aes-256-ctr'
const parse = require('co-busboy')
const formStream = require('formstream')
const mime = require('mime')

exports.getScanStatus = function* () {
  const body = this.query
  if (!body.imageName || !body.tag) {
    const err = new Error('imageName and tag is require')
    err.status = 400
    throw err
  }
  let manifest = ''
  if (body.isThird) {
    if (!body.registryID) {
      const err = new Error('registryID is require')
      err.status = 400
      throw err
    }
    const loginUser = this.session.loginUser
    let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, body.registryId)

    // If find the valid registry info
    if (serverInfo.server) {
      logger.info("Found the matched registry config ...")
      // Get the real password before pass to registry service
      let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
      let registryConfig = JSON.parse(JSON.stringify(serverInfo))
      registryConfig.password = realPassword
      let specRegistryService = new SpecRegistryService(registryConfig)
      var self = this
      var result = yield specRegistryService.getImageTagInfo(body.imageName, body.tag, true)
      manifest = result.result
    } else {
      const err = new Error('The registry is invalid')
      err.status = 400
      throw err
    }
  } else {
    const registryApi = apiFactory.getRegistryApi()
    const result = yield thunkToPromise(registryApi.getImageJsonInfoV2, registryApi)(this.session.loginUser.user, body.imageName, body.tag)
    if (!result.length) {
      throw result
    }
    if (result[0] != 200) {
      const err = result[2]
      err.status = result[0]
      throw err
    }
    manifest = result[1]
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const response = yield api.createBy(['scan-status'], null, {
    manifest: JSON.stringify(manifest)
  })
  this.body = response
}

exports.getLayerInfo = function* () {
  const body = this.query
  if (!body.imageName || !body.tag) {
    const err = new Error('imageName and tag is require')
    err.status = 400
    throw err
  }
  let manifest = ''
  if (body.isThird) {
    if (!body.registryID) {
      const err = new Error('registryID is require')
      err.status = 400
      throw err
    }
    const loginUser = this.session.loginUser
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
      var result = yield specRegistryService.getImageTagInfo(body.imageName, body.tag, true)
      manifest = result.result
    } else {
      const err = new Error('The registry is invalid')
      err.status = 400
      throw err
    }
  } else {
    const registryApi = apiFactory.getRegistryApi()
    const result = yield thunkToPromise(registryApi.getImageJsonInfoV2, registryApi)(this.session.loginUser.user, body.imageName, body.tag)
    if (!result.length) {
      throw result
    }
    if (result[0] != 200) {
      const err = result[2]
      err.status = result[0]
      throw err
    }
    manifest = result[1]
  }

  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const response = yield api.createBy(['layer-info'], null, {
    manifest: JSON.stringify(manifest)
  })
  this.body = response
}

exports.getLyins = function* () {
  const blobSum = this.query.blob_sum
  if (!blobSum) {
    const err = new Error('blob_sum is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const response = yield api.getBy(['level1-result'], { blob_sum: blobSum })
  this.body = response
}

exports.getClair = function* () {
  const blobSum = this.query.blob_sum
  if (!blobSum) {
    const err = new Error('blob_sum is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const response = yield api.getBy(['level2-result'], { blob_sum: blobSum })
  this.body = response
}

exports.scan = function* () {
  const body = this.request.body
  if (!body.registry || !body.imageName || !body.tag || !body.cluster_id) {
    const err = new Error('registry, imageName, tag, cluster_id is require')
    err.status = 400
    throw err
  }
  let manifest = ''
  let token = ''
  if (body.isThird) {
    if (!body.registryID) {
      const err = new Error('registryID is require')
      err.status = 400
      throw err
    }
    const loginUser = this.session.loginUser
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
      var result = yield specRegistryService.getImageTagInfo(body.imageName, body.tag, true)
      manifest = result.result
      const tokenResult = yield thunkToPromise(specRegistryService.refreshToken, specRegistryService)('repository')
      if (tokenResult[0] != 200) {
        const err = new Error('get registry token failed')
        err.status = tokenResult[0]
        throw err
      }
      token = tokenResult[1]
    } else {
      const err = new Error('The registry is invalid')
      err.status = 400
      throw err
    }
  } else {
    const registryApi = apiFactory.getRegistryApi()
    const result = yield thunkToPromise(registryApi.refreshToken, registryApi)(this.session.loginUser.user, body.imageName)
    if (!result.length || result[0]) {
      throw result
    }
    if (result[1].statusCode != 200) {
      const err = new Error('Internal Error')
      err.status = result[0]
      throw err
      return
    }
    token = result[2]
    const tokenResult = yield thunkToPromise(registryApi.getImageJsonInfoV2, registryApi)(this.session.loginUser.user, body.imageName, body.tag)
    if (!tokenResult.length) {
      throw result
    }
    if (tokenResult[0] != 200) {
      const err = tokenResult[2]
      err.status = tokenResult[0]
      throw err
    }
    manifest = tokenResult[1]
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const response = yield api.createBy(['scan'], { cluster_id: body.cluster_id }, {
    manifest: JSON.stringify(manifest),
    registry: body.registry,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  this.body = response
}

exports.uploadFile = function* () {
  const parts = parse(this, {
    autoFields: true
  })
  if (!parts) {
    const err = new Error('The file is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const cluster = this.params.cluster
  const fileStream = yield parts
  const stream = formStream()
  if (!fileStream || !fileStream.filename) {
    const err = new Error('The file is require')
    err.status = 400
    throw err
  }
  const fileName = fileStream.filename
  const extendName = fileName.substring(fileName.lastIndexOf('.') + 1)
  if (extendName != 'tar') {
    const err = new Error('The file must be *.tar')
    err.status = 400
    throw err
  }
  const mimeType = mime.lookup(fileStream.filename)
  stream.stream(fileStream.filename, fileStream, fileName, mimeType)
  let response = yield api.uploadFile(['scan-rules'], null, stream, stream.headers())
  this.body = response
}

function thunkToPromise(fn, self) {
  let isCalled = false
  return function () {
    const arg = Array.prototype.slice.apply(arguments)
    if (isCalled) return
    isCalled = true
    return new Promise((resolve, reject) => {
      arg.push(function () {
        isCalled = false
        resolve(arguments)
      })
      arg.push(true)
      fn.apply(self, arg)
    }).catch(err => {
      return err
    })
  }
}



// Get registry server information
function* _getRegistryServerInfo(session, user, id) {
  var serverInfo = {}
  // Try to get from session first
  if (session.registries && session.registries[id]) {
    serverInfo = {
      "server": session.registries[id].server,
      "authServer": session.registries[id].authServer,
      "username": session.registries[id].username,
      "password": session.registries[id].password
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
            "server": result.data[i].url,
            "authServer": result.data[i].auth_url,
            "username": result.data[i].username,
            "password": result.data[i].encrypted_password
          }
          serverInfo = session.registries[id]
          break
        }
      }
    }
  }
  return serverInfo
}
