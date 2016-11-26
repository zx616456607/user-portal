/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Status identify tools
 * v0.1 - 2016-11-21
 * @author Zhangpc
 */
import { TENX_MARK } from '../constants'

/**
 * Get container status
 * return one of [Pending, Running, Terminating, Failed, Unknown]
 */
export function getContainerStatus(container) {
  const { status, metadata } = container
  const { deletionTimestamp } = metadata
  if (deletionTimestamp) {
    status.phase = 'Terminating'
  }
  return status
}

/**
 * Get service status
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getServiceStatus(service) {
  const { status, metadata } = service
  if (!status.availableReplicas) {
    status.availableReplicas = 0
  }
  let {
    phase,
    availableReplicas,
    updatedReplicas,
    unavailableReplicas,
    observedGeneration,
  } = status
  if (!metadata.annotations) {
    metadata.annotations = {}
  }
  const replicas = service.spec.replicas || metadata.annotations[`${TENX_MARK}/replicas`]
  status.replicas = replicas
  if (!phase) {
    if (unavailableReplicas > 0 && (!availableReplicas || availableReplicas < replicas)) {
      status.phase = 'Pending'
    } else if (observedGeneration >= metadata.generation && replicas === updatedReplicas) {
      status.availableReplicas = updatedReplicas
      status.phase = 'Running'
    } else if (updatedReplicas && unavailableReplicas) {
      status.phase = 'Deploying'
      status.progress = { status: false }
    } else if (availableReplicas < 1) {
      status.phase = 'Stopped'
    } else {
      status.phase = 'Running'
    }
  }
  return status
}

/**
 * Get app status by services list
 * return one of [Running, Pending, Stopped, Unknown]
 */
export function getAppStatus(services) {
  const appStatus = {
    replicas: services.length,
    availableReplicas: 0,
    unavailableReplicas: 0,
  }
  services.map(service => {
    let serviceStatus = getServiceStatus(service)
    let { availableReplicas, unavailableReplicas } = serviceStatus
    if (availableReplicas > 0) {
      appStatus.availableReplicas++
    }
    if (unavailableReplicas > 0) {
      appStatus.unavailableReplicas++
    }
  })
  let { availableReplicas, unavailableReplicas } = appStatus
  if (availableReplicas === 0 && unavailableReplicas > 0) {
    appStatus.phase = 'Pending'
  } else if (availableReplicas === 0) {
    appStatus.phase = 'Stopped'
  } else if (availableReplicas > 0) {
    appStatus.phase = 'Running'
  } else {
    appStatus.phase = 'Unknown'
  }
  return appStatus
}