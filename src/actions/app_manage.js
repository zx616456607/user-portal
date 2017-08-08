/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for app manage
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const APP_LIST_REQUEST = 'APP_LIST_REQUEST'
export const APP_LIST_SUCCESS = 'APP_LIST_SUCCESS'
export const APP_LIST_FAILURE = 'APP_LIST_FAILURE'

// Fetches app list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppList(cluster, query, callback) {
  // Front-end customization requirements
  let { customizeOpts } = query || {}
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps`
  if (query) {
    delete query.customizeOpts
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    customizeOpts,
    [FETCH_API]: {
      types: [APP_LIST_REQUEST, APP_LIST_SUCCESS, APP_LIST_FAILURE],
      endpoint,
      schema: Schemas.APPS
    },
    callback: callback
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAppList(cluster, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAppList(cluster, query, callback))
  }
}


export const UPDATE_APP_LIST = 'UPDATE_APP_LIST'
export function updateAppList(cluster, appList) {
  return {
    cluster,
    appList,
    type: UPDATE_APP_LIST
  }
}

export const APP_DETAIL_REQUEST = 'APP_DETAIL_REQUEST'
export const APP_DETAIL_SUCCESS = 'APP_DETAIL_SUCCESS'
export const APP_DETAIL_FAILURE = 'APP_DETAIL_FAILURE'

// Fetches app list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppDetail(cluster, appName) {
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [APP_DETAIL_REQUEST, APP_DETAIL_SUCCESS, APP_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/detail`,
      schema: {}
    }
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAppDetail(cluster, appName, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchAppDetail(cluster, appName))
  }
}

export const APP_CREATE_REQUEST = 'APP_CREATE_REQUEST'
export const APP_CREATE_SUCCESS = 'APP_CREATE_SUCCESS'
export const APP_CREATE_FAILURE = 'APP_CREATE_FAILURE'

export function fetchCreateApp(appConfig, callback) {
  return {
    cluster: appConfig.cluster,
    [FETCH_API]: {
      types: [APP_CREATE_REQUEST, APP_CREATE_SUCCESS, APP_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${appConfig.cluster}/apps`,
      options: {
        method: 'POST',
        body: {
          name: appConfig.appName,
          template: appConfig.template,
          appPkgID:appConfig.appPkgID,
          desc: appConfig.desc
        }
      },
      schema: Schemas.APPS
    },
    callback
  }
}

export function createApp(appConfig, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateApp(appConfig, callback))
  }
}

export const APP_DESC_UPDATE_REQUEST = 'APP_DESC_UPDATE_REQUEST'
export const APP_DESC_UPDATE_SUCCESS = 'APP_DESC_UPDATE_SUCCESS'
export const APP_DESC_UPDATE_FAILURE = 'APP_DESC_UPDATE_FAILURE'

export function fetchUpdateAppDesc(app, callback) {
  return {
    cluster: app.cluster,
    [FETCH_API]: {
      types: [APP_DESC_UPDATE_REQUEST, APP_DESC_UPDATE_SUCCESS, APP_DESC_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${app.cluster}/apps/${app.name}/desc`,
      options: {
        method: 'PUT',
        body: {
          desc: app.desc
        }
      },
      schema: {}
    },
    callback
  }
}

export function updateAppDesc(app, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateAppDesc(app, callback))
  }
}

export const APP_BATCH_DELETE_REQUEST = 'APP_BATCH_DELETE_REQUEST'
export const APP_BATCH_DELETE_SUCCESS = 'APP_BATCH_DELETE_SUCCESS'
export const APP_BATCH_DELETE_FAILURE = 'APP_BATCH_DELETE_FAILURE'

function fetchDeleteApps(cluster, appList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [APP_BATCH_DELETE_REQUEST, APP_BATCH_DELETE_SUCCESS, APP_BATCH_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/batch-delete`,
      options: {
        method: 'POST',
        body: appList
      },
      schema: {}
    },
    callback: callback
  }
}

export function deleteApps(cluster, appList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteApps(cluster, appList, callback))
  }
}

export const APP_BATCH_STOP_REQUEST = 'APP_BATCH_STOP_REQUEST'
export const APP_BATCH_STOP_SUCCESS = 'APP_BATCH_STOP_SUCCESS'
export const APP_BATCH_STOP_FAILURE = 'APP_BATCH_STOP_FAILURE'

function fetchStopApps(cluster, appList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [APP_BATCH_STOP_REQUEST, APP_BATCH_STOP_SUCCESS, APP_BATCH_STOP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/batch-stop`,
      options: {
        method: 'PUT',
        body: appList
      },
      schema: {}
    },
    callback: callback
  }
}

