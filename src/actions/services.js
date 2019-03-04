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
function fetchServiceList(cluster, appName, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/services`
  const { customizeOpts } = query || {}
  if (query) {
    delete query.customizeOpts
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    customizeOpts,
    [FETCH_API]: {
      types: [SERVICE_LIST_REQUEST, SERVICE_LIST_SUCCESS, SERVICE_LIST_FAILURE],
      endpoint,
      schema: Schemas.SERVICES
    },
    callback
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceList(cluster, appName, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceList(cluster, appName, query, callback))
  }
}

export const UPDATE_APP_SERVICES_LIST = 'UPDATE_APP_SERVICES_LIST'

export function updateAppServicesList(cluster, appName, serviceList) {
  return {
    cluster,
    appName,
    serviceList,
    type: UPDATE_APP_SERVICES_LIST
  }
}

export const SERVICE_ADD_REQUEST = 'SERVICE_ADD_REQUEST'
export const SERVICE_ADD_SUCCESS = 'SERVICE_ADD_SUCCESS'
export const SERVICE_ADD_FAILURE = 'SERVICE_ADD_FAILURE'

function fetchAddService(cluster, appName, body, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_ADD_REQUEST, SERVICE_ADD_SUCCESS, SERVICE_ADD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/services`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function addService(cluster, appName, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddService(cluster, appName, body, callback))
  }
}

export const SERVICE_DETAIL_REQUEST = 'SERVICE_DETAIL_REQUEST'
export const SERVICE_DETAIL_SUCCESS = 'SERVICE_DETAIL_SUCCESS'
export const SERVICE_DETAIL_FAILURE = 'SERVICE_DETAIL_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceDetail(cluster, serviceName, callback) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_DETAIL_REQUEST, SERVICE_DETAIL_SUCCESS, SERVICE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/detail`,
      schema: {}
    },
    callback: callback
  }
}

export const PUT_EDIT_SERVICE_VOLUME_REQUEST = 'PUT_EDIT_SERVICE_VOLUME_REQUEST'
export const PUT_EDIT_SERVICE_VOLUME_SUCCESS = 'PUT_EDIT_SERVICE_VOLUME_SUCCESS'
export const PUT_EDIT_SERVICE_VOLUME_FAILURE = 'PUT_EDIT_SERVICE_VOLUME_FAILURE'

export function editServiceVolume(cluster, serviveName, body, callback){
  return {
    [FETCH_API]: {
      types: [PUT_EDIT_SERVICE_VOLUME_REQUEST, PUT_EDIT_SERVICE_VOLUME_SUCCESS, PUT_EDIT_SERVICE_VOLUME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviveName}/volume`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {}//Schemas.STORAGE
    },
    callback,
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceDetail(cluster, serviceName, callback, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceDetail(cluster, serviceName, callback))
  }
}

export const SERVICE_BATCH_DELETE_REQUEST = 'SERVICE_BATCH_DELETE_REQUEST'
export const SERVICE_BATCH_DELETE_SUCCESS = 'SERVICE_BATCH_DELETE_SUCCESS'
export const SERVICE_BATCH_DELETE_FAILURE = 'SERVICE_BATCH_DELETE_FAILURE'

function fetchDeleteServices(cluster, body, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_DELETE_REQUEST, SERVICE_BATCH_DELETE_SUCCESS, SERVICE_BATCH_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-delete`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback: callback
  }
}

export function deleteServices(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteServices(cluster, body, callback))
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

export const SERVICE_CONTAINERS_LIST_REQUEST = 'SERVICE_CONTAINERS_LIST_REQUEST'
export const SERVICE_CONTAINERS_LIST_SUCCESS = 'SERVICE_CONTAINERS_LIST_SUCCESS'
export const SERVICE_CONTAINERS_LIST_FAILURE = 'SERVICE_CONTAINERS_LIST_FAILURE'

// Fetches container list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceContainerList(cluster, serviceName, query, bpmQuery,callback) {
  const { customizeOpts, projectName, userName } = query || {}
  if (query) {
    delete query.projectName
    delete query.userName
  }
  let headers
  if(projectName) {
    headers = {
      teamspace: projectName || 'default',
    }
  }
  if (userName) {
    headers = Object.assign({}, headers, {
      onbehalfuser: userName,
    })
  }
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/containers`;
  if (bpmQuery !==null) {
    endpoint += `?${bpmQuery}`
  }
  return {
    cluster,
    serviceName,
    customizeOpts,
    [FETCH_API]: {
      types: [SERVICE_CONTAINERS_LIST_REQUEST, SERVICE_CONTAINERS_LIST_SUCCESS, SERVICE_CONTAINERS_LIST_FAILURE],
      endpoint,
      schema: Schemas.CONTAINERS,
      options: {
        headers,
      },
    },
    callback: callback
  }
}

// Fetches containers list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceContainerList(cluster, serviceName, query, bpmQuery, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceContainerList(cluster, serviceName, query, bpmQuery, callback))
  }
}

export const UPDATE_SERVICE_CONTAINERS_LIST = 'UPDATE_SERVICE_CONTAINERS_LIST'

export function updateServiceContainersList(cluster, serviceName, containerList) {
  return {
    cluster,
    serviceName,
    containerList,
    type: UPDATE_SERVICE_CONTAINERS_LIST
  }
}

export const SERVICE_DETAIL_EVENTS_REQUEST = 'SERVICE_DETAIL_EVENTS_REQUEST'
export const SERVICE_DETAIL_EVENTS_SUCCESS = 'SERVICE_DETAIL_EVENTS_SUCCESS'
export const SERVICE_DETAIL_EVENTS_FAILURE = 'SERVICE_DETAIL_EVENTS_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceDetailEvents(cluster, serviceName, type, callback) {

  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_DETAIL_EVENTS_REQUEST, SERVICE_DETAIL_EVENTS_SUCCESS, SERVICE_DETAIL_EVENTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}/${serviceName}/events`,
      schema: {}
    },
    callback,
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceDetailEvents(cluster, serviceName, type, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceDetailEvents(cluster, serviceName, type, callback))
  }
}

