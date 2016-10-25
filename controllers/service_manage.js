/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Service manage controller
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.startServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', 'batch-start'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}

exports.stopServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', 'batch-stop'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}

exports.restartServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', 'batch-restart'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}


exports.deleteServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.batchDeleteBy([cluster, 'services', 'batch-delete'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}

exports.getServicesStatus = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.quickRestartServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  // quickrestart !!
  const result = yield api.updateBy([cluster, 'services', 'quickrestart'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}

exports.getServiceDetail = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName])
  const service = result.data[serviceName] || {}
  service.images = []
  if (service.spec) {
    service.spec.template.spec.containers.map((container) => {
      service.images.push(container.image)
    })
  }
  this.body = {
    cluster,
    serviceName,
    data: service
  }
}

exports.getServiceContainers = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'instances'])
  const pods = result.data.instances || []
  pods.map((pod) => {
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  this.body = {
    cluster,
    serviceName,
    data: pods,
    total: result.data.total,
    count: result.data.count,
  }
}

exports.manualScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !body.num) {
    const err = new Error('Num is required.')
    err.status = 400
    throw err
  }
  let num = parseInt(num)
  if (isNaN(num) || num < 1 || num > 10) {
    const err = new Error('Num is between 1 and 10.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'manualscale'], null, { number: num })
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.autoScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !body.min || !body.max || !body.cpu) {
    const err = new Error('min, max, cpu are required.')
    err.status = 400
    throw err
  }
  let min = parseInt(body.min)
  let max = parseInt(body.max)
  let cpu = parseInt(body.cpu)
  if (isNaN(min) || min < 1 || min > 10) {
    const err = new Error('min is between 1 and 10.')
    err.status = 400
    throw err
  }
  if (isNaN(max) || max < 1 || max > 10) {
    const err = new Error('max is between 2 and 10.')
    err.status = 400
    throw err
  }
  if (min >= max) {
    const err = new Error('max must be lager then min.')
    err.status = 400
    throw err
  }
  if (isNaN(cpu) || cpu < 1 || cpu > 99) {
    const err = new Error('cpu is between 1 and 99.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'autoscale'], null, { min, max, cpu })
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.changeServiceQuota = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !body.quota) {
    const err = new Error('Num is required.')
    err.status = 400
    throw err
  }
  let quota = body.quota
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'quota'], null, { quota })
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.changeServiceHa = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !body.quota) {
    const err = new Error('Num is required.')
    err.status = 400
    throw err
  }
  let ha = body.ha
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'ha'], null, { ha })
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.rollingUpdateService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const targets = this.request.body
  if (!targets) {
    const err = new Error('Targets are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'rollingupdate'], null, targets)
  this.body = {
    cluster,
    serviceName,
    targets,
    data: result
  }
}

exports.bindServiceDomain = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const reqData = this.request.body
  if(!reqData.port || !reqData.domain) {
    const err = new Error('port and domain is required')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.createBy([cluster, 'services', serviceName, 'binddomain'], null, reqData)
  this.status = result.code
  this.body = result
}

exports.deleteServiceDomain = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const reqData = this.request.body
  if (!reqData.port || !reqData.domain) {
    const err = new Error('port and domain is required')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.updateBy([cluster, 'services', serviceName, 'binddomain'], null, reqData)
  this.status = result.code
  this.body = result
}

exports.getServiceDetailEvents = function* () {
  //this function for user get the events of detail service
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'events'])
  const events = result.data || []
  //eventList.events = []
  //if (eventList.data) {
  //  eventList.data.map((eventDetail) => {
  //    eventList.events.push(eventDetail)
  //  })
  //}
  this.body = {
    cluster,
    serviceName,
    data: events
  }
}

exports.getServiceLogs = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const reqData = this.request.body
  reqData.kind = 'service'
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.createBy([cluster, 'instances', serviceName, 'logs'], null, reqData)
  this.status = result.code
  this.body = result
}

exports.getServicePorts = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster,  'services', serviceName, 'k8s-service'])
  this.status = result.code
  this.body = result
}