export function stopApps(cluster, appList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStopApps(cluster, appList, callback))
  }
}

export const APP_BATCH_RESTART_REQUEST = 'APP_BATCH_RESTART_REQUEST'
export const APP_BATCH_RESTART_SUCCESS = 'APP_BATCH_RESTART_SUCCESS'
export const APP_BATCH_RESTART_FAILURE = 'APP_BATCH_RESTART_FAILURE'

function fetchRestartApps(cluster, appList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [APP_BATCH_RESTART_REQUEST, APP_BATCH_RESTART_SUCCESS, APP_BATCH_RESTART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/batch-restart`,
      options: {
        method: 'PUT',
        body: appList
      },
      schema: {}
    },
    callback: callback
  }
}

export function restartApps(cluster, appList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRestartApps(cluster, appList, callback))
  }
}

export const APP_BATCH_START_REQUEST = 'APP_BATCH_START_REQUEST'
export const APP_BATCH_START_SUCCESS = 'APP_BATCH_START_SUCCESS'
export const APP_BATCH_START_FAILURE = 'APP_BATCH_START_FAILURE'

function fetchStartApps(cluster, appList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [APP_BATCH_START_REQUEST, APP_BATCH_START_SUCCESS, APP_BATCH_START_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/batch-start`,
      options: {
        method: 'PUT',
        body: appList
      },
      schema: {}
    },
    callback: callback
  }
}

export function startApps(cluster, appList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStartApps(cluster, appList, callback))
  }
}

export const APP_ORCH_FILE_REQUEST = 'APP_ORCH_FILE_REQUEST'
export const APP_ORCH_FILE_SUCCESS = 'APP_ORCH_FILE_SUCCESS'
export const APP_ORCH_FILE_FAILURE = 'APP_ORCH_FILE_FAILURE'

export function getAppOrchfile(cluster, appName, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [APP_ORCH_FILE_REQUEST, APP_ORCH_FILE_SUCCESS, APP_ORCH_FILE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/orchfile`,
      schema: {}
    }
  }
}

export const APP_OPERATION_LOG_REQUEST = 'APP_OPERATION_LOG_REQUEST'
export const APP_OPERATION_LOG_SUCCESS = 'APP_OPERATION_LOG_SUCCESS'
export const APP_OPERATION_LOG_FAILURE = 'APP_OPERATION_LOG_FAILURE'

export function appLogs(cluster, appName, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [APP_OPERATION_LOG_REQUEST, APP_OPERATION_LOG_SUCCESS, APP_OPERATION_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/logs`,
      schema: {}
    }
  }
}

export const APP_CHECK_NAME_REQUEST = 'APP_CHECK_NAME_REQUEST'
export const APP_CHECK_NAME_SUCCESS = 'APP_CHECK_NAME_SUCCESS'
export const APP_CHECK_NAME_FAILURE = 'APP_CHECK_NAME_FAILURE'

function fetchCheckAppNameApps(cluster, appName, callback) {
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [APP_CHECK_NAME_REQUEST, APP_CHECK_NAME_SUCCESS, APP_CHECK_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/existence`,
      schema: {}
    },
    callback: callback
  }
}
export function checkAppName(cluster, appName, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCheckAppNameApps(cluster, appName, callback))
  }
}

export const SERVICE_CHECK_NAME_REQUEST = 'SERVICE_CHECK_NAME_REQUEST'
export const SERVICE_CHECK_NAME_SUCCESS = 'SERVICE_CHECK_NAME_SUCCESS'
export const SERVICE_CHECK_NAME_FAILURE = 'SERVICE_CHECK_NAME_FAILURE'

function fetchCheckServiceNameApps(cluster, service, callback) {
  return {
    cluster,
    service,
    [FETCH_API]: {
      types: [SERVICE_CHECK_NAME_REQUEST, SERVICE_CHECK_NAME_SUCCESS, SERVICE_CHECK_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/existence`,
      schema: {}
    },
    callback: callback
  }
}
export function checkServiceName(cluster, service, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCheckServiceNameApps(cluster, service, callback))
  }
}
// ~~~ containers

