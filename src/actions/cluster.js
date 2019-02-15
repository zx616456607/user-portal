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

export const GET_CLUSTER_SUMMARY_REQUEST = 'GET_CLUSTER_SUMMARY_REQUEST'
export const GET_CLUSTER_SUMMARY_SUCCESS = 'GET_CLUSTER_SUMMARY_SUCCESS'
export const GET_CLUSTER_SUMMARY_FAILURE = 'GET_CLUSTER_SUMMARY_FAILURE'

function fetchClusterSummary(cluster, query, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_CLUSTER_SUMMARY_REQUEST, GET_CLUSTER_SUMMARY_SUCCESS, GET_CLUSTER_SUMMARY_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/${cluster}/summary?${toQuerystring(query)}`,
      schema: {}
    },
    callback
  }
}

export function getClusterSummary(cluster, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterSummary(cluster, query, callback))
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

export const SEARCH_NODE_PODLIST = 'SEARCH_NODE_PODLIST'
// pod name search
export function searchPodeList(podName) {
  return {
    podName,
    type: SEARCH_NODE_PODLIST
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

export const LOAD_HOST_INSTANT_REQUEST = 'LOAD_HOST_INSTANT_REQUEST'
export const LOAD_HOST_INSTANT_SUCCESS = 'LOAD_HOST_INSTANT_SUCCESS'
export const LOAD_HOST_INSTANT_FAILURE = 'LOAD_HOST_INSTANT_FAILURE'

function fetchHostInstant(body) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/instant`

  return {
    [FETCH_API]: {
      types: [LOAD_HOST_INSTANT_REQUEST, LOAD_HOST_INSTANT_SUCCESS, LOAD_HOST_INSTANT_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadHostInstant(body) {
  return (dispatch, getState) => {
    return dispatch(fetchHostInstant(body))
  }
}

export const LOAD_HOST_CPU_REQUEST = 'LOAD_HOST_CPU_REQUEST'
export const LOAD_HOST_CPU_SUCCESS = 'LOAD_HOST_CPU_SUCCESS'
export const LOAD_HOST_CPU_FAILURE = 'LOAD_HOST_CPU_FAILURE'

function fetchHostCpu(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics/cpu`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_CPU_REQUEST,LOAD_HOST_CPU_SUCCESS,LOAD_HOST_CPU_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function loadHostCpu(body, query, callback) {
  return dispatch => {
    return dispatch(fetchHostCpu(body, query, callback))
  }
}

export const LOAD_HOST_MEMORY_REQUEST = 'LOAD_HOST_MEMORY_REQUEST'
export const LOAD_HOST_MEMORY_SUCCESS = 'LOAD_HOST_MEMORY_SUCCESS'
export const LOAD_HOST_MEMORY_FAILURE = 'LOAD_HOST_MEMORY_FAILURE'

function fetchHostMemory(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics/memory`
  if (query){
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_MEMORY_REQUEST,LOAD_HOST_MEMORY_SUCCESS,LOAD_HOST_MEMORY_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function loadHostMemory(body, query, callback) {
  return dispatch => {
    return dispatch(fetchHostMemory(body, query, callback))
  }
}

export const LOAD_HOST_RXRATE_REQUEST = 'LOAD_HOST_RXRATE_REQUEST'
export const LOAD_HOST_RXRATE_SUCCESS = 'LOAD_HOST_RXRATE_SUCCESS'
export const LOAD_HOST_RXRATE_FAILURE = 'LOAD_HOST_RXRATE_FAILURE'

function fetchHostRxrate(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics/rxRate`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_RXRATE_REQUEST,LOAD_HOST_RXRATE_SUCCESS,LOAD_HOST_RXRATE_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function loadHostRxrate(body, query, callback){
  return dispatch => {
    return dispatch(fetchHostRxrate(body, query, callback))
  }
}

export const LOAD_HOST_TXRATE_REQUEST = 'LOAD_HOST_TXRATE_REQUEST'
export const LOAD_HOST_TXRATE_SUCCESS = 'LOAD_HOST_TXRATE_SUCCESS'
export const LOAD_HOST_TXRATE_FAILURE = 'LOAD_HOST_TXRATE_FAILURE'

function fetchHostTxrate(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics/txRate`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_TXRATE_REQUEST,LOAD_HOST_TXRATE_SUCCESS,LOAD_HOST_TXRATE_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function loadHostTxrate(body, query, callback){
  return dispatch => {
    return dispatch(fetchHostTxrate(body, query, callback))
  }
}

export const LOAD_HOST_READIO_REQUEST = 'LOAD_HOST_READIO_REQUEST'
export const LOAD_HOST_READIO_SUCCESS = 'LOAD_HOST_READIO_SUCCESS'
export const LOAD_HOST_READIO_FAILURE = 'LOAD_HOST_READIO_FAILURE'

function fetchHostDiskReadIo(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics/diskReadIo`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_READIO_REQUEST,LOAD_HOST_READIO_SUCCESS,LOAD_HOST_READIO_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function loadHostDiskReadIo(body, query, callback) {
  return dispatch => {
    return dispatch(fetchHostDiskReadIo(body, query, callback))
  }
}

export const LOAD_HOST_WRITEIO_REQUEST = 'LOAD_HOST_WRITEIO_REQUEST'
export const LOAD_HOST_WRITEIO_SUCCESS = 'LOAD_HOST_WRITEIO_SUCCESS'
export const LOAD_HOST_WRITEIO_FAILURE = 'LOAD_HOST_WRITEIO_FAILURE'

function fetchHostDiskWriteIo(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics/diskWriteIo`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_WRITEIO_REQUEST,LOAD_HOST_WRITEIO_SUCCESS,LOAD_HOST_WRITEIO_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function loadHostDiskWriteIo(body, query, callback) {
  return dispatch => {
    return dispatch(fetchHostDiskWriteIo(body, query, callback))
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

export const UPDATE_CONFIGS_REQUEST = 'UPDATE_CONFIGS_REQUEST'
export const UPDATE_CONFIGS_SUCCESS = 'UPDATE_CONFIGS_SUCCESS'
export const UPDATE_CONFIGS_FAILURE = 'UPDATE_CONFIGS_FAILURE'

// Update cluster configs from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateClusterConfig(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_CONFIGS_REQUEST, UPDATE_CONFIGS_SUCCESS, UPDATE_CONFIGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/configs`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

// Fetches update cluster configs from API unless it is cached.
// Relies on Redux Thunk middleware.
export function updateClusterConfig(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateClusterConfig(cluster, body, callback))
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

export const CREATE_CLUSTER_REQUEST = 'CREATE_CLUSTER_REQUEST'
export const CREATE_CLUSTER_SUCCESS = 'CREATE_CLUSTER_SUCCESS'
export const CREATE_CLUSTER_FAILURE = 'CREATE_CLUSTER_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateCluster(body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_CLUSTER_REQUEST, CREATE_CLUSTER_SUCCESS, CREATE_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

// Fetches create cluster from API unless it is cached.
// Relies on Redux Thunk middleware.
export function createCluster(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateCluster(body, callback))
  }
}

export const AUTO_CREATE_CLUSTER_REQUEST = 'AUTO_CREATE_CLUSTER_REQUEST'
export const AUTO_CREATE_CLUSTER_SUCCESS = 'AUTO_CREATE_CLUSTER_SUCCESS'
export const AUTO_CREATE_CLUSTER_FAILURE = 'AUTO_CREATE_CLUSTER_FAILURE'

function fetchAutoCreateCluster(body, callback) {
  return {
    [FETCH_API]: {
      types: [
        AUTO_CREATE_CLUSTER_REQUEST,
        AUTO_CREATE_CLUSTER_SUCCESS,
        AUTO_CREATE_CLUSTER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/add/autocreate`,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback,
  }
}

export function autoCreateCluster(body, callback) {
  return dispatch => dispatch(fetchAutoCreateCluster(body, callback))
}

export const AUTO_CREATE_NODE_REQUEST = 'AUTO_CREATE_NODE_REQUEST'
export const AUTO_CREATE_NODE_SUCCESS = 'AUTO_CREATE_NODE_SUCCESS'
export const AUTO_CREATE_NODE_FAILURE = 'AUTO_CREATE_NODE_FAILURE'

function fetchAutoCreateNode(body, callback) {
  return {
    [FETCH_API]: {
      types: [
        AUTO_CREATE_NODE_REQUEST,
        AUTO_CREATE_NODE_SUCCESS,
        AUTO_CREATE_NODE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/add/autocreate/node`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  }
}

export function autoCreateNode(body, callback) {
  return dispatch => dispatch(fetchAutoCreateNode(body, callback))
}

export const GET_CREATE_CLUSTER_FAILED_DATA_REQUEST = 'GET_CREATE_CLUSTER_FAILED_DATA_REQUEST'
export const GET_CREATE_CLUSTER_FAILED_DATA_SUCCESS = 'GET_CREATE_CLUSTER_FAILED_DATA_SUCCESS'
export const GET_CREATE_CLUSTER_FAILED_DATA_FAILURE = 'GET_CREATE_CLUSTER_FAILED_DATA_FAILURE'

function fetchCreateClusterFailedData(cluster) {
  return {
    [FETCH_API]: {
      types: [
        GET_CREATE_CLUSTER_FAILED_DATA_REQUEST,
        GET_CREATE_CLUSTER_FAILED_DATA_SUCCESS,
        GET_CREATE_CLUSTER_FAILED_DATA_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/add/autocreate/error/${cluster}`,
      schema: {},
    }
  }
}

export function getCreateClusterFailedData(cluster) {
  return dispatch => dispatch(fetchCreateClusterFailedData(cluster))
}

export const RESTART_FAILED_CLUSTER_REQUEST = 'RESTART_FAILED_CLUSTER_REQUEST'
export const RESTART_FAILED_CLUSTER_SUCCESS = 'RESTART_FAILED_CLUSTER_SUCCESS'
export const RESTART_FAILED_CLUSTER_FAILURE = 'RESTART_FAILED_CLUSTER_FAILURE'

function fetchRestartFailedCluster(cluster, query) {
  return {
    [FETCH_API]: {
      types: [
        RESTART_FAILED_CLUSTER_REQUEST,
        RESTART_FAILED_CLUSTER_SUCCESS,
        RESTART_FAILED_CLUSTER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/add/autocreate/restart/${cluster}?${toQuerystring(query)}`,
      schema: {},
    }
  }
}

export function restartFailedCluster(cluster, query) {
  return dispatch => dispatch(fetchRestartFailedCluster(cluster, query))
}

export const CHECK_HOSTINFO_REQUEST = 'CHECK_HOSTINFO_REQUEST'
export const CHECK_HOSTINFO_SUCCESS = 'CHECK_HOSTINFO_SUCCESS'
export const CHECK_HOSTINFO_FAILURE = 'CHECK_HOSTINFO_FAILURE'

function fetchCheckHostInfo(body) {
  return {
    [FETCH_API]: {
      types: [
        CHECK_HOSTINFO_REQUEST,
        CHECK_HOSTINFO_SUCCESS,
        CHECK_HOSTINFO_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/add/autocreate/hostinfo`,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    }
  }
}

export const checkHostInfo = body =>
  dispatch => dispatch(fetchCheckHostInfo(body))

export const GET_CLUSTER_DETAIL_DATA_REQUEST = 'GET_CLUSTER_DETAIL_DATA_REQUEST'
export const GET_CLUSTER_DETAIL_DATA_SUCCESS = 'GET_CLUSTER_DETAIL_DATA_SUCCESS'
export const GET_CLUSTER_DETAIL_DATA_FAILURE = 'GET_CLUSTER_DETAIL_DATA_FAILURE'

function fetchClusterDetailData(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [
        GET_CLUSTER_DETAIL_DATA_REQUEST,
        GET_CLUSTER_DETAIL_DATA_SUCCESS,
        GET_CLUSTER_DETAIL_DATA_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}`,
      schema: {},
    },
    callback,
  }
}

export function getClusterDetail(cluster, callback) {
  return dispatch => dispatch(fetchClusterDetailData(cluster, callback))
}

export const CREATING_CLUSTER_INTERVAL = 'CREATING_CLUSTER_INTERVAL'

export function creatingClusterInterval(data) {
  return {
    type: CREATING_CLUSTER_INTERVAL,
    data,
  }
}

export const ADDING_HOSTS_INTERVAL = 'ADDING_HOSTS_INTERVAL'

export function addingHostsInterval(data, callback) {
  return {
    type: ADDING_HOSTS_INTERVAL,
    data,
    callback,
  }
}

export const DELETE_CLUSTER_REQUEST = 'DELETE_CLUSTER_REQUEST'
export const DELETE_CLUSTER_SUCCESS = 'DELETE_CLUSTER_SUCCESS'
export const DELETE_CLUSTER_FAILURE = 'DELETE_CLUSTER_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteCluster(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_CLUSTER_REQUEST, DELETE_CLUSTER_SUCCESS, DELETE_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}`,
      options: {
        method: 'DELETE',
      },
      schema: {}
    },
    callback
  }
}

// Fetches create cluster from API unless it is cached.
// Relies on Redux Thunk middleware.
export function deleteCluster(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteCluster(cluster, callback))
  }
}

export const PROXY_GET_REQUEST = 'PROXY_GET_REQUEST'
export const PROXY_GET_SUCCESS = 'PROXY_GET_SUCCESS'
export const PROXY_GET_FAILURE = 'PROXY_GET_FAILURE'

function fetchProxy(cluster, needFetching, callback) {
  return {
    [FETCH_API]: {
      types: [PROXY_GET_REQUEST, PROXY_GET_SUCCESS, PROXY_GET_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/proxies`,
      schema: {}
    },
    callback,
    needFetching
  }
}

export function getProxy(cluster, needFetching, callback) {
  if(typeof needFetching != 'boolean') {
    callback = needFetching
    needFetching = true
  }
  return (dispatch, getState) => {
    return dispatch(fetchProxy(cluster, needFetching, callback))
  }
}

export const PROXY_UPDATE_REQUEST = 'PROXY_UPDATE_REQUEST'
export const PROXY_UPDATE_SUCCESS = 'PROXY_UPDATE_SUCCESS'
export const PROXY_UPDATE_FAILURE = 'PROXY_UPDATE_FAILURE'

function fetchUpdateProxy(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [PROXY_UPDATE_REQUEST, PROXY_UPDATE_SUCCESS, PROXY_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/proxies`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function updateProxy(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProxy(cluster, body, callback))
  }
}



export const GET_CLUSTER_NODE_ADDR_REQUEST = 'GET_CLUSTER_NODE_ADDR_REQUEST'
export const GET_CLUSTER_NODE_ADDR_SUCCESS = 'GET_CLUSTER_NODE_ADDR_SUCCESS'
export const GET_CLUSTER_NODE_ADDR_FAILURE = 'GET_CLUSTER_NODE_ADDR_FAILURE'

function fetchClusterNodeAddr(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_NODE_ADDR_REQUEST, GET_CLUSTER_NODE_ADDR_SUCCESS, GET_CLUSTER_NODE_ADDR_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/node_addr`,
      schema: {}
    },
    callback
  }
}

export function getClusterNodeAddr(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterNodeAddr(cluster, callback))
  }
}


export const GET_CLUSTER_PLUGINS_REQUEST = 'GET_CLUSTER_PLUGINS_REQUEST'
export const GET_CLUSTER_PLUGINS_SUCCESS = 'GET_CLUSTER_PLUGINS_SUCCESS'
export const GET_CLUSTER_PLUGINS_FAILURE = 'GET_CLUSTER_PLUGINS_FAILURE'

function fetchClusterPlugins(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_PLUGINS_REQUEST, GET_CLUSTER_PLUGINS_SUCCESS, GET_CLUSTER_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/plugins`,
      schema: {}
    },
    callback
  }
}

export function getClusterPlugins(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterPlugins(cluster, callback))
  }
}



export const UPDATE_CLUSTER_PLUGINS_REQUEST = 'UPDATE_CLUSTER_PLUGINS_REQUEST'
export const UPDATE_CLUSTER_PLUGINS_SUCCESS = 'UPDATE_CLUSTER_PLUGINS_SUCCESS'
export const UPDATE_CLUSTER_PLUGINS_FAILURE = 'UPDATE_CLUSTER_PLUGINS_FAILURE'

function fetchUpdateClusterPlugins(cluster, name, body, callback) {
  const reset = body.reset
  return {
    [FETCH_API]: {
      types: [UPDATE_CLUSTER_PLUGINS_REQUEST, UPDATE_CLUSTER_PLUGINS_SUCCESS, UPDATE_CLUSTER_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/plugins/${name}${reset != undefined ? '?reset=' + reset : ''}`,
      schema: {},
      options: {
        method: 'PUT',
        body: body
      }
    },
    callback
  }
}

export function updateClusterPlugins(cluster, name, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateClusterPlugins(cluster, name, body, callback))
  }
}

export const DELETE_PLUGINS_REQUEST = 'DELETE_PLUGINS_REQUEST'
export const DELETE_PLUGINS_SUCCESS = 'DELETE_PLUGINS_SUCCESS'
export const DELETE_PLUGINS_FAILURE = 'DELETE_PLUGINS_FAILURE'

function fetchDelPlugins(body,callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_PLUGINS_REQUEST, DELETE_PLUGINS_SUCCESS, DELETE_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/plugins?pluginNames=${body.pluginNames}`,
      options: {
        method:'DELETE',
      },
      schema: {},
    },
    callback
  }
}

export function deleteMiddleware(plugins,callback) {
  return (dispatch) => {
    return dispatch(fetchDelPlugins(plugins,callback))
  }
}


export const INSTALL_PLUGIN_INDEX_TPL_REQUEST = 'INSTALL_PLUGIN_INDEX_TPL_REQUEST'
export const INSTALL_PLUGIN_INDEX_TPL_SUCCESS = 'INSTALL_PLUGIN_INDEX_TPL_SUCCESS'
export const INSTALL_PLUGIN_INDEX_TPL_FAILURE = 'INSTALL_PLUGIN_INDEX_TPL_FAILURE'

function fetchInitPlugins(cluster, plugin, callback) {
  return {
    [FETCH_API]: {
      types: [INSTALL_PLUGIN_INDEX_TPL_REQUEST, INSTALL_PLUGIN_INDEX_TPL_SUCCESS, INSTALL_PLUGIN_INDEX_TPL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/plugins/${plugin}/init`,
      options: {
        method: 'POST'
      },
      schema: {}
    },
    callback
  }
}

export function initPlugins(cluster, plugin, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchInitPlugins(cluster, plugin, callback))
  }
}

export const EDIT_PLUGINS_REQUERT = 'EDIT_PLUGINS_REQUERT'
export const EDIT_PLUGINS_SUCCESS = 'EDIT_PLUGINS_SUCCESS'
export const EDIT_PLUGINS_FAILURE = 'EDIT_PLUGINS_FAILURE'

function fetchUpdatePlugins(body,type,callback) {
  return {
    [FETCH_API]: {
      types: [EDIT_PLUGINS_REQUERT, EDIT_PLUGINS_SUCCESS, EDIT_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/plugins/operation/${type}`,
      options: {
        method:'PUT',
        body:body
      },
      schema: {},
    },
    callback
  }
}


export function updateMiddleware(body,type,callback) {
  return (dispatch) => {
    return dispatch(fetchUpdatePlugins(body,type,callback))
  }
}


export const CREATE_CLUSTER_PLUGINS_REQUEST = 'CREATE_CLUSTER_PLUGINS_REQUEST'
export const CREATE_CLUSTER_PLUGINS_SUCCESS = 'CREATE_CLUSTER_PLUGINS_SUCCESS'
export const CREATE_CLUSTER_PLUGINS_FAILURE = 'CREATE_CLUSTER_PLUGINS_FAILURE'

function fetchCreatePlugins(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_CLUSTER_PLUGINS_REQUEST, CREATE_CLUSTER_PLUGINS_SUCCESS, CREATE_CLUSTER_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/plugins`,
      options: {
        method:'POST',
        body,
      },
      schema: {},
    },
    callback
  }
}

export function createMiddleware(cluster, body, callback) {
  return (dispatch) => {
    return dispatch(fetchCreatePlugins(cluster, body, callback))
  }
}

export const SET_DEFAULT_GROUP_REQUERT = 'SET_DEFAULT_GROUP_REQUERT'
export const SET_DEFAULT_GROUP_SUCCESS = 'SET_DEFAULT_GROUP_SUCCESS'
export const SET_DEFAULT_GROUP_FAILURE = 'SET_DEFAULT_GROUP_FAILURE'

function fetchSetDefultGruop(clusterID, groupID, callback) {
  return {
    [FETCH_API]: {
      types: [SET_DEFAULT_GROUP_REQUERT, SET_DEFAULT_GROUP_SUCCESS, SET_DEFAULT_GROUP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/proxies/${groupID}/as_default`,
      options: {
        method:'PUT'
      },
      schema: {},
    },
    callback
  }
}


export function setDefaultGroup(clusterID, groupId, callback) {
  return (dispatch) => {
    return dispatch(fetchSetDefultGruop(clusterID, groupId, callback))
  }
}


export const GET_CLUSTER_STORAGE_LIST_REQUEST = 'GET_CLUSTER_STORAGE_LIST_REQUEST'
export const GET_CLUSTER_STORAGE_LIST_SUCCESS = 'GET_CLUSTER_STORAGE_LIST_SUCCESS'
export const GET_CLUSTER_STORAGE_LIST_FAILURE = 'GET_CLUSTER_STORAGE_LIST_FAILURE'

function fetchGetClusterStorageList(cluster, callback){
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_STORAGE_LIST_REQUEST, GET_CLUSTER_STORAGE_LIST_SUCCESS, GET_CLUSTER_STORAGE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/storageclass`,
      options: {
        method: 'GET'
      },
      schema: {}
    },
    cluster,
    callback
  }
}

export function getClusterStorageList(cluster, callback){
  return (dispatch, getState) => {
    return dispatch(fetchGetClusterStorageList(cluster, callback))
  }
}


export const CREATE_CEPH_STORAGE_REQUEST = 'CREATE_CEPH_STORAGE_REQUEST'
export const CREATE_CEPH_STORAGE_SUCCESS = 'CREATE_CEPH_STORAGE_SUCCESS'
export const CREATE_CEPH_STORAGE_FAILURE = 'CREATE_CEPH_STORAGE_FAILURE'

function fetchCreateCephStorage(cluster, query, body, callback, method){
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/storageclass`
  if(query){
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CREATE_CEPH_STORAGE_REQUEST, CREATE_CEPH_STORAGE_SUCCESS, CREATE_CEPH_STORAGE_FAILURE],
      endpoint,
      options: {
        method: method || 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function createCephStorage(cluster, query, body, callback, method){
  return (dispatch, getState) => {
    return dispatch(fetchCreateCephStorage(cluster, query, body, callback, method, ))
  }
}


export const UPDATE_STORAGE_CLASS_REQUEST = 'UPDATE_STORAGE_CLASS_REQUEST'
export const UPDATE_STORAGE_CLASS_SUCCESS = 'UPDATE_STORAGE_CLASS_SUCCESS'
export const UPDATE_STORAGE_CLASS_FAILURE = 'UPDATE_STORAGE_CLASS_FAILURE'

function fetchUpdateStorageClass(cluster, query, body, callback){
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/storageclass`
  if(query){
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [UPDATE_STORAGE_CLASS_REQUEST, UPDATE_STORAGE_CLASS_SUCCESS, UPDATE_STORAGE_CLASS_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function updateStorageClass(cluster, query, body, callback){
  return (dispatch, getState) => {
    return dispatch(fetchUpdateStorageClass(cluster, query, body, callback))
  }
}

export const DELETE_STORAGE_CLASS_REQUEST = 'DELETE_STORAGE_CLASS_REQUEST'
export const DELETE_STORAGE_CLASS_SUCCESS = 'DELETE_STORAGE_CLASS_SUCCESS'
export const DELETE_STORAGE_CLASS_FAILURE = 'DELETE_STORAGE_CLASS_FAILURE'

function fetchDeleteStorageClass(cluster, name, callback){
  return {
    [FETCH_API]: {
      types: [DELETE_STORAGE_CLASS_REQUEST, DELETE_STORAGE_CLASS_SUCCESS, DELETE_STORAGE_CLASS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/storageclass/${name}`,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback,
  }
}

export function deleteStorageClass(cluster, name, callback){
  return (dispatch, getState) => {
    return dispatch(fetchDeleteStorageClass(cluster, name, callback))
  }
}

export const UPDATE_KUBEPROXY_REQUEST = 'UPDATE_KUBEPROXY_REQUEST'
export const UPDATE_KUBEPROXY_SUCCESS = 'UPDATE_KUBEPROXY_SUCCESS'
export const UPDATE_KUBEPROXY_FAILURE = 'UPDATE_KUBEPROXY_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateKubeproxy(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_KUBEPROXY_REQUEST, UPDATE_KUBEPROXY_SUCCESS, UPDATE_KUBEPROXY_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/kubeproxy`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function updateKubeproxy(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateKubeproxy(cluster, body, callback))
  }
}

export const GET_KUBEPROXY_REQUEST = 'GET_KUBEPROXY_REQUEST'
export const GET_KUBEPROXY_SUCCESS = 'GET_KUBEPROXY_SUCCESS'
export const GET_KUBEPROXY_FAILURE = 'GET_KUBEPROXY_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetKubeproxy(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_KUBEPROXY_REQUEST, GET_KUBEPROXY_SUCCESS, GET_KUBEPROXY_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/kubeproxy`,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function getKubeproxy(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetKubeproxy(cluster, callback))
  }
}


export const SET_CLUSTERHARBOR_REQUEST = 'SET_CLUSTERHARBOR_REQUEST'
export const SET_CLUSTERHARBOR_SUCCESS = 'SET_CLUSTERHARBOR_SUCCESS'
export const SET_CLUSTERHARBOR_FAILURE = 'SET_CLUSTERHARBOR_FAILURE'

function fetchSetClusterHarbor(cluster, body, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SET_CLUSTERHARBOR_REQUEST, SET_CLUSTERHARBOR_SUCCESS, SET_CLUSTERHARBOR_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/${cluster}/configs/harbor`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function setClusterHarbor(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSetClusterHarbor(cluster, body, callback))
  }
}

// 获取已经注册的服务列表
export const REGISTERED_SERVICE_REQUEST = 'REGISTERED_SERVICE_REQUEST'
export const REGISTERED_SERVICE_SUCCESS = 'REGISTERED_SERVICE_SUCCESS'
export const REGISTERED_SERVICE_FAILURE = 'REGISTERED_SERVICE_FAILURE'
const fetchRegisteredServiceList = (clusterId, teamspace, callback) => {
  return {
    [FETCH_API]: {
      types: [
        REGISTERED_SERVICE_REQUEST,
        REGISTERED_SERVICE_SUCCESS,
        REGISTERED_SERVICE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/dubbo/services`,
      schema: {},
      options: {
        method: 'PUT',
        headers: { teamspace }
      }
    },
    callback,
  }
}

export const getRegisteredServiceList = (clusterId, teamspace, callback) => {
  return dispatch => {
    dispatch (fetchRegisteredServiceList(clusterId, teamspace, callback))
  }
}

export const GET_PROJECT_BY_CLUSTER_REQUEST = 'GET_PROJECT_BY_CLUSTER_REQUEST'
export const GET_PROJECT_BY_CLUSTER_SUCCESS = 'GET_PROJECT_BY_CLUSTER_SUCCESS'
export const GET_PROJECT_BY_CLUSTER_FAILURE = 'GET_PROJECT_BY_CLUSTER_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectByClustr(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [
        GET_PROJECT_BY_CLUSTER_REQUEST,
        GET_PROJECT_BY_CLUSTER_SUCCESS,
        GET_PROJECT_BY_CLUSTER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/projects`,
      schema: {}
    },
    callback
  }
}

export function getProjectByClustr(cluster, callback) {
  return dispatch => {
    return dispatch(fetchProjectByClustr(cluster, callback))
  }
}