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
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

exports.getContainers = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size < 1 || size > 100) {
    size = DEFAULT_PAGE_SIZE
  }
  const from = size * (page - 1)
  const queryObj = { from, size }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances'], queryObj)
  const pods = result.data.instances || []
  pods.map((pod) => {
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  this.body = {
    cluster,
    data: pods,
    total: result.data.total,
    count: result.data.count,
  }
}

exports.getContainerDetail = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.container_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances', containerName, 'detail'])
  const pod = result.data || {}
  pod.images = []
  if (pod.spec) {
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  }
  this.body = {
    cluster,
    containerName,
    data: pod
  }
}

exports.getContainerDetailEvents = function* () {
  //this function for user get the events of detail container
  const cluster = this.params.cluster;
  const containerName = this.params.container_name;
  const loginUser = this.session.loginUser;
  const api = apiFactory.getK8sApi(loginUser);
  const result = yield api.getBy([cluster, 'instances', containerName, 'events'])
  const events = result.data || {}
  /*pod.events = []
  if (pod.data) {
    pod.data.map((eventDetail) => {
      pod.events.push(eventDetail)
    })
  }*/
  this.body = {
    cluster,
    containerName,
    data: events
  }
}

exports.getContainerLogs = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.name
  const reqData = this.request.body
  const api = apiFactory.getK8sApi(this.session.loginUser) 
  const result = yield api.createBy([cluster, 'instances', containerName, 'logs'], null, reqData)
  this.status = result.code
  this.body = result
}

