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

const logger = require('../utils/logger.js').getLogger("service_manage")
const constants = require('../constants')
const INSTANCE_MAX_NUM = constants.INSTANCE_MAX_NUM
const INSTANCE_AUTO_SCALE_MAX_CPU = constants.INSTANCE_AUTO_SCALE_MAX_CPU
const INSTANCE_AUTO_SCALE_MAX_MEMORY = constants.INSTANCE_AUTO_SCALE_MAX_MEMORY
const apiFactory = require('../services/api_factory')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
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
  const body = this.request.body
  const services = body.services
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.batchDeleteBy([ cluster, 'services', 'batch-delete' ], null, body)
  // const devOpsApi = apiFactory.getDevOpsApi(loginUser)
  // try {
  //   yield devOpsApi.deleteBy(['cd-rules'], {
  //     cluster,
  //     name: services.join(',')
  //   })
  // } catch (err) {
  //   if (err.statusCode === 403) {
  //     logger.warn("Failed to delete cd rules as it's not permitted")
  //   } else {
  //     throw err
  //   }
  // }
  this.body = {
    cluster,
    data: result,
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
  const lbgroupSettings =  yield api.getBy([cluster, 'proxies'])
  const deployment = (result.data[serviceName] && result.data[serviceName].deployment) || {}
  const volume = (result.data[serviceName] && result.data[serviceName].volume) || {}
  deployment.images = []
  if (deployment.spec) {
    deployment.spec.template.spec.containers.map((container) => {
      deployment.images.push(container.image)
    })
  }
  if (result.data[serviceName] && result.data[serviceName].service) {
    portHelper.addPort(deployment, result.data[serviceName].service, lbgroupSettings.data)
  }
  deployment.volume = volume
  this.body = {
    cluster,
    serviceName,
    data: deployment
  }
}

exports.putEditServiceVolume = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request .body
  const result = yield api.updateBy([cluster, 'services', serviceName, 'volume'], null, body)
  this.body = result
}

exports.getServiceContainers = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const { projectName } = this.request.headers || { projectName: null }
  const headers = {}
  if (projectName) {
    Object.assign(headers, { project: projectName, teamspace: projectName })
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances', 'services', serviceName, 'instances'], this.query, { headers })
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

// update services env
exports.updateServiceContainers = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !Array.isArray(body)) {
    const err = new Error('Body are required.')
    err.status = 400
    throw err
  }
  const params = [{"env":[],"container": serviceName}]
  params[0].env = body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'env'], null, params )
  this.body = {
    data: result
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
    data: autoScale || {}
  }
}

exports.getServiceAutoScaleList = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const query = this.query
  const filter = query.serviceName || ""
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services','autoscale'])
  const tempList = result.data
  var autoScaleList = {}
  let totalCount = 0
  for (let key in tempList){
    if ((filter === "" || key.match(filter) != null || tempList[key].metadata.labels.strategyName.match(filter) != null)){
      totalCount++
      autoScaleList[key] = tempList[key]
    }
  }
  let finialScaleList = {}
  const keys = Object.keys(autoScaleList)
  keys.forEach((key, index) => {
    if (index >= from && index < from + size) {
      finialScaleList[key] = autoScaleList[key]
    }
  })
  this.body = {
    cluster,
    data: finialScaleList || {},
    totalCount
  }
}

exports.autoScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !body.min || !body.max || (!body.cpu && !body.memory && !body.qps)) {
    const err = new Error('min, max, cpu/memory/qps are required.')
    err.status = 400
    throw err
  }
  let min = parseInt(body.min)
  let max = parseInt(body.max)
  let cpu = parseInt(body.cpu)
  let memory = parseInt(body.memory)
  let qps = parseInt(body.qps)
  let scale_strategy_name = body.scale_strategy_name
  let alert_strategy = body.alert_strategy
  let alert_group = body.alert_group
  let type = body.type
  let operationType = body.operationType
  if (min >= max) {
    const err = new Error('max must be bigger then min.')
    err.status = 400
    throw err
  }

  if (cpu && (isNaN(cpu) || cpu < 1 || cpu > INSTANCE_AUTO_SCALE_MAX_CPU)) {
    const err = new Error(`cpu is between 1 and ${INSTANCE_AUTO_SCALE_MAX_CPU}.`)
    err.status = 400
    throw err
  }
  if (memory && (isNaN(memory) || memory < 1 || memory > INSTANCE_AUTO_SCALE_MAX_MEMORY)) {
    const err = new Error(`memory is between 1 and ${INSTANCE_AUTO_SCALE_MAX_MEMORY}.`)
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let result
  if (operationType === 'create') {
    result = yield api.createBy([cluster, 'services', serviceName, 'autoscale'], null, { min, max, cpu ,memory, qps, scale_strategy_name, alert_strategy, alert_group, type })
  } else {
    result = yield api.updateBy([cluster, 'services', serviceName, 'autoscale', scale_strategy_name], null, { min, max, cpu ,memory, qps, alert_strategy, alert_group, type })
  }
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.checkAutoScaleNameExist = function* () {
  const cluster = this.params.cluster
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'services', 'autoscale', 'check-exists'], null, body)
  this.body = result
}

