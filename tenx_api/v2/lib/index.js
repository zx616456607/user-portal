/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Tenxcloud API service
 *
 * v0.1 - 2016-09-12
 * @author Zhangpc
 */
'use strict'
// protocol, host, version, auth, timeout
module.exports = function (config) {
  if (!config.host) {
    const error = new TypeError('host must be provided')
    error.status = 400
    throw error
  }
  // Some api do not need auth: login ...
  /*if (!config.auth) {
    const error = new TypeError('auth info must be provided')
    error.status = 400
    throw error
  }*/
  const request = require('./request')(config.protocol, config.host, config.api_prefix,
    config.version, config.auth, config.timeout)

  // ~~~~~ PUBLIC

  const Collections = require('./collections')
  const collections = new Collections(request)

  // ~ cluster
  this.clusters = collections.create('clusters')

  //~ volumes
  this.volumes = collections.create('volumes')

  // service
  // this.service = collections.create('service')

  // ~ managed docker registries
  this.registries = collections.create('registries')

  // ~ app templates
  this.templates = collections.create('templates')

  // ~ audits
  this.audits = collections.create('audits')

  // ~ users
  this.users = collections.create('users')

  // ~ teams
  this.teams = collections.create('teams')

  // ~ devops
  this.devops = collections.create('devops')

  // ~ license
  this.license = collections.create('license')

  // ~ overview
  this.overview = collections.create('overview')

  // ~ watch
  this.watch = collections.create('watch')
  
  // ~ integration
  this.integrations = collections.create('integrations')

  // ~ consumptions
  this.consumptions = collections.create('consumptions')
}