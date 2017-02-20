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

const constants = require('../constants')
const INSTANCE_MAX_NUM = constants.INSTANCE_MAX_NUM
const INSTANCE_AUTO_SCALE_MAX_CPU = constants.INSTANCE_AUTO_SCALE_MAX_CPU
const apiFactory = require('../services/api_factory')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const portHelper = require('./port_helper')

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
  const deployment = (result.data[serviceName] && result.data[serviceName].deployment) || {}
  deployment.images = []
  if (deployment.spec) {
    deployment.spec.template.spec.containers.map((container) => {
      deployment.images.push(container.image)
    })
  }
  if (result.data[serviceName] && result.data[serviceName].service) {
    portHelper.addPort(deployment, result.data[serviceName].service)
  }
  this.body = {
    cluster,
    serviceName,
    data: deployment
  }
}

exports.getServiceContainers = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'instances'])
  const instances = result.data.instances || []
  instances.map((pod) => {
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  this.body = {
    cluster,
    serviceName,
    data: instances,
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
  let num = parseInt(body.num)
  if (isNaN(num) || num < 1 || num > INSTANCE_MAX_NUM) {
    const err = new Error(`Num is between 1 and ${INSTANCE_MAX_NUM}.`)
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

exports.getServiceAutoScale = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'autoscale'])
  const autoScale = result.data || {}
  this.body = {
    cluster,
    serviceName,
    data: autoScale[serviceName] || {}
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
  if (isNaN(min) || min < 1 || min > INSTANCE_MAX_NUM) {
    const err = new Error(`min is between 1 and ${INSTANCE_MAX_NUM}.`)
    err.status = 400
    throw err
  }
  if (isNaN(max) || max < 1 || max > INSTANCE_MAX_NUM) {
    const err = new Error(`max is between 2 and ${INSTANCE_MAX_NUM}.`)
    err.status = 400
    throw err
  }
  if (min >= max) {
    const err = new Error('max must be bigger then min.')
    err.status = 400
    throw err
  }
  if (isNaN(cpu) || cpu < 1 || cpu > INSTANCE_AUTO_SCALE_MAX_CPU) {
    const err = new Error(`cpu is between 1 and ${INSTANCE_AUTO_SCALE_MAX_CPU}.`)
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

exports.delServiceAutoScale = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'services', serviceName, 'autoscale'])
  const autoScale = result.data || {}
  this.body = {
    cluster,
    serviceName,
    data: result.data || {}
  }
}

exports.changeServiceQuota = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'quota'], null, body)
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
  if (!body) {
    const err = new Error('Body are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'ha'], null, body)
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
    const err = new Error('targets are required.')
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
  if (!reqData.port || !reqData.domain) {
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

exports.getReplicasetDetailEvents = function* () {
  //this function for user get the events of detail service
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'replicaset', serviceName, 'events'])
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

exports.getK8sService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'k8s-service'])
  this.status = result.code
  this.body = result
}

exports.checkServiceName = function* () {
  const cluster = this.params.cluster
  const service = this.params.service
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster, 'services', service, 'existence'])
  this.status = response.code
  this.body = response
}

exports.getAllService = function*() {
  const cluster = this.params.cluster
	let pageIndex = parseInt(this.query.pageIndex)
	let pageSize = parseInt(this.query.pageSize)
	const query = this.query || {}
	if(isNaN(pageIndex)) {
    pageIndex = DEFAULT_PAGE	
	}
	if(isNaN(pageSize)) {
    pageSize = DEFAULT_PAGE_SIZE	
	}
  let name = query.name	
  const queryObj = {
    from: (pageIndex - 1)* pageSize,
		size: pageSize
	}
	if (name) {
    queryObj.filter = `name ${name}` 	
	}
  const api = apiFactory.getK8sApi(this.session.loginUser)
	const response = yield api.getBy([cluster, 'services'], queryObj, null)
	this.status = response.code
  response.data.services.map((item) => {
    portHelper.addPort(item.deployment, item.service)
  })
	this.body = response
}

exports.updateServicePortInfo = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name
  const body = this.request.body
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.updateBy([cluster, 'services', service, 'portinfo'], null, body)
  this.status = response.code
  this.body = response
}

exports.updateCertificate = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name
  const body = this.request.body
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }

  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.createBy([cluster, 'services', service, 'certificates'], null, body)
  this.status = response.code
  this.body = response
}

exports.getCertificate = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name

  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.getBy([cluster, 'services', service, 'certificates'])

  this.status = response.code
  this.body = response
}

exports.deleteCertificate = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name

  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.deleteBy([cluster, 'services', service, 'certificates'])
  this.status = response.code
  this.body = response
}


exports.toggleHTTPs = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name
  const action = this.query.action
  if (action !== 'on' && action !== 'off') {
    const err = new Error('action invalid')
    err.status = 400
    throw err
  }
  const queryObj = {
    action: action,
	}

  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.updateBy([cluster, 'services', service, 'tls'], queryObj)
  this.status = 200
  this.body = {}
}