exports.batchUpdateAutoscaleStatus = function* (){
  const cluster = this.params.cluster
  const body = this.request.body
  const { type, services } = body
  if (!body || (type !== 0 && type !== 1) || !services) {
    const err = new Error('type and services are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', 'autoscale','status'], null, body)
  this.body = {
    cluster,
    data: result
  }
}

exports.getAutoScaleLogs = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'autoscale', 'logs'], null)
  this.body = {
    cluster,
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
exports.rollingUpdateServiceRecreate = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([ cluster, 'upgrade', 'services', serviceName, 'recreate'], null, body)
  this.body = {
    cluster,
    serviceName,
    body,
    data: result,
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
  if(targets.onlyRollingUpdate) {
    const result = yield api.updateBy([cluster, 'upgrade', 'services', serviceName, 'rollingupdate'], null, targets)
    this.body = {
      cluster,
      serviceName,
      targets,
      data: result
    }
  } else {
    const result = yield api.updateBy([cluster, 'upgrade', 'services', serviceName, 'grayrelease'], null, targets)
    this.body = {
      cluster,
      serviceName,
      targets,
      data: result
    }
  }
}

exports.rollbackUpdateService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'upgrade', 'services', serviceName, 'rollbackupdate'])
  this.body = {
    cluster,
    serviceName,
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
  const result = yield api.getBy([cluster, 'events', 'replicaset', serviceName, 'events'])
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

//get deployment all pods event
exports.getPodsEventByServicementName = function* () {
  const serviceName = this.params.service_name
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'events', 'services', serviceName, 'pods' ,'events'])
  this.body = {
    cluster,
    serviceName,
    data: result.data || []
  }
}

//获取事件
exports.getDatabaseEvents = function* () {
  const name = this.params.name
  const clusterID = this.params.clusterID
  const type = this.params.type
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([clusterID, 'daas', type, name, 'events'])
  this.body = {
    clusterID,
    name,
    data: result.data || []
  }
}

// Use services for petset events
exports.getDbServiceDetailEvents = function* () {
  //this function for user get the events of detail service
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'events', 'services', serviceName, 'events'])
  const events = result.data || []

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
  const result = yield api.createBy([cluster, 'logs', 'instances', serviceName, 'logs'], null, reqData)
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

exports.setServiceProxyGroup = function* () {
  const cluster = this.params.cluster
  const service = this.params.service
  const groupID = this.params.groupID
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.updateBy([cluster, 'services', service, 'lbgroups', groupID])
  this.status = response.code
  this.body = response
}

exports.getAllService = function*() {
  const cluster = this.params.cluster
	let pageIndex = parseInt(this.query.pageIndex)
	let pageSize = parseInt(this.query.pageSize)
  const query = this.query || {}
  const { project } = this.request.headers || { project: null }
  const headers = {}
  if (project) {
    Object.assign(headers, { project, teamspace: project })
  }
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
  let label = query.label
  if (label) {
    queryObj.filter = `label ${label}`
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.getBy([cluster, 'services'], queryObj, { headers })
  const lbgroupSettings =  yield api.getBy([cluster, 'proxies'])
  if (!response.data) {
    response.data = {
      services: [],
    }
  }
  response.data && response.data.services.map((item) => {
    portHelper.addPort(item.deployment, item.service, lbgroupSettings.data)
    let annotations = item.deployment.spec.template.metadata.annotations
    if (annotations && annotations.appPkgName && annotations.appPkgTag){
      item.deployment["wrapper"] = {
        "appPkgName":annotations.appPkgName,
        "appPkgTag":annotations.appPkgTag
      }
    }
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
  let response = {}
  this.status = 200
  try {
    response = yield api.getBy([cluster, 'services', service, 'certificates'])
  } catch (err) {
    // Skip 404 exception
    if (err && err.statusCode !== 404) {
      this.status = response.code
    }
  }
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

exports.serviceTopology = function* () {
  const cluster = this.params.cluster
  const appName = this.params.appName
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster,'apps',appName,'services'])
  this.status = response.code
  this.body = response.data
}

exports.podTopology = function* () {
  const cluster = this.params.cluster
  const appName = this.params.appName
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster,'apps',appName,'pods'])
  this.status = response.code
  this.body = response.data
}

exports.updateAnnotation = function* () {
  const cluster = this.params.cluster
  const service = this.params.service
  const body = this.request.body
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.updateBy([cluster, 'services', service, 'annotation'], null, body)
  this.body = response
}

exports.updateHostConfig = function* () {
  const cluster = this.params.cluster
  const service = this.params.service
  const body = this.request.body
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.updateBy([cluster, 'services', service, 'host'], null, body)
  this.body = result
}

exports.getISIpPodExisted = function* () {
  const cluster = this.params.cluster
  const ip = this.params.ip
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster,'services', 'is-pod-ip-existed', ip ])
  this.body = result
}

exports.updateServiceConfigGroup = function* () {
  const { cluster, type, name } = this.params
  const { body: { template: body } } = this.request
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.patch(`${cluster}/native/${type}/${name}`, body, {
    headers: {
      'Content-Type': 'application/strategic-merge-patch+json',
    },
  })
  this.body = result
}

exports.getServerInstance = function* () {
  const cluster = this.params.cluster
  const services = this.params.services
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'instances', 'services', services, 'instances' ])
  this.body = result
}