export const CONTAINERS_ALL_EVENTS_REQUEST = 'CONTAINERS_ALL_EVENTS_REQUEST'
export const CONTAINERS_ALL_EVENTS_SUCCESS = 'CONTAINERS_ALL_EVENTS_SUCCESS'
export const CONTAINERS_ALL_EVENTS_FAILURE = 'CONTAINERS_ALL_EVENTS_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchContainersAllEvents(cluster, serviceName, callback) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [CONTAINERS_ALL_EVENTS_REQUEST, CONTAINERS_ALL_EVENTS_SUCCESS, CONTAINERS_ALL_EVENTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/service/${serviceName}/pods/events`,
      schema: {}
    },
    callback,
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadContainersAllEvents(cluster, serviceName, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchContainersAllEvents(cluster, serviceName, callback))
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


export const SERVICE_GET_K8S_SERVICE_REQUEST = 'SERVICE_GET_K8S_SERVICE_REQUEST'
export const SERVICE_GET_K8S_SERVICE_SUCCESS = 'SERVICE_GET_K8S_SERVICE_SUCCESS'
export const SERVICE_GET_K8S_SERVICE_FAILURE = 'SERVICE_GET_PORT_FAILURE'
export const SERVICE_CLEAR_K8S_SERVICE = 'SERVICE_CLEAR_K8S_SERVICE'

function fetchK8sService(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_GET_K8S_SERVICE_REQUEST, SERVICE_GET_K8S_SERVICE_SUCCESS, SERVICE_GET_K8S_SERVICE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/k8s-service`,
      schema: {}
    },
    callback
  }
}

export function loadK8sService(cluster, serviceName, callback) {
  return (dispath, getState) => {
    return dispath(fetchK8sService(cluster, serviceName, callback))
  }
}

export function clearK8sService() {
  return {
    type: SERVICE_CLEAR_K8S_SERVICE
  }
}


export const SERVICE_CLEAR_DOMIAN = 'SERVICE_CLEAR_DOMIAN'

export function clearServiceDomain() {
  return {
    type: SERVICE_CLEAR_DOMIAN
  }
}

export const SERVICE_BIND_DOMAIN_REQUEST = 'SERVICE_BIND_DOMAIN_REQUEST'
export const SERVICE_BIND_DOMAIN_SUCCESS = 'SERVICE_BIND_DOMAIN_SUCCESS'
export const SERVICE_BIND_DOMAIN_FAILURE = 'SERVICE_BIND_DOMAIN_FAILURE'

function fetchServiceBindDomain(cluster, serviceName, domainInfo, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_BIND_DOMAIN_REQUEST, SERVICE_BIND_DOMAIN_SUCCESS, SERVICE_BIND_DOMAIN_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/binddomain`,
      options: {
        method: 'POST',
        body: domainInfo
      },
      schema: {}
    },
    callback
  }
}

