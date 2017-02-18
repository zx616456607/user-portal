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

exports.getClusterNodes = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster

  const api = apiFactory.getApi(loginUser)
  const result = yield api.clusters.getBy([cluster, 'nodes']);
  const clusters = result.data || []

  let podList = [];
  clusters.nodes.nodes.map((node) => {
    podList.push(node.objectMeta.name);
  });
  let cpuBody = {
    type: 'cpu/usage_rate',
    source: 'prometheus'
  }
  const cpuList = yield api.clusters.getBy([cluster, 'nodes', podList, 'metrics'], cpuBody);
  for(let key in cpuList) {
    if(key != 'statusCode') {
      cpuList[key].name = key;
    }
  }

  let memoryBody = {
    type: 'memory/usage',
    source: 'prometheus'
  }
  const memoryList = yield api.clusters.getBy([cluster, 'nodes', podList, 'metrics'], memoryBody);
  for(let key in memoryList) {
    if(key != 'statusCode') {
      memoryList[key].name = key;
    }
  }

  this.status = result.code
  this.body = {
    data: {
      clusters,
      cpuList,
      memoryList
    }
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