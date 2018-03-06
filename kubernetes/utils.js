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
const clone = require('lodash/cloneDeep')
const DEFAULT_CONTAINER_RESOURCES = constants.DEFAULT_CONTAINER_RESOURCES
const DEFAULT_CONTAINER_RESOURCES_MEMORY = constants.DEFAULT_CONTAINER_RESOURCES_MEMORY
const ENTERPRISE_MODE = require('../configs/constants').ENTERPRISE_MODE
const mode = require('../configs/model').mode
const enterpriseFlag = ENTERPRISE_MODE == mode
exports.getResources = function (memory, cpu, limitMemory, limitCpu) {
  let resources = clone(DEFAULT_CONTAINER_RESOURCES)
  const intMemory = parseInt(memory || DEFAULT_CONTAINER_RESOURCES_MEMORY)
  if (memory && limitMemory) {
    resources.limits.memory = `${limitMemory}Mi`
    resources.requests.memory = `${memory}Mi`
  } else {
    switch (intMemory) {
      case 256:
        return resources
      case 512:
        resources.limits.memory = '512Mi'
        resources.requests.memory = '512Mi'
        resources.limits.cpu = '1000m'
        resources.requests.cpu = '200m'
        break
      case 1024:
        resources.limits.memory = '1024Mi'
        resources.requests.memory = '1024Mi'
        resources.limits.cpu = '1000m'
        resources.requests.cpu = '400m'
        break
      case 2048:
        resources.limits.memory = '2048Mi'
        resources.requests.memory = '2048Mi'
        resources.limits.cpu = '1000m'
        resources.requests.cpu = '800m'
        break
      case 4096:
        resources.limits.memory = '4096Mi'
        resources.requests.memory = '4096Mi'
        resources.limits.cpu = '1000m'
        resources.requests.cpu = '1000m'
        break
      case 8192:
        resources.limits.memory = '8192Mi'
        resources.requests.memory = '8192Mi'
        resources.limits.cpu = '2000m'
        resources.requests.cpu = '2000m'
        break
      case 16384:
        resources.limits.memory = '16384Mi'
        resources.requests.memory = '16384Mi'
        resources.limits.cpu = '4000m'
        resources.requests.cpu = '4000m'
        break
      default:
        resources.limits.memory = `${limitMemory}Mi`
        resources.requests.memory = `${memory}Mi`
    }
  }
  if (enterpriseFlag && cpu) {
    resources.requests.cpu = `${cpu}m`
    resources.limits.cpu = `${limitCpu}m`
  }
  return resources
}
// only enterprise
// add cpu back
// cpu add requests only
// cpu显示问题