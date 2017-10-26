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
import { API_URL_PREFIX } from '../constants'
import { METRICS_CPU, METRICS_MEMORY, METRICS_NETWORK_RECEIVED, METRICSS_NETWORK_TRANSMITTED, METRICSS_DISK_READ, METRICSS_DISK_WRITE } from '../../constants'
import { toQuerystring } from '../common/tools'

// ~~ container
// cpu
export const METRICS_CONTAINER_CPU_REQUEST = 'METRICS_CONTAINER_CPU_REQUEST'
export const METRICS_CONTAINER_CPU_SUCCESS = 'METRICS_CONTAINER_CPU_SUCCESS'
export const METRICS_CONTAINER_CPU_FAILURE = 'METRICS_CONTAINER_CPU_FAILURE'

function fetchContainerMetricsCPU(cluster, serviceName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${serviceName}/metrics`
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
    },
    callback
  }
}
export function loadContainerMetricsCPU(cluster, serviceName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsCPU(cluster, serviceName, query, callback))
  }
}

// memory
export const METRICS_CONTAINER_MEMORY_REQUEST = 'METRICS_CONTAINER_MEMORY_REQUEST'
export const METRICS_CONTAINER_MEMORY_SUCCESS = 'METRICS_CONTAINER_MEMORY_SUCCESS'
export const METRICS_CONTAINER_MEMORY_FAILURE = 'METRICS_CONTAINER_MEMORY_FAILURE'

function fetchContainerMetricsMemory(cluster, containerName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
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
    },
    callback
  }
}
export function loadContainerMetricsMemory(cluster, containerName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsMemory(cluster, containerName, query, callback))
  }
}

// networkReceived
export const METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST = 'METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST'
export const METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS = 'METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS'
export const METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE = 'METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE'

function fetchContainerMetricsNetworkReceived(cluster, containerName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
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
    },
    callback
  }
}
export function loadContainerMetricsNetworkReceived(cluster, containerName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsNetworkReceived(cluster, containerName, query, callback))
  }
}

// networkTransmitted
export const METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST = 'METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST'
export const METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS = 'METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS'
export const METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE = 'METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE'

function fetchContainerMetricsNetworkTransmitted(cluster, containerName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
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
    },
    callback
  }
}
export function loadContainerMetricsNetworkTransmitted(cluster, containerName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsNetworkTransmitted(cluster, containerName, query, callback))
  }
}

// disk readio
export const METRICS_CONTAINER_DISK_READ_REQUEST = 'METRICS_CONTAINER_DISK_READ_REQUEST'
export const METRICS_CONTAINER_DISK_READ_SUCCESS = 'METRICS_CONTAINER_DISK_READ_SUCCESS'
export const METRICS_CONTAINER_DISK_READ_FAILURE = 'METRICS_CONTAINER_DISK_READ_FAILURE'

function fetchContainerMetricsDiskRead(cluster, containerName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
  query.type = METRICSS_DISK_READ
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_CONTAINER_DISK_READ_REQUEST, METRICS_CONTAINER_DISK_READ_SUCCESS, METRICS_CONTAINER_DISK_READ_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}
export function loadContainerMetricsDiskRead(cluster, containerName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsDiskRead(cluster, containerName, query, callback))
  }
}

//disk writeio
export const METRICS_CONTAINER_DISK_WRITE_REQUEST = 'METRICS_CONTAINER_DISK_WRITE_REQUEST'
export const METRICS_CONTAINER_DISK_WRITE_SUCCESS = 'METRICS_CONTAINER_DISK_WRITE_SUCCESS'
export const METRICS_CONTAINER_DISK_WRITE_FAILURE = 'METRICS_CONTAINER_DISK_WRITE_FAILURE'

function fetchContainerMetricsDiskWrite(cluster, containerName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
  query.type = METRICSS_DISK_WRITE
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_CONTAINER_DISK_WRITE_REQUEST, METRICS_CONTAINER_DISK_WRITE_SUCCESS, METRICS_CONTAINER_DISK_WRITE_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}
export function loadContainerMetricsDiskWrite(cluster, containerName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchContainerMetricsDiskWrite(cluster, containerName, query, callback))
  }
}

//get all data
export const GET_ALL_METRICS_CONTAINER_REQUEST = 'GET_ALL_METRICS_CONTAINER_REQUEST'
export const GET_ALL_METRICS_CONTAINER_SUCCESS = 'GET_ALL_METRICS_CONTAINER_SUCCESS'
export const GET_ALL_METRICS_CONTAINER_FAILURE = 'GET_ALL_METRICS_CONTAINER_FAILURE'

function fetchContainerAllOfMetrics(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/getAllmetrics`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [GET_ALL_METRICS_CONTAINER_REQUEST, GET_ALL_METRICS_CONTAINER_SUCCESS, GET_ALL_METRICS_CONTAINER_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadContainerAllOfMetrics(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchContainerAllOfMetrics(cluster, containerName, query))
  }
}

