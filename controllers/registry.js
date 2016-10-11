/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Registry controller
 * 
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */
'use strict'

const registryConfig = require('../configs/registry')
const apiFactory = require('../services/api_factory')
const registryService = require('../services/registry')

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