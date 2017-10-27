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

  const result = yield api.services.deleteBy([ serviceId, 'delete' ])
  this.body = result
}

exports.deployService = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getVMWrapApi(loginUser)
  const serviceId = this.params.service_id

  const result = yield api.services.createBy([ serviceId, 'deployment' ])
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

  const result = yield api.vminfos.deleteBy([ vmId, 'delete' ])
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