export function serviceBindDomain(cluster, serviceName, domainInfo, callback) {
  return (dispath, getState) => {
    return dispath(fetchServiceBindDomain(cluster, serviceName, domainInfo, callback))
  }
}

export const SERVICE_DELETE_DOMAIN_REQUEST = 'SERVICE_DELETE_DOMAIN_REQUEST'
export const SERVICE_DELETE_DOMAIN_SUCCESS = 'SERVICE_DELETE_DOMAIN_SUCCESS'
export const SERVICE_DELETE_DOMIAN_FAILURE = 'SERVICE_DELETE_DOMAIN_FAILURE'

function fetchDeleteServiceDomain(cluster, serviceName, domainInfo, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_DELETE_DOMAIN_REQUEST, SERVICE_DELETE_DOMAIN_SUCCESS, SERVICE_DELETE_DOMIAN_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/binddomain`,
      options: {
        method: 'PUT',
        body: domainInfo
      },
      schema: {}
    },
    callback
  }
}

export function deleteServiceDomain(cluster, serviceName, domainInfo, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteServiceDomain(cluster, serviceName, domainInfo, callback))
  }
}


export const SERVICE_AVAILABILITY_REQUEST = 'SERVICE_AVAILABILITY_REQUEST'
export const SERVICE_AVAILABILITY_SUCCESS = 'SERVICE_AVAILABILITY_SUCCESS'
export const SERVICE_AVAILABILITY_FAILURE = 'SERVICE_AVAILABILITY_FAILURE'

export function fetchChangeServiceAvailability(cluster, serviceName, options, callback) {
  let body = null
  if (typeof options === 'boolean') {
    body = {
      open: options
    }
  }
  else {
    body = {
      livenessProbe: options
    }
  }
  return {
    [FETCH_API]: {
      types: [SERVICE_AVAILABILITY_REQUEST, SERVICE_AVAILABILITY_SUCCESS, SERVICE_AVAILABILITY_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/ha`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function changeServiceAvailability(cluster, serviceName, options, callback) {
  return (dispath, getState) => {
    return dispath(fetchChangeServiceAvailability(cluster, serviceName, options, callback))
  }
}

export const GET_AUTO_SCALE_REQUEST = 'GET_AUTO_SCALE_REQUEST'
export const GET_AUTO_SCALE_SUCCESS = 'GET_AUTO_SCALE_SUCCESS'
export const GET_AUTO_SCALE_FAILURE = 'GET_AUTO_SCALE_FAILURE'

function getAutoScale(cluster, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/autoscale`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_AUTO_SCALE_REQUEST, GET_AUTO_SCALE_SUCCESS, GET_AUTO_SCALE_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function loadAutoScaleList(cluster, query, callback) {
  return (dispatch) => {
    return dispatch(getAutoScale(cluster, query, callback))
  }
}

export const SERVICE_GET_AUTO_SCALE_REQUEST = 'SERVICE_GET_AUTO_SCALE_REQUEST'
export const SERVICE_GET_AUTO_SCALE_SUCCESS = 'SERVICE_GET_AUTO_SCALE_SUCCESS'
export const SERVICE_GET_AUTO_SCALE_FAILURE = 'SERVICE_GET_AUTO_SCALE_FAILURE'

function fetchAutoScale(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_GET_AUTO_SCALE_REQUEST, SERVICE_GET_AUTO_SCALE_SUCCESS, SERVICE_GET_AUTO_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/autoscale`,
      schema: {}
    },
    callback
  }
}

export function loadAutoScale(cluster, serviceName, callback) {
  return (dispath) => {
    return dispath(fetchAutoScale(cluster, serviceName, callback))
  }
}

export const SERVICE_DELETE_AUTO_SCALE_REQUEST = 'SERVICE_DELETE_AUTO_SCALE_REQUEST'
export const SERVICE_DELETE_AUTO_SCALE_SUCCESS = 'SERVICE_DELETE_AUTO_SCALE_SUCCESS'
export const SERVICE_DELETE_AUTO_SCALE_FAILURE = 'SERVICE_DELETE_AUTO_SCALE_FAILURE'

