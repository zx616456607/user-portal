/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster AutoScaler controller
 *
 * v0.1 - 2018-04-08
 * @author Rensw
 */
'use strict'
const yaml = require('js-yaml')
const apiFactory = require('../services/api_factory')
const Deployment = require('../kubernetes/objects/deployment')
const Service = require('../kubernetes/objects/service')
const constants = require('../constants')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const portHelper = require('./port_helper')

exports.getServers = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.autoscaler.getBy([ 'server' ])
}

exports.createServer = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.autoscaler.createBy([ 'server' ], null, body)
}

exports.updateServer = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.autoscaler.updateBy([ 'server' ], null, body)
}

exports.deleteServer = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.autoscaler.deleteBy([ 'server' ], null, body)
}
