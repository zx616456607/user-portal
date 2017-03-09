/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster actions
 *
 * v0.1 - 2016-11-12
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const CLUSTER_LIST_REQUEST = 'CLUSTER_LIST_REQUEST'
export const CLUSTER_LIST_SUCCESS = 'CLUSTER_LIST_SUCCESS'
export const CLUSTER_LIST_FAILURE = 'CLUSTER_LIST_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CLUSTER_LIST_REQUEST, CLUSTER_LIST_SUCCESS, CLUSTER_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches clusters list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterList(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterList(query, callback))
  }
}

export const ADD_CLUSTER_REQUEST = 'ADD_CLUSTER_REQUEST'
export const ADD_CLUSTER_SUCCESS = 'ADD_CLUSTER_SUCCESS'
export const ADD_CLUSTER_FAILURE = 'ADD_CLUSTER_FAILURE'

function addFetchCluster(body, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_CLUSTER_REQUEST, ADD_CLUSTER_SUCCESS, ADD_CLUSTER_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/add`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function addClusters(boyd, callback) {
  return (dispatch, getState) => {
    return dispatch(addFetchCluster(body, callback))
  }
}


export const GET_HOST_INFO_REQUEST = 'GET_HOST_INFO_REQUEST'
export const GET_HOST_INFO_SUCCESS = 'GET_HOST_INFO_SUCCESS'
export const GET_HOST_INFO_FAILURE = 'GET_HOST_INFO_FAILURE'
// 主机信息
//  body => { clusterID, node }
function fetchHostInfo(body,callback) {
  return {
    [FETCH_API]: {
      types: [GET_HOST_INFO_REQUEST, GET_HOST_INFO_SUCCESS, GET_HOST_INFO_FAILURE],
      endpoint:`${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/info`,
      schema: {}
    },
    callback
  }
}

export function getHostInfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchHostInfo(body, callback))
  }
}

export const GET_CLUSTER_DYNAMIC_REQUEST = 'GET_CLUSTER_DYNAMIC_REQUEST'
export const GET_CLUSTER_DYNAMIC_SUCCESS = 'GET_CLUSTER_DYNAMIC_SUCCESS'
export const GET_CLUSTER_DYNAMIC_FAILURE = 'GET_CLUSTER_DYNAMIC_FAILURE'
// 实时信息
function fetchClusterInfo(body,callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_DYNAMIC_REQUEST, GET_CLUSTER_DYNAMIC_SUCCESS, GET_CLUSTER_DYNAMIC_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/${body.clusterID}/dynamicInfo`,
      schema: {}
    },
    callback
  }
}

export function getClusterInfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterInfo(body, callback))
  }
}

export const GET_CLUSTER_STATIC_REQUEST = 'GET_CLUSTER_STATIC_REQUEST'
export const GET_CLUSTER_STATIC_SUCCESS = 'GET_CLUSTER_STATIC_SUCCESS'
export const GET_CLUSTER_STATIC_FAILURE = 'GET_CLUSTER_STATIC_FAILURE'
// 静态信息
function fetchClusterStaticInfo(body,callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_STATIC_REQUEST, GET_CLUSTER_STATIC_SUCCESS, GET_CLUSTER_STATIC_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/${body.clusterID}/staticInfo`,
      schema: {}
    },
    callback
  }
}

export function getClusterStaticInfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterStaticInfo(body, callback))
  }
}

export const GET_CLUSTER_DETAIL_REQUEST = 'GET_CLUSTER_DETAIL_REQUEST'
export const GET_CLUSTER_DETAIL_SUCCESS = 'GET_CLUSTER_DETAIL_SUCCESS'
export const GET_CLUSTER_DETAIL_FAILURE = 'GET_CLUSTER_DETAIL_FAILURE'
// host pod list
function fetchNodesPodList(body,callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_DETAIL_REQUEST, GET_CLUSTER_DETAIL_SUCCESS, GET_CLUSTER_DETAIL_FAILURE],
      endpoint:`${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/podlist`,
      schema: {}
    },
    callback
  }
}

export function getNodesPodeList(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchNodesPodList(body, callback))
  }
}

export const LOAD_HOST_METRICS_REQUEST = 'LOAD_HOST_METRICS_REQUEST'
export const LOAD_HOST_METRICS_SUCCESS = 'LOAD_HOST_METRICS_SUCCESS'
export const LOAD_HOST_METRICS_FAILURE = 'LOAD_HOST_METRICS_FAILURE'


// query => cpu || memory, body=> clusterID, nodeName
function fetchHostMetrics(body, query) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_METRICS_REQUEST, LOAD_HOST_METRICS_SUCCESS, LOAD_HOST_METRICS_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadHostMetrics(body, query) {
  return (dispatch, getState) => {
    return dispatch(fetchHostMetrics(body, query))
  }
}

export const UPDATE_CLUSTER_REQUEST = 'UPDATE_CLUSTER_REQUEST'
export const UPDATE_CLUSTER_SUCCESS = 'UPDATE_CLUSTER_SUCCESS'
export const UPDATE_CLUSTER_FAILURE = 'UPDATE_CLUSTER_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateCluster(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_CLUSTER_REQUEST, UPDATE_CLUSTER_SUCCESS, UPDATE_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

// Fetches update cluster from API unless it is cached.
// Relies on Redux Thunk middleware.
export function updateCluster(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateCluster(cluster, body, callback))
  }
}

export const GET_ADD_CLUSTER_CMD_REQUEST = 'GET_ADD_CLUSTER_CMD_REQUEST'
export const GET_ADD_CLUSTER_CMD_SUCCESS = 'GET_ADD_CLUSTER_CMD_SUCCESS'
export const GET_ADD_CLUSTER_CMD_FAILURE = 'GET_ADD_CLUSTER_CMD_FAILURE'

function fetchAddClusterCMD(callback) {
  return {
    [FETCH_API]: {
      types: [GET_ADD_CLUSTER_CMD_REQUEST, GET_ADD_CLUSTER_CMD_SUCCESS, GET_ADD_CLUSTER_CMD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/add-cluster-cmd`,
      schema: {},
    },
    callback
  }
}

export function getAddClusterCMD(callback) {
  return (dispatch) => {
    return dispatch(fetchAddClusterCMD(callback))
  }
}