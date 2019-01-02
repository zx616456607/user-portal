/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * sysServiceManage controller
 *
 * v0.1 - 2018-12-26
 * @author songsz
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getServiceList = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cluster = this.params.cluster
  const query = this.query
  this.body = yield api.getBy([ cluster, 'services', 'system' ], query)
}

exports.getServiceLogs = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const { cluster, service } = this.params
  this.body = yield  api.getBy([ cluster, 'logs', 'instances', service, 'logs' ], this.query)
}

exports.getPodMetrics = function* () {
  /*const queryData = [{
    type: 'cpu/usage_rate',
    key: 'cpu',
  }, {
    type: 'memory/usage',
    key:'memory',
  }, {
    type:'network/rx_rate',
    key:'rxRate',
  }, {
    type: 'network/tx_rate',
    key:'txRate',
  }, {
    type: 'disk/readio',
    key:'diskReadIo',
  }, {
    type: 'disk/writeio',
    key:'diskWriteIo',
  }]*/
  this.body = {}
  const loginUser = this.session.loginUser
  const { cluster, pods } = this.params
  const { types, ...otherQuery } = this.query
  if (!types) return
  const queryData = types.split(',')
    .filter(item =>
      ['cpu/usage_rate', 'memory/usage', 'network/rx_rate', 'network/tx_rate',  'disk/readio',  'disk/writeio'].includes(item)
    )
  const api = apiFactory.getK8sApi(loginUser)
  ;(yield queryData.map(type => (
    api.getBy([cluster, 'metric', 'instances', pods, 'metrics'], {
      ...otherQuery,
      type,
      source: 'prometheus',
    })
  ))).map((r, i) => {
    const { statusCode, ...others } = r
    this.body[queryData[i]] = {
      isFetching: false,
      data: Object.keys(others).map(containerName => ({
        containerName,
        metrics: others[containerName].metrics,
      }))
    }
  })
}