function fetchDeleteAutoScale(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_DELETE_AUTO_SCALE_REQUEST, SERVICE_DELETE_AUTO_SCALE_SUCCESS, SERVICE_DELETE_AUTO_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/autoscale`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteAutoScale(cluster, serviceName, callback) {
  return (dispath) => {
    return dispath(fetchDeleteAutoScale(cluster, serviceName, callback))
  }
}

export const SERVICE_UPDATE_AUTO_SCALE_REQUEST = 'SERVICE_UPDATE_AUTO_SCALE_REQUEST'
export const SERVICE_UPDATE_AUTO_SCALE_SUCCESS = 'SERVICE_UPDATE_AUTO_SCALE_SUCCESS'
export const SERVICE_UPDATE_AUTO_SCALE_FAILURE = 'SERVICE_UPDATE_AUTO_SCALE_FAILURE'

function fetchUpdateAutoScale(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_UPDATE_AUTO_SCALE_REQUEST, SERVICE_UPDATE_AUTO_SCALE_SUCCESS, SERVICE_UPDATE_AUTO_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/autoscale`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function updateAutoScale(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchUpdateAutoScale(cluster, serviceName, body, callback))
  }
}

export const SERVICE_UPDATE_STATUS_AUTO_SCALE_REQUEST = 'SERVICE_UPDATE_STATUS_AUTO_SCALE_REQUEST'
export const SERVICE_UPDATE_STATUS_AUTO_SCALE_SUCCESS = 'SERVICE_UPDATE_STATUS_AUTO_SCALE_SUCCESS'
export const SERVICE_UPDATE_STATUS_AUTO_SCALE_FAILURE = 'SERVICE_UPDATE_STATUS_AUTO_SCALE_FAILURE'

function fetchUpdateAutoScaleStatus(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_UPDATE_STATUS_AUTO_SCALE_REQUEST, SERVICE_UPDATE_STATUS_AUTO_SCALE_SUCCESS, SERVICE_UPDATE_STATUS_AUTO_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/autoscale/status`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function updateAutoScaleStatus(cluster, body, callback) {
  return (dispath) => {
    return dispath(fetchUpdateAutoScaleStatus(cluster, body, callback))
  }
}

export const SERVICE_AUTO_SCALE_LOGS_REQUEST = 'SERVICE_AUTO_SCALE_LOGS_REQUEST'
export const SERVICE_AUTO_SCALE_LOGS_SUCCESS = 'SERVICE_AUTO_SCALE_LOGS_SUCCESS'
export const SERVICE_AUTO_SCALE_LOGS_FAILURE = 'SERVICE_AUTO_SCALE_LOGS_FAILURE'

function fetchAutoScaleLogs(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_AUTO_SCALE_LOGS_REQUEST, SERVICE_AUTO_SCALE_LOGS_SUCCESS, SERVICE_AUTO_SCALE_LOGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/autoscale/logs`,
      options: {},
      schema: {}
    },
    callback
  }
}

export function getAutoScaleLogs(cluster, serviceName, callback) {
  return (dispath) => {
    return dispath(fetchAutoScaleLogs(cluster, serviceName, callback))
  }
}

export const CHECK_AUTO_SCALE_NAME_REQUEST = 'CHECK_AUTO_SCALE_NAME_REQUEST'
export const CHECK_AUTO_SCALE_NAME_SUCCESS = 'CHECK_AUTO_SCALE_NAME_SUCCESS'
export const CHECK_AUTO_SCALE_NAME_FAILURE = 'CHECK_AUTO_SCALE_NAME_FAILURE'

function fetchAutoScaleNameExistence(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [CHECK_AUTO_SCALE_NAME_REQUEST, CHECK_AUTO_SCALE_NAME_SUCCESS, CHECK_AUTO_SCALE_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/autoscale/existence`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function checkAutoScaleName(cluster, body, callback) {
  return (dispath) => {
    return dispath(fetchAutoScaleNameExistence(cluster, body, callback))
  }
}

export const SERVICE_MANUAL_SCALE_REQUEST = 'SERVICE_MANUAL_SCALE_REQUEST'
export const SERVICE_MANUAL_SCALE_SUCCESS = 'SERVICE_MANUAL_SCALE_SUCCESS'
export const SERVICE_MANUAL_SCALE_FAILURE = 'SERVICE_MANUAL_SCALE_FAILURE'

function fetchManualScaleService(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_MANUAL_SCALE_REQUEST, SERVICE_MANUAL_SCALE_SUCCESS, SERVICE_MANUAL_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/manualscale`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function manualScaleService(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchManualScaleService(cluster, serviceName, body, callback))
  }
}

