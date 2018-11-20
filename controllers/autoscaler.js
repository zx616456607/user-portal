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
  this.body = yield api.clusters.getBy(['autoscaler', 'server' ])
}

exports.getCluster = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.getBy(['autoscaler',  'clusterstatus' ])
}


exports.createServer = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body
  const { iaas } = body
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.createBy(['autoscaler', 'server', iaas ], null, body)
}

exports.updateServer = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body
  const { iaas } = body
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.updateBy(['autoscaler', 'server', iaas ], null, body)
}

exports.deleteServer = function* () {
  const loginUser = this.session.loginUser
  const { cluster ,type } = this.request.query
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.deleteBy(['autoscaler', 'server', cluster, type ])
}


exports.getApps = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.getBy(['autoscaler', 'app' ])
}

exports.createApp = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  const type = body.iaas
  this.body = yield api.clusters.createBy(['autoscaler', 'app', type ], null, body)
}

exports.updateApp = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const body = this.request.body
  const { iaas } = body
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.updateBy(['autoscaler', 'app', iaas ], null, body)
}

exports.deleteApp = function* () {
  const loginUser = this.session.loginUser
  const { cluster, type } = this.request.query
  const body = this.request.body
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.deleteBy(['autoscaler', 'app', cluster, type ], null, body)
}

exports.setAppsStatus = function* () {
  const loginUser = this.session.loginUser
  const { cluster, type } = this.request.query
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.getBy(['autoscaler', 'app', 'status', cluster, type ])
}

exports.getLogs = function* () {
  const loginUser = this.session.loginUser
  const { cluster } = this.request.query
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.getBy(['autoscaler', 'app', 'log', cluster ])
}

exports.getRes = function* () {
  const loginUser = this.session.loginUser
  const { cluster, type } = this.request.query
  const api = apiFactory.getApi(loginUser)
  this.body = yield api.clusters.getBy(['autoscaler', 'resource', cluster, type ])
}