// ~~ service
// cpu
export const METRICS_SERVICE_CPU_REQUEST = 'METRICS_SERVICE_CPU_REQUEST'
export const METRICS_SERVICE_CPU_SUCCESS = 'METRICS_SERVICE_CPU_SUCCESS'
export const METRICS_SERVICE_CPU_FAILURE = 'METRICS_SERVICE_CPU_FAILURE'

function fetchServiceMetricsCPU(cluster, serviceName, query = {}, callback) {
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
    },
    callback
  }
}
export function loadServiceMetricsCPU(cluster, serviceName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsCPU(cluster, serviceName, query, callback))
  }
}

// memory
export const METRICS_SERVICE_MEMORY_REQUEST = 'METRICS_SERVICE_MEMORY_REQUEST'
export const METRICS_SERVICE_MEMORY_SUCCESS = 'METRICS_SERVICE_MEMORY_SUCCESS'
export const METRICS_SERVICE_MEMORY_FAILURE = 'METRICS_SERVICE_MEMORY_FAILURE'

function fetchServiceMetricsMemory(cluster, serviceName, query = {}, callback) {
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
    },
    callback
  }
}
export function loadServiceMetricsMemory(cluster, serviceName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsMemory(cluster, serviceName, query, callback))
  }
}

// networkReceived
export const METRICS_SERVICE_NETWORK_RECEIVED_REQUEST = 'METRICS_SERVICE_NETWORK_RECEIVED_REQUEST'
export const METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS = 'METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS'
export const METRICS_SERVICE_NETWORK_RECEIVED_FAILURE = 'METRICS_SERVICE_NETWORK_RECEIVED_FAILURE'

function fetchServiceMetricsNetworkReceived(cluster, serviceName, query = {}, callback) {
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
    },
    callback
  }
}
export function loadServiceMetricsNetworkReceived(cluster, serviceName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsNetworkReceived(cluster, serviceName, query, callback))
  }
}

// networkTransmitted
export const METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST = 'METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST'
export const METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS = 'METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS'
export const METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE = 'METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE'

function fetchServiceMetricsNetworkTransmitted(cluster, serviceName, query = {}, callback) {
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
    },
    callback
  }
}
export function loadServiceMetricsNetworkTransmitted(cluster, serviceName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsNetworkTransmitted(cluster, serviceName, query, callback))
  }
}

// disk readio
export const METRICS_SERVICE_DISK_READ_REQUEST = 'METRICS_SERVICE_DISK_READ_REQUEST'
export const METRICS_SERVICE_DISK_READ_SUCCESS = 'METRICS_SERVICE_DISK_READ_SUCCESS'
export const METRICS_SERVICE_DISK_READ_FAILURE = 'METRICS_SERVICE_DISK_READ_FAILURE'

