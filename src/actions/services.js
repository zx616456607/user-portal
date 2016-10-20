/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for services
 *
 * v0.1 - 2016-10-17
 * @author Gaojian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const SERVICE_LIST_REQUEST = 'SERVICE_LIST_REQUEST'
export const SERVICE_LIST_SUCCESS = 'SERVICE_LIST_SUCCESS'
export const SERVICE_LIST_FAILURE = 'SERVICE_LIST_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceList(cluster, appName, query) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/services`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [SERVICE_LIST_REQUEST, SERVICE_LIST_SUCCESS, SERVICE_LIST_FAILURE],
      endpoint,
      schema: Schemas.SERVICES
    }
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceList(cluster, appName, query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceList(cluster, appName, query))
  }
}

export const SERVICE_DETAIL_REQUEST = 'SERVICE_DETAIL_REQUEST'
export const SERVICE_DETAIL_SUCCESS = 'SERVICE_DETAIL_SUCCESS'
export const SERVICE_DETAIL_FAILURE = 'SERVICE_DETAIL_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceDetail(cluster, serviceName) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_DETAIL_REQUEST, SERVICE_DETAIL_SUCCESS, SERVICE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/detail`,
      schema: {}
    }
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceDetail(cluster, serviceName, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceDetail(cluster, serviceName))
  }
}

export const SERVICE_BATCH_DELETE_REQUEST = 'SERVICE_BATCH_DELETE_REQUEST'
export const SERVICE_BATCH_DELETE_SUCCESS = 'SERVICE_BATCH_DELETE_SUCCESS'
export const SERVICE_BATCH_DELETE_FAILURE = 'SERVICE_BATCH_DELETE_FAILURE'

function fetchDeleteServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_DELETE_REQUEST, SERVICE_BATCH_DELETE_SUCCESS, SERVICE_BATCH_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-delete`,
      options: {
        method: 'POST',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function deleteServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteServices(cluster, serviceList, callback))
  }
}

export const SERVICE_BATCH_STOP_REQUEST = 'SERVICE_BATCH_STOP_REQUEST'
export const SERVICE_BATCH_STOP_SUCCESS = 'SERVICE_BATCH_STOP_SUCCESS'
export const SERVICE_BATCH_STOP_FAILURE = 'SERVICE_BATCH_STOP_FAILURE'

function fetchStopServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_STOP_REQUEST, SERVICE_BATCH_STOP_SUCCESS, SERVICE_BATCH_STOP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-stop`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function stopServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStopServices(cluster, serviceList, callback))
  }
}

export const SERVICE_BATCH_RESTART_REQUEST = 'SERVICE_BATCH_RESTART_REQUEST'
export const SERVICE_BATCH_RESTART_SUCCESS = 'SERVICE_BATCH_RESTART_SUCCESS'
export const SERVICE_BATCH_RESTART_FAILURE = 'SERVICE_BATCH_RESTART_FAILURE'

function fetchRestartServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_RESTART_REQUEST, SERVICE_BATCH_RESTART_SUCCESS, SERVICE_BATCH_RESTART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-restart`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function restartServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRestartServices(cluster, serviceList, callback))
  }
}

export const SERVICE_BATCH_START_REQUEST = 'SERVICE_BATCH_START_REQUEST'
export const SERVICE_BATCH_START_SUCCESS = 'SERVICE_BATCH_START_SUCCESS'
export const SERVICE_BATCH_START_FAILURE = 'SERVICE_BATCH_START_FAILURE'

function fetchStartServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_START_REQUEST, SERVICE_BATCH_START_SUCCESS, SERVICE_BATCH_START_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-start`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export const SERVICE_BATCH_QUICK_RESTART_REQUEST = 'SERVICE_BATCH_QUICK_RESTART_REQUEST'
export const SERVICE_BATCH_QUICK_RESTART_SUCCESS = 'SERVICE_BATCH_QUICK_RESTART_SUCCESS'
export const SERVICE_BATCH_QUICK_RESTART_FAILURE = 'SERVICE_BATCH_QUICK_RESTART_FAILURE'

