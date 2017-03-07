/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster node controller
 *
 * v0.1 - 2017-2-8
 * @author Gaojian
 */
'use strict'

const apiFactory = require('../services/api_factory')
const constants = require('../constants')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const DEFAULT_LICENSE = {
  max_nodes: 5
}

exports.getClusterNodes = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster

  const api = apiFactory.getApi(loginUser)
  const reqArray = []
  reqArray.push(api.clusters.getBy([cluster, 'nodes']))
  reqArray.push(api.licenses.getBy(["merged"]))
  const reqArrayResult = yield reqArray
  const clusters = reqArrayResult[0].data || []
  const license = reqArrayResult[1].data || DEFAULT_LICENSE
  if (!license.max_nodes || license.max_nodes < DEFAULT_LICENSE.max_nodes) {
    license.max_nodes = DEFAULT_LICENSE.max_nodes
  }
  let cpuList
  let memoryList
  try {
    let podList = [];
    clusters.nodes.nodes.map((node) => {
      podList.push(node.objectMeta.name);
    });
    let cpuBody = {
      type: 'cpu/usage_rate',
      source: 'prometheus'
    }
    let memoryBody = {
      type: 'memory/usage',
      source: 'prometheus'
    }
    const metricsReqArray = []
    metricsReqArray.push(api.clusters.getBy([cluster, 'nodes', podList, 'metrics'], cpuBody))
    metricsReqArray.push(api.clusters.getBy([cluster, 'nodes', podList, 'metrics'], memoryBody))
    const metricsReqArrayResult = yield metricsReqArray
    cpuList = metricsReqArrayResult[0]
    memoryList = metricsReqArrayResult[1]
    for(let key in cpuList) {
      if(key != 'statusCode') {
        cpuList[key].name = key;
      }
    }
    for(let key in memoryList) {
      if(key != 'statusCode') {
        memoryList[key].name = key;
      }
    }
  } catch (error) {
    // Catch error for show node list
  }

  this.body = {
    data: {
      clusters,
      cpuList,
      memoryList,
      license
    }
  }
}

// For bind node when create service(lite only)
exports.getNodes = function* (){
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'nodes']);
  this.body = {
    cluster,
    data: result.data,
  }
}

exports.changeNodeSchedule = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const schedulable = this.request.body

  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.createBy([cluster, 'nodes', node, 'schedule'], null, schedulable);

  this.status = result.code
  this.body = {
    data: result.data
  }
}

exports.deleteNode = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node

  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.deleteBy([cluster, 'nodes', node]);

  this.status = result.code
  this.body = {
    data: result.data
  }
}

exports.getKubectls = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'kubectls'])
  this.body = result.data
}

exports.getAddNodeCMD = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const spi = apiFactory.getApi(loginUser)
  const result = yield spi.clusters.getBy([cluster, 'add'])
  this.body = result.data
}
// cluster node detail pod list
exports.getPodlist = function* () {
  const cluster = this.params.cluster
  const node = this.params.node
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.getBy([cluster, 'nodes', node, 'podlist'])
  this.body = result.data
}
// host info
exports.getClustersInfo = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster,'nodes',node])
  this.body = result ? result.data : {}
}
//  host metrics
exports.getClustersMetrics = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const node = this.params.node
  const type = this.params.type
  const api = apiFactory.getK8sApi(loginUser)
  let querys = {
    source: 'prometheus',
    type: 'cpu/usage_rate'
  }
  if (type == 'memory') {
    querys.type = 'memory/usage'
  }
  const result = yield api.getBy([cluster,'nodes',node,'metrics'],querys)
  this.body = result
}

exports.getAddClusterCMD = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getApi(loginUser)
  const result = yield spi.clusters.getBy(['add'])
  this.body = result.data
}