export const CONTAINER_LIST_REQUEST = 'CONTAINER_LIST_REQUEST'
export const CONTAINER_LIST_SUCCESS = 'CONTAINER_LIST_SUCCESS'
export const CONTAINER_LIST_FAILURE = 'CONTAINER_LIST_FAILURE'

// Fetches container list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchContainerList(cluster, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers`
  let { customizeOpts } = query || {}
  if (query) {
    delete query.customizeOpts
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    customizeOpts,
    [FETCH_API]: {
      types: [CONTAINER_LIST_REQUEST, CONTAINER_LIST_SUCCESS, CONTAINER_LIST_FAILURE],
      endpoint,
      schema: Schemas.CONTAINERS
    },
    callback
  }
}

// Fetches containers list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadContainerList(cluster, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchContainerList(cluster, query, callback))
  }
}

export const UPDATE_CONTAINER_LIST = 'UPDATE_CONTAINER_LIST'
export function updateContainerList(cluster, containerList) {
  return {
    cluster,
    containerList,
    type: UPDATE_CONTAINER_LIST
  }
}

export const CONTAINER_DETAIL_REQUEST = 'CONTAINER_DETAIL_REQUEST'
export const CONTAINER_DETAIL_SUCCESS = 'CONTAINER_DETAIL_SUCCESS'
export const CONTAINER_DETAIL_FAILURE = 'CONTAINER_DETAIL_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchContainerDetail(cluster, containerName) {
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [CONTAINER_DETAIL_REQUEST, CONTAINER_DETAIL_SUCCESS, CONTAINER_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/detail`,
      schema: {}
    }
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadContainerDetail(cluster, containerName, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchContainerDetail(cluster, containerName))
  }
}


export const CONTAINER_DETAIL_EVENTS_REQUEST = 'CONTAINER_DETAIL_EVENTS_REQUEST'
export const CONTAINER_DETAIL_EVENTS_SUCCESS = 'CONTAINER_DETAIL_EVENTS_SUCCESS'
export const CONTAINER_DETAIL_EVENTS_FAILURE = 'CONTAINER_DETAIL_EVENTS_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchContainerDetailEvents(cluster, containerName, callback) {
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [CONTAINER_DETAIL_EVENTS_REQUEST, CONTAINER_DETAIL_EVENTS_SUCCESS, CONTAINER_DETAIL_EVENTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/events`,
      schema: {}
    },
    callback
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadContainerDetailEvents(cluster, containerName, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchContainerDetailEvents(cluster, containerName, callback))
  }
}

export const CONTAINER_LOGS_REQUEST = 'CONTAINER_LOGS_REQUEST'
export const CONTAINER_LOGS_SUCCESS = 'CONTAINER_LOGS_SUCCESS'
export const CONTAINER_LOGS_FAILURE = 'CONTAINER_LOGS_FAILURE'
export const CONTAINER_LOGS_CLEAR = 'CONTAINER_LOGS_CLEAR'


export function fetchContainerLogs(cluster, containerName, body, callback) {
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [CONTAINER_LOGS_REQUEST, CONTAINER_LOGS_SUCCESS, CONTAINER_LOGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/logs`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function clearContainerLogs(cluster, containerName) {
  return {
    cluster,
    containerName,
    type: CONTAINER_LOGS_CLEAR
  }
}

export function loadContainerLogs(cluster, containerName, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchContainerLogs(cluster, containerName, body, callback))
  }
}

export const CONTAINER_BATCH_DELETE_REQUEST = 'CONTAINER_BATCH_DELETE_REQUEST'
export const CONTAINER_BATCH_DELETE_SUCCESS = 'CONTAINER_BATCH_DELETE_SUCCESS'
export const CONTAINER_BATCH_DELETE_FAILURE = 'CONTAINER_BATCH_DELETE_FAILURE'

// Fetches container list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteContainers(cluster, body, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [CONTAINER_BATCH_DELETE_REQUEST, CONTAINER_BATCH_DELETE_SUCCESS, CONTAINER_BATCH_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/containers/batch-delete`,
      options: {
        method: 'POST',
        body
      },
      schema: Schemas.CONTAINERS
    },
    callback
  }
}

