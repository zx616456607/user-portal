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

//CPU
export const METRICS_CPU_REQUEST = 'METRICS_CPU_REQUEST'
export const METRICS_CPU_SUCCESS = 'METRICS_CPU_SUCCESS'
export const METRICS_CPU_FAILURE = 'METRICS_CPU_FAILURE'

function fetchMetricsCPU(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
  query.type = METRICS_CPU
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_CPU_REQUEST, METRICS_CPU_SUCCESS, METRICS_CPU_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadMetricsCPU(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchMetricsCPU(cluster, containerName, query))
  }
}

//memory
export const METRICS_MEMORY_REQUEST = 'METRICS_MEMORY_REQUEST'
export const METRICS_MEMORY_SUCCESS = 'METRICS_MEMORY_SUCCESS'
export const METRICS_MEMORY_FAILURE = 'METRICS_MEMORY_FAILURE'

function fetchMetricsMemory(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
  query.type = METRICS_MEMORY
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_MEMORY_REQUEST, METRICS_MEMORY_SUCCESS, METRICS_MEMORY_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadMetricsMemory(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchMetricsMemory(cluster, containerName, query))
  }
}
//NETWORK_RECEIVED networkReceived
export const METRICS_NETWORK_RECEIVED_REQUEST = 'METRICS_NETWORK_RECEIVED_REQUEST'
export const METRICS_NETWORK_RECEIVED_SUCCESS = 'METRICS_NETWORK_RECEIVED_SUCCESS'
export const METRICS_NETWORK_RECEIVED_FAILURE = 'METRICS_NETWORK_RECEIVED_FAILURE'

function fetchMetricsNetworkReceived(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
  query.type = METRICS_NETWORK_RECEIVED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_NETWORK_RECEIVED_REQUEST, METRICS_NETWORK_RECEIVED_SUCCESS, METRICS_NETWORK_RECEIVED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadMetricsNetworkReceived(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchMetricsNetworkReceived(cluster, containerName, query))
  }
}
//NETWORK_TRANSMITTED networkTransmitted
export const METRICS_NETWORK_TRANSMITTED_REQUEST = 'METRICS_NETWORK_TRANSMITTED_REQUEST'
export const METRICS_NETWORK_TRANSMITTED_SUCCESS = 'METRICS_NETWORK_TRANSMITTED_SUCCESS'
export const METRICS_NETWORK_TRANSMITTED_FAILURE = 'METRICS_NETWORK_TRANSMITTED_FAILURE'

function fetchMetricsNetworkTransmitted(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
  query.type = METRICSS_NETWORK_TRANSMITTED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_NETWORK_TRANSMITTED_REQUEST, METRICS_NETWORK_TRANSMITTED_SUCCESS, METRICS_NETWORK_TRANSMITTED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadMetricsNetworkTransmitted(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchMetricsNetworkTransmitted(cluster, containerName, query))
  }
}