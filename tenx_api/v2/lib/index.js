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

  // ~ licenses
  this.licenses = collections.create('licenses')

  // ~ admin
  this.admin = collections.create('admin')

  // ~ overview
  this.overview = collections.create('overview')

  // ~ watch
  this.watch = collections.create('watch')

  // ~ integration
  this.integrations = collections.create('integrations')

  // ~ consumptions
  this.consumptions = collections.create('consumptions')

  // ~ tenxcloud docker registries - spi for internal usage
  this.tenxregistries = collections.create('tenx-registries')

  // ~ tenxcloud docker registries - api
  this.tenxhubs = collections.create('tenx-hubs')

  // ~ vsersions
  this.versions = collections.create('versions')

  // ~ config
  this.configs = collections.create('configs')

  // ~ openstack
  this.openstack = collections.create('openstack')

  //  ~images
  this.images = collections.create('images')

  // TODO: remove this
  // ~ alerts
  this.alerts = collections.create('alerts')
  // ~ email
  this.email = collections.create('email')
  // ~ dingDing
  this.ding = collections.create('ding')
  // ~ labels
  this.labels = collections.create('labels')

  // ~ oem
  this.oem = collections.create('oem')

  // ~ project
  this.projects = collections.create('projects')

  // ~ autoscaler
  this.autoscaler = collections.create('autoscaler')

  // ~ scheduler
  this.scheduler = collections.create('scheduler')

  // service-mesh
  this.servicemesh = collections.create('servicemesh')

  ////////////////////////////////////////////////////////////////////////////////////
  ///////////////  Standard mode (Public Clould Only) ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  // ~ certificates
  this.certificates = collections.create('certificates')

  // ~ payments
  this.payments = collections.create('payments')

  // ~ user-preference
  this['user-preference'] = collections.create('user-preference')

  // ~ user-directory
  this['user-directory'] = collections.create('user-directory')

  // ~permission
  this.permission = collections.create('permission')

  // ~role
  this.role = collections.create('role')

  // ~ pkg
  this.pkg = collections.create('pkg')

  // ~ services
  this.services = collections.create('services')

  // ~ vminfos
  this.vminfos = collections.create('vminfos')

  // ~ vmtomcat
  this.vmtomcats = collections.create('vmtomcats')

  // ~ vmjdk
  this.jdks = collections.create('jdks')

  // ~ vm tomcats
  this.tomcats = collections.create('tomcats')

  // ~ quota
  this.resourcequota = collections.create('resourcequota')

  // ~ clean
  this.cleaner = collections.create('cleaner')

  // ~ appstore
  this.appstore =  collections.create('appstore')

  // ~ auth
  this.auth = collections.create('auth')

  // ~ ai
  this.ai = collections.create('ai')

  // ~ appcenters
  this.appcenters = collections.create('appcenters')

  // ~ workorders
  this.workorders = collections.create('workorders')
}