function fetchServiceMetricsDiskRead(cluster, serviceName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/metrics`
  query.type = METRICSS_DISK_READ
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [METRICS_SERVICE_DISK_READ_REQUEST, METRICS_SERVICE_DISK_READ_SUCCESS, METRICS_SERVICE_DISK_READ_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}
export function loadServiceMetricsDiskRead(cluster, serviceName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsDiskRead(cluster, serviceName, query, callback))
  }
}

//disk writeio
export const METRICS_SERVICE_DISK_WRITE_REQUEST = 'METRICS_SERVICE_DISK_WRITE_REQUEST'
export const METRICS_SERVICE_DISK_WRITE_SUCCESS = 'METRICS_SERVICE_DISK_WRITE_SUCCESS'
export const METRICS_SERVICE_DISK_WRITE_FAILURE = 'METRICS_SERVICE_DISK_WRITE_FAILURE'

function fetchServiceMetricsDiskWrite(cluster, serviceName, query = {}, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/metrics`
  query.type = METRICSS_DISK_WRITE
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [METRICS_SERVICE_DISK_WRITE_REQUEST, METRICS_SERVICE_DISK_WRITE_SUCCESS, METRICS_SERVICE_DISK_WRITE_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}
export function loadServiceMetricsDiskWrite(cluster, serviceName, query, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceMetricsDiskWrite(cluster, serviceName, query, callback))
  }
}

//get all data
export const GET_ALL_METRICS_SERVICE_REQUEST = 'GET_ALL_METRICS_SERVICE_REQUEST'
export const GET_ALL_METRICS_SERVICE_SUCCESS = 'GET_ALL_METRICS_SERVICE_SUCCESS'
export const GET_ALL_METRICS_SERVICE_FAILURE = 'GET_ALL_METRICS_SERVICE_FAILURE'