// Fetches containers list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function deleteContainers(cluster, body, callback) {
  return (dispatch) => {
    return dispatch(fetchDeleteContainers(cluster, body, callback))
  }
}

export const CONTAINER_GET_PROCESS_REQUEST = 'CONTAINER_GET_PROCESS_REQUEST'
export const CONTAINER_GET_PROCESS_SUCCESS = 'CONTAINER_GET_PROCESS_SUCCESS'
export const CONTAINER_GET_PROCESS_FAILURE = 'CONTAINER_GET_PROCESS_FAILURE'

function fetchPodProcess(cluster, name) {
  return {
    [FETCH_API]: {
      types: [CONTAINER_GET_PROCESS_REQUEST, CONTAINER_GET_PROCESS_SUCCESS, CONTAINER_GET_PROCESS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/containers/${name}/process`,
      schema: {},
    },
  }
}

export function getPodProcess(cluster, name) {
  return (dispatch) => {
    return dispatch(fetchPodProcess(cluster, name))
  }
}

export const SET_LOGSIZE_STYLE = 'SET_LOGSIZE_STYLE'
// @baiyu set log bigBox
export function setTingLogs(logSize) {
  return {
    logSize,
    type: SET_LOGSIZE_STYLE
  }
}

export const GET_NETWORK_ISOLATION_STATUS_REQUEST = 'GET_NETWORK_ISOLATION_STATUS_REQUEST'
export const GET_NETWORK_ISOLATION_STATUS_SUCCESS = 'GET_NETWORK_ISOLATION_STATUS_SUCCESS'
export const GET_NETWORK_ISOLATION_STATUS_FAILURE = 'GET_NETWORK_ISOLATION_STATUS_FAILURE'

function fetchNetworkIsolationStatus(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_NETWORK_ISOLATION_STATUS_REQUEST, GET_NETWORK_ISOLATION_STATUS_SUCCESS, GET_NETWORK_ISOLATION_STATUS_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${body.clusterID}/namespace/${body.namespace}/networkisolation`,
      schema: {},
    },
    callback
  }
}

export function getNetworkIsolationStatus(body, callback) {
  return (dispatch) => {
    return dispatch(fetchNetworkIsolationStatus(body, callback))
  }
}

export const POST_NETWORK_ISOLATION_REQUEST = 'POST_NETWORK_ISOLATION_REQUEST'
export const POST_NETWORK_ISOLATION_SUCCESS = 'POST_NETWORK_ISOLATION_SUCCESS'
export const POST_NETWORK_ISOLATION_FAILURE = 'POST_NETWORK_ISOLATION_FAILURE'

function fetchPostNetworkIsolation(body, callback) {
  return {
    [FETCH_API]: {
      types: [POST_NETWORK_ISOLATION_REQUEST, POST_NETWORK_ISOLATION_SUCCESS, POST_NETWORK_ISOLATION_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${body.clusterID}/namespace/${body.namespace}/networkisolation`,
      options: {
        method: 'POST',
        body: body.body
      },
      schema: {}
    },
    callback
  }
}

export function postNetworkIsolation(body, callback) {
  return (dispatch) => {
    return dispatch(fetchPostNetworkIsolation(body, callback))
  }
}

export const DELETE_NETWORK_ISOLATION_REQUEST = 'DELETE_NETWORK_ISOLATION_REQUEST'
export const DELETE_NETWORK_ISOLATION_SUCCESS = 'DELETE_NETWORK_ISOLATION_SUCCESS'
export const DELETE_NETWORK_ISOLATION_FAILURE = 'DELETE_NETWORK_ISOLATION_FAILURE'

function fetchDeleteNetworkIsolation(body, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_NETWORK_ISOLATION_REQUEST, DELETE_NETWORK_ISOLATION_SUCCESS, DELETE_NETWORK_ISOLATION_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${body.clusterID}/namespace/${body.namespace}/networkisolation`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteNetworkIsolation(body, callback) {
  return (dispatch) => {
    return dispatch(fetchDeleteNetworkIsolation(body, callback))
  }
}