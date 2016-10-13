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

export const APP_LIST_REQUEST = 'APP_LIST_REQUEST'
export const APP_LIST_SUCCESS = 'APP_LIST_SUCCESS'
export const APP_LIST_FAILURE = 'APP_LIST_FAILURE'

// Fetches app list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppList(cluster) {
  return {
    cluster,
    [FETCH_API]: {
      types: [ APP_LIST_REQUEST, APP_LIST_SUCCESS, APP_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps`,
      schema: Schemas.APPS
    }
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAppList(cluster, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchAppList(cluster))
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
      types: [ APP_DETAIL_REQUEST, APP_DETAIL_SUCCESS, APP_DETAIL_FAILURE ],
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

export function createApp(appConfig, callback) {
  return {
    cluster:appConfig.cluster,
    [FETCH_API]: {
      types: [APP_CREATE_REQUEST, APP_CREATE_SUCCESS, APP_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${appConfig.cluster}/apps`,
      options: {
        method: 'POST',
        body: {
          name:appConfig.appName,
          template:appConfig.template,
          remark:appConfig.remark
        }
      },
      schema: Schemas.APPS
    },
    callback: callback
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

export function deleteApps(cluster, appList, callback){
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

export function stopApps(cluster, appList, callback){
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

export function restartApps(cluster, appList, callback){
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

export function startApps(cluster, appList, callback){
  return (dispatch, getState) => {
    return dispatch(fetchStartApps(cluster, appList, callback))
  }
}

// ~~~ services

export const SERVICE_LIST_REQUEST = 'SERVICE_LIST_REQUEST'
export const SERVICE_LIST_SUCCESS = 'SERVICE_LIST_SUCCESS'
export const SERVICE_LIST_FAILURE = 'SERVICE_LIST_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceList(cluster, appName) {
  return {
    cluster,
    appName,
    [FETCH_API]: {
      types: [ SERVICE_LIST_REQUEST, SERVICE_LIST_SUCCESS, SERVICE_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/services`,
      schema: Schemas.SERVICES
    }
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceList(cluster, appName, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceList(cluster, appName))
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

export function deleteServices(cluster, serviceList, callback){
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

export function stopServices(cluster, serviceList, callback){
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

export function restartServices(cluster, serviceList, callback){
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

export function startServices(cluster, serviceList, callback){
  return (dispatch, getState) => {
    return dispatch(fetchStartServices(cluster, serviceList, callback))
  }
}

// ~~~ containers

export const CONTAINER_LIST_REQUEST = 'CONTAINER_LIST_REQUEST'
export const CONTAINER_LIST_SUCCESS = 'CONTAINER_LIST_SUCCESS'
export const CONTAINER_LIST_FAILURE = 'CONTAINER_LIST_FAILURE'

// Fetches container list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchContainerList(cluster) {
  return {
    cluster,
    [FETCH_API]: {
      types: [ CONTAINER_LIST_REQUEST, CONTAINER_LIST_SUCCESS, CONTAINER_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/containers`,
      schema: Schemas.CONTAINERS
    }
  }
}

// Fetches containers list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadContainerList(cluster, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchContainerList(cluster))
  }
}