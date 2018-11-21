/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Status identify tools
 * v0.1 - 2016-11-21
 * @author Zhangpc
 */
import cloneDeep from 'lodash/cloneDeep'
const CONTAINER_MAX_RESTART_COUNT = 5
/**
 * Get container status
 * return one of [Pending, Running, Terminating, Failed, Unknown, Abnormal]
 */
export function getContainerStatus(container) {
  const { metadata } = container
  const { deletionTimestamp } = metadata
  const status = container.status || { phase: 'Pending' }
  if (deletionTimestamp) {
    status.phase = 'Terminating'
  }
  const { conditions, containerStatuses } = status
  let restartCount = 0
  let phase = status.phase
  if (conditions) {
    conditions.every(condition => {
      if (condition.type !== 'Ready' && condition.status !== 'True') {
        phase = 'Pending'
        return false
      }
      return true
    })
  }
  if (containerStatuses) {
    containerStatuses.map(containerStatus => {
      // const { ready } = containerStatus
      const containerRestartCount = containerStatus.restartCount
      if (containerRestartCount > restartCount) {
        restartCount = containerRestartCount
        if (!containerStatus.state || !containerStatus.state.running) {
          // state 不存在或 state 不为 running
          phase = 'Abnormal'
        }
      }
    })
    if (restartCount >= CONTAINER_MAX_RESTART_COUNT) {
      status.phase = phase
      status.restartCount = restartCount
    }
  }
  return status
}

/**
 * Get service status
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getServiceStatus(_service) {
  const service = cloneDeep(_service)
  const { status, metadata } = service
  if (!metadata.annotations) {
    metadata.annotations = {}
  }
  const specReplicas = service.spec.replicas
  let replicas = specReplicas
  if (replicas === undefined) {
    replicas = metadata.annotations[`system/replicas`]
  }
  let availableReplicas = 0
  if (!status) {
    return {
      phase: 'Stopped',
      availableReplicas: 0,
      replicas
    }
  }
  availableReplicas = status.availableReplicas || 0
  status.availableReplicas = availableReplicas
  let {
    phase,
    updatedReplicas,
    unavailableReplicas,
    observedGeneration,
    readyReplicas,
  } = status
  const { strategy = {} } = service.spec || {}
  if (status.replicas > specReplicas && strategy.type === 'RollingUpdate') {
    const newCount = metadata.annotations['rollingupdate/newCount']
    if (newCount === undefined) {
      phase = 'ScrollRelease'
    } else {
      phase = 'RollingUpdate'
    }
    return {
      phase,
      availableReplicas,
      replicas
    }
  }
  status.replicas = replicas
  if (phase && phase !== 'Running') {
    return status
  }
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && availableReplicas > 0) {
    status.phase = 'Stopping'
    return status
  }
  if (observedGeneration >= metadata.generation && replicas === updatedReplicas && readyReplicas > 0) {
    status.availableReplicas = readyReplicas
    status.phase = 'Running'
    return status
  }
  /* if (unavailableReplicas > 0 && (!availableReplicas || availableReplicas < replicas)) {
    status.phase = 'Pending'
  } */
  if (specReplicas > 0 && availableReplicas < 1) {
    status.unavailableReplicas = specReplicas
    status.phase = 'Pending'
    return status
  }
  if (updatedReplicas && unavailableReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
    return status
  }
  if (availableReplicas < 1) {
    status.phase = 'Stopped'
    return status
  }
  status.phase = 'Running'
  return status
}

/**
 * Get service status by containers
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getServiceStatusByContainers(service, containers) {
  if (!containers || containers.length <= 0) {
    return getServiceStatus(service)
  }
  let availableReplicas = 0
  containers.map(container => {
    let { phase } = getContainerStatus(container)
    if (phase === 'Running') {
      availableReplicas++
    }
  })
  if (!service.status) {
    service.status = {}
  } else if (service.status.phase !== 'RollingUpdate') {
    delete service.status.phase
  }
  service.status.availableReplicas = availableReplicas
  return getServiceStatus(service)
}

/**
 * Get app status by services list
 * return one of [Running, Pending, Stopped, Unknown]
 */
export function getAppStatus(services) {
  if (!services) {
    return
  }
  const appStatus = {
    replicas: services.length,
    availableReplicas: 0,
    unavailableReplicas: 0,
  }
  let serviceTotalReplicas = 0
  services.map(service => {
    let serviceStatus = getServiceStatus(service)
    let { availableReplicas, unavailableReplicas, replicas } = serviceStatus
    serviceTotalReplicas += replicas
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
    if (serviceTotalReplicas === 0) {
      appStatus.phase = 'Stopping'
    }
  } else {
    appStatus.phase = 'Unknown'
  }
  return appStatus
}
