/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for middleware center
 *
 * @author zhangxuan
 * @date 2018-09-10
 */

import { FETCH_API, Schemas } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools'

export const SET_BPM_FORM_FIELDS = 'SET_BPM_FORM_FIELDS'

export const setBpmFormFields = (fields, callback) => {
  return {
    type: SET_BPM_FORM_FIELDS,
    fields,
    callback,
  }
}

export const CLEAR_BPM_FORM_FIELDS = 'CLEAR_BPM_FORM_FIELDS'

export const clearBpmFormFields = (fields, callback) => {
  return {
    type: CLEAR_BPM_FORM_FIELDS,
    callback,
  }
}

// 获取应用集群列表
export const BPM_CLUSTER_LIST_REQUEST = 'BPM_CLUSTER_LIST_REQUEST'
export const BPM_CLUSTER_LIST_SUCCESS = 'BPM_CLUSTER_LIST_SUCCESS'
export const BPM_CLUSTER_LIST_FAILURE = 'BPM_CLUSTER_LIST_FAILURE'
function fetchAppClusterList(cluster, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/appcenters`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    types: 'BPM',
    [FETCH_API]: {
      types: [ BPM_CLUSTER_LIST_REQUEST, BPM_CLUSTER_LIST_SUCCESS, BPM_CLUSTER_LIST_FAILURE ],
      endpoint,
      schema: Schemas.APPS,
      options: {
        // headers,
      },
    },
    callback,
  }
}

export function loadAppClusterList(cluster, query, callback) {
  return dispatch => {
    return dispatch(fetchAppClusterList(cluster, query, callback))
  }
}

// 获取应用集群详情
export const APP_CLUSTER_DETAIL_REQUEST = 'APP_CLUSTER_DETAIL_REQUEST'
export const APP_CLUSTER_DETAIL_SUCCESS = 'APP_CLUSTER_DETAIL_SUCCESS'
export const APP_CLUSTER_DETAIL_FAILURE = 'APP_CLUSTER_DETAIL_FAILURE'
function fetchAppClusterDetail(cluster, name, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/appcenters/${name}`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    [FETCH_API]: {
      types: [ APP_CLUSTER_DETAIL_REQUEST, APP_CLUSTER_DETAIL_SUCCESS, APP_CLUSTER_DETAIL_FAILURE ],
      endpoint,
      schema: Schemas.APPS,
      options: {
        // headers,
      },
    },
    callback,
  }
}

export function loadAppClusterDetail(cluster, name, query, callback) {
  return dispatch => {
    return dispatch(fetchAppClusterDetail(cluster, name, query, callback))
  }
}

// 删除应用集群
export const APP_CLUSTER_DELETE_REQUEST = 'APP_CLUSTER_DELETE_REQUEST'
export const APP_CLUSTER_DELETE_SUCCESS = 'APP_CLUSTER_DELETE_SUCCESS'
export const APP_CLUSTER_DELETE_FAILURE = 'APP_CLUSTER_DELETE_FAILURE'

function fetchDeleteAppClusters(cluster, name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [ APP_CLUSTER_DELETE_REQUEST, APP_CLUSTER_DELETE_SUCCESS, APP_CLUSTER_DELETE_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters/delete`,
      options: {
        method: 'POST',
        body: {
          names: name,
        },
      },
      schema: {},
    },
    callback,
  }
}

export function deleteAppsCluster(cluster, name, body, callback) {
  return dispatch => {
    return dispatch(fetchDeleteAppClusters(cluster, name, body, callback))
  }
}

// 重启应用集群
export const APP_CLUSTER_RESTART_REQUEST = 'APP_CLUSTER_RESTART_REQUEST'
export const APP_CLUSTER_RESTART_SUCCESS = 'APP_CLUSTER_RESTART_SUCCESS'
export const APP_CLUSTER_RESTART_FAILURE = 'APP_CLUSTER_RESTART_FAILURE'

function fetchRestartAppsCluster(cluster, name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [ APP_CLUSTER_RESTART_REQUEST, APP_CLUSTER_RESTART_SUCCESS,
        APP_CLUSTER_RESTART_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters/reboot`,
      options: {
        method: 'POST',
        body: {
          names: name,
        },
      },
      schema: {},
    },
    callback,
  }
}

export function restartAppsCluster(cluster, name, callback) {
  return dispatch => {
    return dispatch(fetchRestartAppsCluster(cluster, name, callback))
  }
}

// 启动应用集群
export const APP_CLUSTER_START_REQUEST = 'APP_CLUSTER_START_REQUEST'
export const APP_CLUSTER_START_SUCCESS = 'APP_CLUSTER_START_SUCCESS'
export const APP_CLUSTER_START_FAILURE = 'APP_CLUSTER_START_FAILURE'

function fetchStartApps(cluster, name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [ APP_CLUSTER_START_REQUEST, APP_CLUSTER_START_SUCCESS, APP_CLUSTER_START_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters/start`,
      options: {
        method: 'POST',
        body: {
          names: name,
        },
      },
      schema: {},
    },
    callback,
  }
}

export function startApps(cluster, name, callback) {
  return dispatch => {
    return dispatch(fetchStartApps(cluster, name, callback))
  }
}

// 停止应用集群
export const APP_CLUSTER_STOP_REQUEST = 'APP_CLUSTER_STOP_REQUEST'
export const APP_CLUSTER_STOP_SUCCESS = 'APP_CLUSTER_STOP_SUCCESS'
export const APP_CLUSTER_STOP_FAILURE = 'APP_CLUSTER_STOP_FAILURE'

function fetchStopApps(cluster, name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [ APP_CLUSTER_STOP_REQUEST, APP_CLUSTER_STOP_SUCCESS, APP_CLUSTER_STOP_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters/stop`,
      options: {
        method: 'POST',
        body: {
          names: name,
        },
      },
      schema: {},
    },
    callback,
  }
}