export const SERVICE_CHANGE_QUOTA_REQUEST = 'SERVICE_CHANGE_QUOTA_REQUEST'
export const SERVICE_CHANGE_QUOTA_SUCCESS = 'SERVICE_CHANGE_QUOTA_SUCCESS'
export const SERVICE_CHANGE_QUOTA_FAILURE = 'SERVICE_CHANGE_QUOTA_FAILURE'

function fetchChangeQuotaService(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_CHANGE_QUOTA_REQUEST, SERVICE_CHANGE_QUOTA_SUCCESS, SERVICE_CHANGE_QUOTA_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/quota`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function changeQuotaService(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchChangeQuotaService(cluster, serviceName, body, callback))
  }
}

export const SERVICE_ROLLING_UPDATE_REQUEST = 'SERVICE_ROLLING_UPDATE_REQUEST'
export const SERVICE_ROLLING_UPDATE_SUCCESS = 'SERVICE_ROLLING_UPDATE_SUCCESS'
export const SERVICE_ROLLING_UPDATE_FAILURE = 'SERVICE_ROLLING_UPDATE_FAILURE'

function fetchRollingUpdateService(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_ROLLING_UPDATE_REQUEST, SERVICE_ROLLING_UPDATE_SUCCESS, SERVICE_ROLLING_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/rollingupdate`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function rollingUpdateService(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchRollingUpdateService(cluster, serviceName, body, callback))
  }
}

export const SERVICE_ROLLING_UPDATE_RESTART_REQUEST = 'SERVICE_ROLLING_UPDATE_RESTART_REQUEST'
export const SERVICE_ROLLING_UPDATE_RESTART_SUCCESS = 'SERVICE_ROLLING_UPDATE_RESTART_SUCCESS'
export const SERVICE_ROLLING_UPDATE_RESTART_FAILURE = 'SERVICE_ROLLING_UPDATE_RESTART_FAILURE'

function fetchRollingUpdateServiceRecreate(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [ SERVICE_ROLLING_UPDATE_RESTART_REQUEST,
        SERVICE_ROLLING_UPDATE_RESTART_SUCCESS,
        SERVICE_ROLLING_UPDATE_RESTART_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/upgrade/services/${serviceName}/recreate`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {},
    },
    callback,
  }
}

export function rollingUpdateServiceRecreate(cluster, serviceName, body, callback) {
  return dispath => {
    return dispath(fetchRollingUpdateServiceRecreate(cluster, serviceName, body, callback))
  }
}

export const SERVICE_ROLLBACK_UPDATE_REQUEST = 'SERVICE_ROLLBACK_UPDATE_REQUEST'
export const SERVICE_ROLLBACK_UPDATE_SUCCESS = 'SERVICE_ROLLBACK_UPDATE_SUCCESS'
export const SERVICE_ROLLBACK_UPDATE_FAILURE = 'SERVICE_ROLLBACK_UPDATE_FAILURE'

function fetchRollbackUpdateService(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_ROLLBACK_UPDATE_REQUEST, SERVICE_ROLLBACK_UPDATE_SUCCESS, SERVICE_ROLLBACK_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/rollbackupdate`,
      options: {
        method: 'PUT',
      },
      schema: {}
    },
    callback
  }
}

export function rollbackUpdateService(cluster, serviceName, callback) {
  return (dispath) => {
    return dispath(fetchRollbackUpdateService(cluster, serviceName, callback))
  }
}

// Get all service
export const SERVICE_GET_ALL_LIST_REQUEST = 'SERVICE_GET_ALL_LIST_REQUEST'
export const SERVICE_GET_ALL_LIST_SUCCESS = 'SERVICE_GET_ALL_LIST_SUCCESS'
export const SERVICE_GET_ALL_LIST_FAILURE = 'SERVICE_GET_ALL_LIST_FAILURE'

