/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-11-15
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const APP_STATUS_REQUEST = 'APP_STATUS_REQUEST'
export const APP_STATUS_SUCCESS = 'APP_STATUS_SUCCESS'
export const APP_STATUS_FAILURE = 'APP_STATUS_FAILURE'

// Fetches app status from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppStatus(clusterID, namespace) {
  let endpoint = `${API_URL_PREFIX}/statistics/clusters/${clusterID}/namespaces/${namespace}/app_statuses`
  return {
    [FETCH_API]: {
      types: [APP_STATUS_REQUEST, APP_STATUS_SUCCESS, APP_STATUS_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches app status from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAppStatus(clusterID, namespace) {
  return (dispatch, getState) => {
    return dispatch(fetchAppStatus(clusterID, namespace))
  }
}

export const SERVICE_STATUS_REQUEST = 'SERVICE_STATUS_REQUEST'
export const SERVICE_STATUS_SUCCESS = 'SERVICE_STATUS_SUCCESS'
export const SERVICE_STATUS_FAILURE = 'SERVICE_STATUS_FAILURE'

// Fetches service status from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceStatus(clusterID, namespace) {
  let endpoint = `${API_URL_PREFIX}/statistics/clusters/${clusterID}/namespaces/${namespace}/service_statuses`
  return {
    [FETCH_API]: {
      types: [SERVICE_STATUS_REQUEST, SERVICE_STATUS_SUCCESS, SERVICE_STATUS_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches service status from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceStatus(clusterID, namespace) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceStatus(clusterID, namespace))
  }
}

export const POD_STATUS_REQUEST = 'POD_STATUS_REQUEST'
export const POD_STATUS_SUCCESS = 'POD_STATUS_SUCCESS'
export const POD_STATUS_FAILURE = 'POD_STATUS_FAILURE'

// Fetches pod status from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPodStatus(clusterID, namespace) {
  let endpoint = `${API_URL_PREFIX}/statistics/clusters/${clusterID}/namespaces/${namespace}/pod_statuses`
  return {
    [FETCH_API]: {
      types: [POD_STATUS_REQUEST, POD_STATUS_SUCCESS, POD_STATUS_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches pod status from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadPodStatus(clusterID, namespace) {
  return (dispatch, getState) => {
    return dispatch(fetchPodStatus(clusterID, namespace))
  }
}