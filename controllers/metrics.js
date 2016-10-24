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

const DEFAULT_SOURCE = 'influxdb'
const apiFactory = require('../services/api_factory')

exports.getContainerMetrics = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.container_name
  const query = this.query
  const type = query.type
  if (!type) {
    let err = new Error('type is required.')
    err.status = 406
    throw err
  }
  const source = query.source || DEFAULT_SOURCE
  const start = query.start
  const end = query.end
  const queryObj = {
    type,
    source,
    start,
    end
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances', containerName, 'metrics'], queryObj)
  this.body = {
    cluster,
    containerName,
    data: {
      [type]: result.metrics || []
    }
  }
}

exports.getServiceMetrics = function () {
  //
}

exports.getAppMetrics = function () {
  //
}