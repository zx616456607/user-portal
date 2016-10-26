/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/24
 * @author ZhaoXueYu
 */
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX, METRICS_CPU, METRICS_MEMORY, METRICS_NETWORK_RECEIVED, METRICSS_NETWORK_TRANSMITTED } from '../constants'
import { toQuerystring } from '../common/tools'

// ~~ container
// cpu
export const METRICS_CONTAINER_CPU_REQUEST = 'METRICS_CONTAINER_CPU_REQUEST'
export const METRICS_CONTAINER_CPU_SUCCESS = 'METRICS_CONTAINER_CPU_SUCCESS'
export const METRICS_CONTAINER_CPU_FAILURE = 'METRICS_CONTAINER_CPU_FAILURE'

function fetchContainerMetricsCPU(cluster, serviceName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/metrics`
  query.type = METRICS_CPU
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [METRICS_CONTAINER_CPU_REQUEST, METRICS_CONTAINER_CPU_SUCCESS, METRICS_CONTAINER_CPU_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadContainerMetricsCPU(cluster, serviceName, query) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsCPU(cluster, serviceName, query))
  }
}

// memory
export const METRICS_CONTAINER_MEMORY_REQUEST = 'METRICS_CONTAINER_MEMORY_REQUEST'
export const METRICS_CONTAINER_MEMORY_SUCCESS = 'METRICS_CONTAINER_MEMORY_SUCCESS'
export const METRICS_CONTAINER_MEMORY_FAILURE = 'METRICS_CONTAINER_MEMORY_FAILURE'

function fetchContainerMetricsMemory(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${containerName}/metrics`
  query.type = METRICS_MEMORY
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_CONTAINER_MEMORY_REQUEST, METRICS_CONTAINER_MEMORY_SUCCESS, METRICS_CONTAINER_MEMORY_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadContainerMetricsMemory(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsMemory(cluster, containerName, query))
  }
}

// networkReceived
export const METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST = 'METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST'
export const METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS = 'METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS'
export const METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE = 'METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE'

function fetchContainerMetricsNetworkReceived(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${containerName}/metrics`
  query.type = METRICS_NETWORK_RECEIVED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST, METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS, METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadContainerMetricsNetworkReceived(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsNetworkReceived(cluster, containerName, query))
  }
}

// networkTransmitted
export const METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST = 'METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST'
export const METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS = 'METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS'
export const METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE = 'METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE'

function fetchContainerMetricsNetworkTransmitted(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${containerName}/metrics`
  query.type = METRICSS_NETWORK_TRANSMITTED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST, METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS, METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadContainerMetricsNetworkTransmitted(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsNetworkTransmitted(cluster, containerName, query))
  }
}

// ~~ service
// cpu
export const METRICS_SERVICE_CPU_REQUEST = 'METRICS_SERVICE_CPU_REQUEST'
export const METRICS_SERVICE_CPU_SUCCESS = 'METRICS_SERVICE_CPU_SUCCESS'
export const METRICS_SERVICE_CPU_FAILURE = 'METRICS_SERVICE_CPU_FAILURE'

function fetchServiceMetricsCPU(cluster, serviceName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/metrics`
  query.type = METRICS_CPU
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [METRICS_SERVICE_CPU_REQUEST, METRICS_SERVICE_CPU_SUCCESS, METRICS_SERVICE_CPU_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadServiceMetricsCPU(cluster, serviceName, query) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsCPU(cluster, serviceName, query))
  }
}

// memory
export const METRICS_SERVICE_MEMORY_REQUEST = 'METRICS_SERVICE_MEMORY_REQUEST'
export const METRICS_SERVICE_MEMORY_SUCCESS = 'METRICS_SERVICE_MEMORY_SUCCESS'
export const METRICS_SERVICE_MEMORY_FAILURE = 'METRICS_SERVICE_MEMORY_FAILURE'

function fetchServiceMetricsMemory(cluster, serviceName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/metrics`
  query.type = METRICS_MEMORY
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [METRICS_SERVICE_MEMORY_REQUEST, METRICS_SERVICE_MEMORY_SUCCESS, METRICS_SERVICE_MEMORY_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadServiceMetricsMemory(cluster, serviceName, query) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsMemory(cluster, serviceName, query))
  }
}

// networkReceived
export const METRICS_SERVICE_NETWORK_RECEIVED_REQUEST = 'METRICS_SERVICE_NETWORK_RECEIVED_REQUEST'
export const METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS = 'METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS'
export const METRICS_SERVICE_NETWORK_RECEIVED_FAILURE = 'METRICS_SERVICE_NETWORK_RECEIVED_FAILURE'

function fetchServiceMetricsNetworkReceived(cluster, serviceName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/metrics`
  query.type = METRICS_NETWORK_RECEIVED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [METRICS_SERVICE_NETWORK_RECEIVED_REQUEST, METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS, METRICS_SERVICE_NETWORK_RECEIVED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadServiceMetricsNetworkReceived(cluster, serviceName, query) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsNetworkReceived(cluster, serviceName, query))
  }
}

// networkTransmitted
export const METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST = 'METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST'
export const METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS = 'METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS'
export const METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE = 'METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE'

function fetchServiceMetricsNetworkTransmitted(cluster, serviceName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/metrics`
  query.type = METRICSS_NETWORK_TRANSMITTED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST, METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS, METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadServiceMetricsNetworkTransmitted(cluster, serviceName, query) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsNetworkTransmitted(cluster, serviceName, query))
  }
}