export function startServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStartServices(cluster, serviceList, callback))
  }
}

function fetchQuickRestartServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_QUICK_RESTART_REQUEST, SERVICE_BATCH_QUICK_RESTART_SUCCESS, SERVICE_BATCH_QUICK_RESTART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-quickrestart`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function quickRestartServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchQuickRestartServices(cluster, serviceList, callback))
  }
}

export const SERVICE_BATCH_ROLLING_UPDATE_REQUEST = 'SERVICE_BATCH_ROLLING_UPDATE_REQUEST'
export const SERVICE_BATCH_ROLLING_UPDATE_SUCCESS = 'SERVICE_BATCH_ROLLING_UPDATE_SUCCESS'
export const SERVICE_BATCH_ROLLING_UPDATE_FAILURE = 'SERVICE_BATCH_ROLLING_UPDATE_FAILURE'

function fetchRollingUpdateServices(cluster, servicName, targets, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_ROLLING_UPDATE_REQUEST, SERVICE_BATCH_ROLLING_UPDATE_SUCCESS, SERVICE_BATCH_ROLLING_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${servicName}/rollingupdate`,
      options: {
        method: 'PUT',
        body: targets
      },
      schema: {}
    },
    callback: callback
  }
}

export function rollingUpdateServices(cluster, servicName, targets, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRollingUpdateServices(cluster, servicName, targets, callback))
  }
}

export const SERVICE_CONTAINERS_LIST_REQUEST = 'SERVICE_CONTAINERS_LIST_REQUEST'
export const SERVICE_CONTAINERS_LIST_SUCCESS = 'SERVICE_CONTAINERS_LIST_SUCCESS'
export const SERVICE_CONTAINERS_LIST_FAILURE = 'SERVICE_CONTAINERS_LIST_FAILURE'

// Fetches container list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceContainerList(cluster, serviceName) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_CONTAINERS_LIST_REQUEST, SERVICE_CONTAINERS_LIST_SUCCESS, SERVICE_CONTAINERS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/containers`,
      schema: Schemas.CONTAINERS
    }
  }
}

// Fetches containers list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceContainerList(cluster, serviceName, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceContainerList(cluster, serviceName))
  }
}

export const SERVICE_DETAIL_EVENTS_REQUEST = 'SERVICE_DETAIL_EVENTS_REQUEST'
export const SERVICE_DETAIL_EVENTS_SUCCESS = 'SERVICE_DETAIL_EVENTS_SUCCESS'
export const SERVICE_DETAIL_EVENTS_FAILURE = 'SERVICE_DETAIL_EVENTS_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceDetailEvents(cluster, serviceName) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_DETAIL_EVENTS_REQUEST, SERVICE_DETAIL_EVENTS_SUCCESS, SERVICE_DETAIL_EVENTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/events`,
      schema: {}
    }
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceDetailEvents(cluster, serviceName) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceDetailEvents(cluster, serviceName))
  }
}


export const SERVICE_LOGS_REQUEST = 'SERVICE_LOGS_REQUEST'
export const SERVICE_LOGS_SUCCESS = 'SERVICE_LOGS_SUCCESS'
export const SERVICE_LOGS_FAILURE = 'SERVICE_LOGS_FAILURE'
export const SERVICE_LOGS_CLEAR = 'SERVICE_LOGS_CLEAR'


export function fetchServiceLogs(cluster, serviceName, body, callback) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_LOGS_REQUEST, SERVICE_LOGS_SUCCESS, SERVICE_LOGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/logs`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function clearServiceLogs(cluster, serviceName) {
  return {
    cluster,
    serviceName,
    type: SERVICE_LOGS_CLEAR
  }
}

export function loadServiceLogs(cluster, serviceName, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchServiceLogs(cluster, serviceName, body, callback))
  }
}