export function fetchAllServices(cluster, {pageIndex, pageSize, name, label, customizeOpts, headers}, callback) {
  return {
    customizeOpts,
    [FETCH_API]: {
      types: [SERVICE_GET_ALL_LIST_REQUEST, SERVICE_GET_ALL_LIST_SUCCESS, SERVICE_GET_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services?pageIndex=${pageIndex}&pageSize=${pageSize}${name ? `&name=${encodeURIComponent(name)}` : ''}${label ? `&label=${label}` : ''}`,
      schema: {},
      options: {
        headers
      }
    },
    callback
  }
}

export function loadAllServices(cluster, condition, callback) {
  return (dispath, getState) => {
    return dispath(fetchAllServices(cluster, condition, callback))
  }
}

export const UPDATE_SERVICE_GET_ALL_LIST = 'UPDATE_SERVICE_GET_ALL_LIST'

export function updateServicesList(deploymentList) {
  return {
    deploymentList,
    type: UPDATE_SERVICE_GET_ALL_LIST
  }
}

export const SERVICE_GET_CERTIFICATIES_REQUEST = 'SERVICE_GET_CERTIFICATIES_REQUEST'
export const SERVICE_GET_CERTIFICATIES_SUCCESS = 'SERVICE_GET_CERTIFICATIES_SUCCESS'
export const SERVICE_GET_CERTIFICATIES_FAILURE = 'SERVICE_GET_CERTIFICATIES_FAILURE'

function fetchCertificates(cluster, service,callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_GET_CERTIFICATIES_REQUEST, SERVICE_GET_CERTIFICATIES_SUCCESS, SERVICE_GET_CERTIFICATIES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/certificates`,
      schema: {}
    },
    callback
  }
}

export function loadCertificates(cluster, service, callback) {
  return (dispath, getState) => {
    return dispath(fetchCertificates(cluster, service, callback))
  }
}

export const SERVICE_UPDATE_CERTIFICATIES_REQUEST = 'SERVICE_UPDATE_CERTIFICATIES_REQUEST'
export const SERVICE_UPDATE_CERTIFICATIES_SUCCESS = 'SERVICE_UPDATE_CERTIFICATIES_SUCCESS'
export const SERVICE_UPDATE_CERTIFICATIES_FAILURE = 'SERVICE_UPDATE_CERTIFICATIES_FAILURE'

function fetchUpdateCertificates(cluster, service, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_UPDATE_CERTIFICATIES_REQUEST, SERVICE_UPDATE_CERTIFICATIES_SUCCESS, SERVICE_UPDATE_CERTIFICATIES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/certificates`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {},
    },
    callback,
  }
}

export function updateCertificates(cluster, service, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchUpdateCertificates(cluster, service, body, callback))
  }
}

export const SERVICE_DELETE_CERTIFICATIES_REQUEST = 'SERVICE_DELETE_CERTIFICATIES_REQUEST'
export const SERVICE_DELETE_CERTIFICATIES_SUCCESS = 'SERVICE_DELETE_CERTIFICATIES_SUCCESS'
export const SERVICE_DELETE_CERTIFICATIES_FAILURE = 'SERVICE_DELETE_CERTIFICATIES_FAILURE'

function fetchDeleteCertificates(cluster, service, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_DELETE_CERTIFICATIES_REQUEST, SERVICE_DELETE_CERTIFICATIES_SUCCESS, SERVICE_DELETE_CERTIFICATIES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/certificates`,
      options: {
        method: 'DELETE',
      },
      schema: {},
    },
    callback,
  }
}

export function deleteCertificates(cluster, service, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteCertificates(cluster, service, callback))
  }
}
export const SERVICE_TOGGLE_HTTPS_REQUEST = 'SERVICE_TOGGLE_HTTPS_REQUEST'
export const SERVICE_TOGGLE_HTTPS_SUCCESS = 'SERVICE_TOGGLE_HTTPS_SUCCESS'
export const SERVICE_TOGGLE_HTTPS_FAILURE = 'SERVICE_TOGGLE_HTTPS_FAILURE'

