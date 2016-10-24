/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Metrics manage controller
 *
 * v0.1 - 2016-10-20
 * @author Zhangpc
 */
'use strict'

const constants = require('../constants')
const METRICS_DEFAULT_SOURCE = constants.METRICS_DEFAULT_SOURCE
const apiFactory = require('../services/api_factory')

exports.getContainerMetrics = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.container_name
  const query = this.query
  const user = this.session.loginUser
  if (!query.type) {
    let err = new Error('type is required.')
    err.status = 406
    throw err
  }
  const result = yield _getContainerMetrics(user, cluster, containerName, query)
  this.status = result.statusCode
  this.body = {
    cluster,
    containerName,
    data: result
  }
}

exports.getServiceMetrics = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const query = this.query
  const user = this.session.loginUser
  if (!query.type) {
    let err = new Error('type is required.')
    err.status = 406
    throw err
  }
  const api = apiFactory.getK8sApi(user)
  const result = yield api.getBy([cluster, 'services', serviceName, 'instances'])
  const instances = result.data.instances || []
  const promiseArray = instances.map((instance) => {
    let containerName = instance.metadata.name
    return _getContainerMetrics(user, cluster, containerName, query)
  })
  const results = yield promiseArray
  this.body = {
    cluster,
    serviceName,
    data: results
  }
}

exports.getAppMetrics = function () {
  //
}

function _getContainerMetrics(user, cluster, containerName, query) {
  const type = query.type
  const source = query.source || METRICS_DEFAULT_SOURCE
  const start = query.start
  const end = query.end
  const queryObj = {
    type,
    source,
    start,
    end
  }
  const api = apiFactory.getK8sApi(user)
  return api.getBy([cluster, 'instances', containerName, 'metrics'], queryObj).then(function (result) {
    return {
      containerName,
      [type]: result.metrics || [],
      statusCode: result.statusCode
    }
  })
}