export function stopApps(cluster, name, callback) {
  return dispatch => {
    return dispatch(fetchStopApps(cluster, name, callback))
  }
}

// 获取服务列表
export const APP_CLUSTER_SERVER_LIST_REQUEST = 'APP_CLUSTER_SERVER_LIST_REQUEST'
export const APP_CLUSTER_SERVER_LIST_SUCCESS = 'APP_CLUSTER_SERVER_LIST_SUCCESS'
export const APP_CLUSTER_SERVER_LIST_FAILURE = 'APP_CLUSTER_SERVER_LIST_FAILURE'
function fetchAppClusterServerList(cluster, name, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/appcenters/${name}/services`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    [FETCH_API]: {
      types: [ APP_CLUSTER_SERVER_LIST_REQUEST, APP_CLUSTER_SERVER_LIST_SUCCESS,
        APP_CLUSTER_SERVER_LIST_FAILURE ],
      endpoint,
      schema: Schemas.APPS,
      options: {
        // headers,
      },
    },
    callback,
  }
}

export function loadAppClusterServerList(cluster, name, query, callback) {
  return dispatch => {
    return dispatch(fetchAppClusterServerList(cluster, name, query, callback))
  }
}
export const SET_CURRENT_APP = 'SET_CURRENT_APP'

export const setCurrentApp = app => ({
  type: SET_CURRENT_APP,
  app,
})

export const GET_MIDDLEWARE_APP_CLASSIFIES_REQUEST = 'GET_MIDDLEWARE_APP_CLASSIFIES_REQUEST'
export const GET_MIDDLEWARE_APP_CLASSIFIES_SUCCESS = 'GET_MIDDLEWARE_APP_CLASSIFIES_SUCCESS'
export const GET_MIDDLEWARE_APP_CLASSIFIES_FAILURE = 'GET_MIDDLEWARE_APP_CLASSIFIES_FAILURE'

const fetchAppClassifies = () => ({
  [FETCH_API]: {
    types: [
      GET_MIDDLEWARE_APP_CLASSIFIES_REQUEST,
      GET_MIDDLEWARE_APP_CLASSIFIES_SUCCESS,
      GET_MIDDLEWARE_APP_CLASSIFIES_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/appcenters/groups`,
    schema: {},
  },
})

export const getAppClassifies = () =>
  dispatch => dispatch(fetchAppClassifies())

export const GET_MIDDLEWARE_APPS_REQUEST = 'GET_MIDDLEWARE_APPS_REQUEST'
export const GET_MIDDLEWARE_APPS_SUCCESS = 'GET_MIDDLEWARE_APPS_SUCCESS'
export const GET_MIDDLEWARE_APPS_FAILURE = 'GET_MIDDLEWARE_APPS_FAILURE'

const fetchMiddlewareApps = query => ({
  [FETCH_API]: {
    types: [
      GET_MIDDLEWARE_APPS_REQUEST,
      GET_MIDDLEWARE_APPS_SUCCESS,
      GET_MIDDLEWARE_APPS_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/appcenters?${toQuerystring(query)}`,
    schema: {},
  },
})

export const getMiddlewareApps = query =>
  dispatch => dispatch(fetchMiddlewareApps(query))

export const CREATE_MIDDLEWARE_APP_REQUEST = 'CREATE_MIDDLEWARE_APP_REQUEST'
export const CREATE_MIDDLEWARE_APP_SUCCESS = 'CREATE_MIDDLEWARE_APP_SUCCESS'
export const CREATE_MIDDLEWARE_APP_FAILURE = 'CREATE_MIDDLEWARE_APP_FAILURE'

const fetchCreateMiddlewareApp = (cluster, body) => ({
  [FETCH_API]: {
    types: [
      CREATE_MIDDLEWARE_APP_REQUEST,
      CREATE_MIDDLEWARE_APP_SUCCESS,
      CREATE_MIDDLEWARE_APP_FAILURE,
    ],
    schema: {},
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters`,
    options: {
      headers: {
        'Content-Type': 'text/plain',
      },
      method: 'POST',
      body,
    },
  },
})

export const createMiddlewareApp = (cluster, body) =>
  dispatch => dispatch(fetchCreateMiddlewareApp(cluster, body))

export const CHECK_APP_CLUSTER_NAME_REQUEST = 'CHECK_APP_CLUSTER_NAME_REQUEST'
export const CHECK_APP_CLUSTER_NAME_SUCCESS = 'CHECK_APP_CLUSTER_NAME_SUCCESS'
export const CHECK_APP_CLUSTER_NAME_FAILURE = 'CHECK_APP_CLUSTER_NAME_FAILURE'

const fetchCheckAppClusterName = (cluster, name, callback) => ({
  [FETCH_API]: {
    types: [
      CHECK_APP_CLUSTER_NAME_REQUEST,
      CHECK_APP_CLUSTER_NAME_SUCCESS,
      CHECK_APP_CLUSTER_NAME_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters/${name}/exist`,
    schema: {},
  },
  callback,
})

export const checkAppClusterName = (cluster, name, callback) =>
  dispatch => dispatch(fetchCheckAppClusterName(cluster, name, callback))