function fetchToggleHTTPs(cluster, service, status, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_TOGGLE_HTTPS_REQUEST, SERVICE_TOGGLE_HTTPS_SUCCESS, SERVICE_TOGGLE_HTTPS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/tls?action=${status}`,
      options: {
        method: 'PUT',
      },
      schema: {},
    },
    callback,
  }
}

export function toggleHTTPs(cluster, service, status, callback) {
  return (dispath, getState) => {
    return dispath(fetchToggleHTTPs(cluster, service, status, callback))
  }
}
export const UPDATE_SERVICE_PORT_REQUEST = 'UPDATE_SERVICE_PORT_REQUEST'
export const UPDATE_SERVICE_PORT_SUCCESS = 'UPDATE_SERVICE_PORT_SUCCESS'
export const UPDATE_SERVICE_PORT_FAILED = 'UPDATE_SERVICE_PORT_FAILURE'

function fetchUpdateServicePort(clusterId, service, portInfo, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_SERVICE_PORT_REQUEST, UPDATE_SERVICE_PORT_SUCCESS, UPDATE_SERVICE_PORT_FAILED],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/services/${service}/portinfo`,
      options: {
        method: 'PUT',
        body: portInfo
      },
      schema: {}
    },
    callback
  }
}

export function updateServicePort(clusterId, service, portInfo, callback) {
  return (dispath, getState) => {
    return dispath(fetchUpdateServicePort(clusterId, service, portInfo, callback))
  }
}

export const EDIT_SERVICE_ENV_REQUEST = 'EDIT_SERVICE_ENV_REQUEST'
export const EDIT_SERVICE_ENV_SUCCESS = 'EDIT_SERVICE_ENV_SUCCESS'
export const EDIT_SERVICE_ENV_FAILED = 'EDIT_SERVICE_ENV_FAILURE'

function fetchEditServiceEnv(body, callback){
  return {
    [FETCH_API]: {
      types: [EDIT_SERVICE_ENV_REQUEST, EDIT_SERVICE_ENV_SUCCESS, EDIT_SERVICE_ENV_FAILED],
      endpoint: `${API_URL_PREFIX}/clusters/${body.clusterId}/services/${body.service}/env`,
      options: {
        method: 'PUT',
        body: body.arr
      },
      schema: {}
    },
    callback
  }
}

export function editServiceEnv(body, callback){
  return (dispath, getState) => {
    return dispath(fetchEditServiceEnv(body, callback))
  }
}