function fetchServiceAllOfMetrics(cluster, serviceName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/getAllMetrics`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [GET_ALL_METRICS_SERVICE_REQUEST, GET_ALL_METRICS_SERVICE_SUCCESS, GET_ALL_METRICS_SERVICE_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadServiceAllOfMetrics(cluster, serviceName, query) {
  return (dispatch) => {
    return dispatch(fetchServiceAllOfMetrics(cluster, serviceName, query))
  }
}

// ~~ app
// cpu
export const METRICS_APP_CPU_REQUEST = 'METRICS_APP_CPU_REQUEST'
export const METRICS_APP_CPU_SUCCESS = 'METRICS_APP_CPU_SUCCESS'
export const METRICS_APP_CPU_FAILURE = 'METRICS_APP_CPU_FAILURE'

function fetchAppMetricsCPU(cluster, appName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/metrics`
  query.type = METRICS_CPU
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [METRICS_APP_CPU_REQUEST, METRICS_APP_CPU_SUCCESS, METRICS_APP_CPU_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadAppMetricsCPU(cluster, appName, query) {
  return (dispatch) => {
    return dispatch(fetchAppMetricsCPU(cluster, appName, query))
  }
}

// memory
export const METRICS_APP_MEMORY_REQUEST = 'METRICS_APP_MEMORY_REQUEST'
export const METRICS_APP_MEMORY_SUCCESS = 'METRICS_APP_MEMORY_SUCCESS'
export const METRICS_APP_MEMORY_FAILURE = 'METRICS_APP_MEMORY_FAILURE'

function fetchAppMetricsMemory(cluster, appName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/metrics`
  query.type = METRICS_MEMORY
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [METRICS_APP_MEMORY_REQUEST, METRICS_APP_MEMORY_SUCCESS, METRICS_APP_MEMORY_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadAppMetricsMemory(cluster, appName, query) {
  return (dispatch) => {
    return dispatch(fetchAppMetricsMemory(cluster, appName, query))
  }
}

// networkReceived
export const METRICS_APP_NETWORK_RECEIVED_REQUEST = 'METRICS_APP_NETWORK_RECEIVED_REQUEST'
export const METRICS_APP_NETWORK_RECEIVED_SUCCESS = 'METRICS_APP_NETWORK_RECEIVED_SUCCESS'
export const METRICS_APP_NETWORK_RECEIVED_FAILURE = 'METRICS_APP_NETWORK_RECEIVED_FAILURE'

function fetchAppMetricsNetworkReceived(cluster, appName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/metrics`
  query.type = METRICS_NETWORK_RECEIVED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [METRICS_APP_NETWORK_RECEIVED_REQUEST, METRICS_APP_NETWORK_RECEIVED_SUCCESS, METRICS_APP_NETWORK_RECEIVED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadAppMetricsNetworkReceived(cluster, appName, query) {
  return (dispatch) => {
    return dispatch(fetchAppMetricsNetworkReceived(cluster, appName, query))
  }
}

// networkTransmitted
export const METRICS_APP_NETWORK_TRANSMITTED_REQUEST = 'METRICS_APP_NETWORK_TRANSMITTED_REQUEST'
export const METRICS_APP_NETWORK_TRANSMITTED_SUCCESS = 'METRICS_APP_NETWORK_TRANSMITTED_SUCCESS'
export const METRICS_APP_NETWORK_TRANSMITTED_FAILURE = 'METRICS_APP_NETWORK_TRANSMITTED_FAILURE'

function fetchAppMetricsNetworkTransmitted(cluster, appName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/metrics`
  query.type = METRICSS_NETWORK_TRANSMITTED
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [METRICS_APP_NETWORK_TRANSMITTED_REQUEST, METRICS_APP_NETWORK_TRANSMITTED_SUCCESS, METRICS_APP_NETWORK_TRANSMITTED_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadAppMetricsNetworkTransmitted(cluster, appName, query) {
  return (dispatch) => {
    return dispatch(fetchAppMetricsNetworkTransmitted(cluster, appName, query))
  }
}

// disk readio
export const METRICS_APP_DISK_READ_REQUEST = 'METRICS_APP_DISK_READ_REQUEST'
export const METRICS_APP_DISK_READ_SUCCESS = 'METRICS_APP_DISK_READ_SUCCESS'
export const METRICS_APP_DISK_READ_FAILURE = 'METRICS_APP_DISK_READ_FAILURE'

function fetchAppMetricsDiskRead(cluster, appName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/metrics`
  query.type = METRICSS_DISK_READ
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [METRICS_APP_DISK_READ_REQUEST, METRICS_APP_DISK_READ_SUCCESS, METRICS_APP_DISK_READ_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadAppMetricsDiskRead(cluster, appName, query) {
  return (dispatch) => {
    return dispatch(fetchAppMetricsDiskRead(cluster, appName, query))
  }
}


// disk writeio
export const METRICS_APP_DISK_WRITE_REQUEST = 'METRICS_APP_DISK_WRITE_REQUEST'
export const METRICS_APP_DISK_WRITE_SUCCESS = 'METRICS_APP_DISK_WRITE_SUCCESS'
export const METRICS_APP_DISK_WRITE_FAILURE = 'METRICS_APP_DISK_WRITE_FAILURE'

function fetchAppMetricsDiskWrite(cluster, appName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/metrics`
  query.type = METRICSS_DISK_WRITE
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [METRICS_APP_DISK_WRITE_REQUEST, METRICS_APP_DISK_WRITE_SUCCESS, METRICS_APP_DISK_WRITE_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadAppMetricsDiskWrite(cluster, appName, query) {
  return (dispatch) => {
    return dispatch(fetchAppMetricsDiskWrite(cluster, appName, query))
  }
}

export const GET_ALL_METRICS_APP_REQUEST = 'GET_ALL_METRICS_APP_REQUEST'
export const GET_ALL_METRICS_APP_SUCCESS = 'GET_ALL_METRICS_APP_SUCCESS'
export const GET_ALL_METRICS_APP_FAILURE = 'GET_ALL_METRICS_APP_FAILURE'

function fetchAppAllOfMetrics(cluster, appName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/getAllMetrics`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [GET_ALL_METRICS_APP_REQUEST, GET_ALL_METRICS_APP_SUCCESS, GET_ALL_METRICS_APP_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
export function loadAppAllOfMetrics(cluster, appName, query) {
  return (dispatch) => {
    return dispatch(fetchAppAllOfMetrics(cluster, appName, query))
  }
}