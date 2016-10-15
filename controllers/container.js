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

exports.getContainers = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances'])
  const pods = result.data || []
  pods.map((pod) => {
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  this.body = {
    cluster,
    data: pods
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