export const SET_SERVICE_PROXY_REQUEST = 'SET_SERVICE_PROXY_REQUEST'
export const SET_SERVICE_PROXY_SUCCESS = 'SET_SERVICE_PROXY_SUCCESS'
export const SET_SERVICE_PROXY_FAILURE = 'SET_SERVICE_PROXY_FAILURE'
function fetchSetServiceProxyGroup(body, callback){
  return {
    [FETCH_API]: {
      types: [SET_SERVICE_PROXY_REQUEST, SET_SERVICE_PROXY_SUCCESS, SET_SERVICE_PROXY_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/services/${body.service}/lbgroups/${body.groupID}`,
      options: {
        method: 'PUT',
        body:body
      },
      schema: {}
    },
    callback
  }
}

export function setServiceProxyGroup(body, callback){
  return (dispatch) => {
    return dispatch(fetchSetServiceProxyGroup(body, callback))
  }
}

// 数据库与缓存-集群详情-访问方式tab内集群访问方式保存
export const DB_SERVICE_PROXY_SAVE_REQUEST = 'DB_SERVICE_PROXY_SAVE_REQUEST'
export const DB_SERVICE_PROXY_SAVE_SUCCESS = 'DB_SERVICE_PROXY_SAVE_SUCCESS'
export const DB_SERVICE_PROXY_SAVE_FAILURE = 'DB_SERVICE_PROXY_SAVE_FAILURE'
function fetchDBServiceProxyGroup(clusterID, type, name, body, callback){
  return {
    [FETCH_API]: {
      types: [DB_SERVICE_PROXY_SAVE_REQUEST, DB_SERVICE_PROXY_SAVE_SUCCESS, DB_SERVICE_PROXY_SAVE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/daas/${type}/${name}/service`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {}
    },
    callback
  }
}

export function dbServiceProxyGroupSave(clusterID, type, name, body, callback){
  return (dispatch) => {
    return dispatch(fetchDBServiceProxyGroup(clusterID, type, name, body, callback))
  }
}

// 修改服务的annotation
const UPDATE_ANNOTATION_REQUEST = 'UPDATE_ANNOTATION_REQUEST'
const UPDATE_ANNOTATION_SUCCESS = 'UPDATE_ANNOTATION_SUCCESS'
const UPDATE_ANNOTATION_FAILURE = 'UPDATE_ANNOTATION_FAILURE'

function fetchUpdateAnnotation(cluster, service, body, callback){
  return {
    [FETCH_API]: {
      types: [UPDATE_ANNOTATION_REQUEST, UPDATE_ANNOTATION_SUCCESS, UPDATE_ANNOTATION_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/annotation`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {}
    },
    callback,
  }
}

export function UpdateServiceAnnotation(cluster, service, body, callback){
  return (dispatch) => {
    return dispatch(fetchUpdateAnnotation(cluster, service, body, callback))
  }
}

// 修改服务 hostname 和 subdomain 、 hostAliases
export const UPDATE_SERVICE_HOSTCONFIG_REQUEST = 'UPDATE_SERVICE_HOSTCONFIG_REQUEST'
export const UPDATE_SERVICE_HOSTCONFIG_SUCCESS = 'UPDATE_SERVICE_HOSTCONFIG_SUCCESS'
export const UPDATE_SERVICE_HOSTCONFIG_FAILURE = 'UPDATE_SERVICE_HOSTCONFIG_FAILURE'

const fetchUpdateHostConfig = (cluster, service, body, callback) => ({
  [FETCH_API]: {
    types: [
      UPDATE_SERVICE_HOSTCONFIG_REQUEST,
      UPDATE_SERVICE_HOSTCONFIG_SUCCESS,
      UPDATE_SERVICE_HOSTCONFIG_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/host`,
    schema: {},
    options: {
      method: 'PUT',
      body,
    }
  },
  callback,
})

export const updateHostConfig = (cluster, service, body, callback) =>
  dispatch => dispatch(fetchUpdateHostConfig(cluster, service, body, callback))

// 获取 ip 是否被占用
const GET_IPPOD_STATUS_REQUEST = 'GET_IPPOD_STATUS_REQUEST'
const GET_IPPOD_STATUS_SUCCESS = 'GET_IPPOD_STATUS_SUCCESS'
const GET_IPPOD_STATUS_FAILURE = 'GET_IPPOD_STATUS_FAILURE'

function fetchIpPodStatus(cluster, ip, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IPPOD_STATUS_REQUEST, GET_IPPOD_STATUS_SUCCESS, GET_IPPOD_STATUS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/isPodIpExisted/${ip}`,
      schema: {},
    },
    callback,
  }
}

export function getISIpPodExisted(cluster, ip, callback) {
  return (dispath, getState) => {
    return dispath(fetchIpPodStatus(cluster, ip, callback))
  }
}

export const SERVICE_INSTANCE_REQUEST = 'SERVICE_INSTANCE_REQUEST'
export const SERVICE_INSTANCE_SUCCESS = 'SERVICE_INSTANCE_SUCCESS'
export const SERVICE_INSTANCE_FAILURE = 'SERVICE_INSTANCE_FAILURE'

function fetchServiceIntance(cluster, services, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_INSTANCE_REQUEST, SERVICE_INSTANCE_SUCCESS, SERVICE_INSTANCE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/instances/services/${services}/instances`,
      schema: {}
    },
    callback,
  }
}

export function loadServiceInstance(cluster, serviceName, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceIntance(cluster, serviceName, callback))
  }
}

const PATCH_SERVICE_STRATEGY_REQUEST = 'PATCH_SERVICE_STRATEGY_REQUEST'
const PATCH_SERVICE_STRATEGY_SUCCESS = 'PATCH_SERVICE_STRATEGY_SUCCESS'
const PATCH_SERVICE_STRATEGY_FAILURE = 'PATCH_SERVICE_STRATEGY_FAILURE'

function fetchUpdateServiceStrategy(cluster, name, body, callback) {
  return {
    [FETCH_API]: {
      types: [
        PATCH_SERVICE_STRATEGY_REQUEST,
        PATCH_SERVICE_STRATEGY_SUCCESS,
        PATCH_SERVICE_STRATEGY_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${name}/strategy`,
      schema: {},
      options: {
        method: 'PATCH',
        body: {
          template: body,
        },
      },
    },
    callback,
  }
}

export function updateServiceStrategy(cluster, name, body, callback) {
  return dispatch => dispatch(
    fetchUpdateServiceStrategy(cluster, name, body, callback)
  )
}
