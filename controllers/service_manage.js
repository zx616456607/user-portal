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
  const pods = result.data || []
  pods.map((pod) => {
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  this.body = {
    cluster,
    serviceName,
    data: pods
  }
}

exports.manualScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.autoScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.changeServiceQuota = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.changeServiceHa = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.bindServiceDomain = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  this.body = {
    cluster,
    serviceName
  }
}

exports.getServiceDetailEvents = function* () {
  //this function for user get the events of detail service
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'events'])
  const eventList = result.data || []
  eventList.events = []
  if (eventList.data) {
    eventList.data.map((eventDetail) => {
      eventList.events.push(eventDetail)
    })
  }
  this.body = {
    cluster,
    serviceName,
    data: eventList
  }
}