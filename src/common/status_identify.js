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

export function getContainerStatus(container) {
  const { status, metadata } = container
  const { deletionTimestamp } = metadata
  if (deletionTimestamp) {
    status.phase = 'Terminating'
  }
  return status
}

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
      status.phase = 'Starting'
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

export function getAppStatus(services) {
  const appStatus = {
    replicas: services.length,
    availableReplicas: 0,
  }
  services.map(service => {
    let serviceStatus = getServiceStatus(service)
    let { availableReplicas } = serviceStatus
    if (availableReplicas > 0) {
      appStatus.availableReplicas++
    }
  })
  if (appStatus.availableReplicas === 0) {
    appStatus.phase = 'Stopped'
  } else if (appStatus.availableReplicas > 0) {
    appStatus.phase = 'Running'
  } else {
    appStatus.phase = 'Unknown'
  }
  return appStatus
}