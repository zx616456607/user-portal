/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * VM wrap controller
 *
 * v0.1 - 2017-07-20
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.createService = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const body = this.request.body

  const result = yield api.services.createBy([ 'create' ], null, body)
  this.body = result
}

exports.listServices = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const query = this.query

  const result = yield api.services.getBy([ 'list' ], query)
  this.body = result
}

exports.updateService = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const body = this.request.body
  const serviceId = this.params.service_id

  const result = yield api.services.updateBy([ serviceId, 'update' ], null, body)
  this.body = result
}

exports.deleteService = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const serviceId = this.params.service_id
  const query = this.query

  const result = yield api.services.deleteBy([ serviceId, 'delete' ], query)
  this.body = result
}

exports.deployService = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const serviceId = this.params.service_id

  const result = yield api.services.updateBy([ serviceId, 'deployment' ])
  this.body = result
}

exports.addVM = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const body = this.request.body

  const result = yield api.vminfos.createBy([ 'create' ], null, body)
  this.body = result
}

exports.listVMs = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const query = this.query

  const result = yield api.vminfos.getBy([ 'list' ], query)
  this.body = result
}

exports.vmLimit = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const query = this.query

  const result = yield api.vminfos.getBy([ 'limit' ], query)
  this.body = result
}

exports.updateVM = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const body = this.request.body
  const vmId = this.params.vm_id

  const result = yield api.vminfos.updateBy([ vmId, 'update' ], null, body)
  this.body = result
}

exports.deleteVM = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const vmId = this.params.vm_id
  const query = this.query
  const result = yield api.vminfos.deleteBy([ vmId, 'delete' ], query)
  this.body = result
}

exports.checkVM = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const body = this.request.body

  const result = yield api.vminfos.createBy([ 'check' ], null, body)
  this.body = result
}

exports.checkService = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const serviceName = this.params.serviceName
  const query = this.query
  const result = yield api.services.getBy([ serviceName, 'exists' ],query)
  this.body = result
}

exports.checkVminfo = function* (){
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const vminfo = this.params.vminfo
  const query = this.query
  const result = yield api.vminfos.getBy([ vminfo,'exists'],query)
  this.body = result
}

exports.listVMTomcat = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const query = this.query
  const result = yield api.vmtomcats.getBy([ 'list' ], query)
  this.body = result
}

exports.listVMJdks = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const query = this.query
  const result = yield api.jdks.getBy([ 'list' ], query)
  this.body = result
}

exports.listVMTomcatVersions = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const query = this.query
  const result = yield api.tomcats.getBy([ 'list' ], query)
  this.body = result
}

exports.deleteTomcat = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const id = this.params.id
  const query = this.query

  const result = yield api.vmtomcats.deleteBy([ id, 'delete' ], query)
  this.body = result
}

exports.createTomcat = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const body = this.request.body
  const result = yield api.vmtomcats.createBy([ 'create' ], null, body)
  this.body = result
}

exports.importService = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const body = this.request.body

  const result = yield api.services.createBy([ 'import' ], null, body)
  this.body = result
}

exports.getVMPorts = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const vm_id = this.params.vm_id
  const result = yield api.vminfos.getBy([ vm_id, 'ports' ])
  this.body = result
}

exports.changeStatus = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const tomcat_id = this.params.tomcat_id
  const { isOn } = this.query
  let result
  if (isOn && isOn === 'true') {
    result = yield api.vmtomcats.updateBy([ tomcat_id, 'start' ])
  } else {
    result = yield api.vmtomcats.updateBy([ tomcat_id, 'stop' ])
  }
  this.body = result
}
