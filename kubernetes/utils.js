/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Utilities functions for k8s
 * v0.1 - 2016-10-28
 * @author Zhangpc
 */
'use strict'

const constants = require('../constants')
const DEFAULT_CONTAINER_RESOURCES = constants.DEFAULT_CONTAINER_RESOURCES
const DEFAULT_CONTAINER_RESOURCES_MEMORY = constants.DEFAULT_CONTAINER_RESOURCES_MEMORY

exports.getResourcesByMemory = function (memory) {
  let resources = DEFAULT_CONTAINER_RESOURCES
  memory = parseInt(memory || DEFAULT_CONTAINER_RESOURCES_MEMORY)
  switch (memory) {
    case 256:
      return resources
    case 512:
      resources.limits.memory = '512Mi'
      resources.requests.cpu = '125m'
      resources.requests.memory = '512Mi'
      break
    case 1024:
      resources.limits.memory = '1024Mi'
      resources.requests.cpu = '250m'
      resources.requests.memory = '1024Mi'
      break
    case 2048:
      resources.limits.memory = '2048Mi'
      resources.requests.cpu = '500m'
      resources.requests.memory = '2048Mi'
      break
    case 4096:
      resources.limits.memory = '4096Mi'
      resources.requests.cpu = '700m'
      resources.requests.memory = '4096Mi'
    case 8192:
      resources.limits.memory = '8192Mi'
      resources.requests.cpu = '1200m'
      resources.requests.memory = '8192Mi'
      break
    case 16384:
      resources.limits.memory = '16384Mi'
      resources.requests.cpu = '3000m'
      resources.requests.memory = '16384Mi'
      break
  }
  return resources
}