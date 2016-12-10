/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for database cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const GET_DATABASE_CACHE_ALL_NAME_REQUEST = 'GET_DATABASE_CACHE_ALL_NAME_REQUEST'
export const GET_DATABASE_CACHE_ALL_NAME_SUCCESS = 'GET_DATABASE_CACHE_ALL_NAME_SUCCESS'
export const GET_DATABASE_CACHE_ALL_NAME_FAILURE = 'GET_DATABASE_CACHE_ALL_NAME_FAILURE'

function fetchDbCacheAllNames(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_NAME_REQUEST, GET_DATABASE_CACHE_ALL_NAME_SUCCESS, GET_DATABASE_CACHE_ALL_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/getAllDbNames`,
      schema: {}
    },
    callback
  }
}

export function loadDbCacheAllNames(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchDbCacheAllNames(cluster, callback))
  }
}


export const GET_DATABASE_CACHE_ALL_LIST_REQUEST = 'GET_DATABASE_CACHE_ALL_LIST_REQUEST'
export const GET_DATABASE_CACHE_ALL_LIST_SUCCESS = 'GET_DATABASE_CACHE_ALL_LIST_SUCCESS'
export const GET_DATABASE_CACHE_ALL_LIST_FAILURE = 'GET_DATABASE_CACHE_ALL_LIST_FAILURE'
// MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST
function fetchDbCacheList(cluster, types, callback) {
  if (!types) types='mysql'
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_LIST_REQUEST, GET_DATABASE_CACHE_ALL_LIST_SUCCESS, GET_DATABASE_CACHE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices?type=${types}`,
      schema: {}
    },
    types,
    callback
  }
}

export function loadDbCacheList(cluster, types, callback) {
  return (dispatch) => {
    return dispatch(fetchDbCacheList(cluster, types, callback))
  }
}

export const REDIS_DATABASE_CACHE_ALL_LIST_REQUEST = 'REDIS_DATABASE_CACHE_ALL_LIST_REQUEST'
export const REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS = 'REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS'
export const REDIS_DATABASE_CACHE_ALL_LIST_FAILURE = 'REDIS_DATABASE_CACHE_ALL_LIST_FAILURE'

function fetchRedisDbCacheAllList(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [REDIS_DATABASE_CACHE_ALL_LIST_REQUEST, REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS, REDIS_DATABASE_CACHE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/getRedis`,
      schema: {}
    },
    callback
  }
}

export function loadRedisDbCacheAllList(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchRedisDbCacheAllList(cluster, callback))
  }
}

export const CREATE_MYSQL_DATABASE_CACHE_REQUEST = 'CREATE_MYSQL_DATABASE_CACHE_REQUEST'
export const CREATE_MYSQL_DATABASE_CACHE_SUCCESS = 'CREATE_MYSQL_DATABASE_CACHE_SUCCESS'
export const CREATE_MYSQL_DATABASE_CACHE_FAILURE = 'CREATE_MYSQL_DATABASE_CACHE_FAILURE'

function fetchCreateDbCluster(newDb, callback) {
  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_MYSQL_DATABASE_CACHE_REQUEST, CREATE_MYSQL_DATABASE_CACHE_SUCCESS, CREATE_MYSQL_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${newDb.cluster}/dbservices`,
      options: {
        method: 'POST',
        body: newDb
      },
      schema: {}
    },
    callback
  }
}

export function CreateDbCluster(newDb, callback) {
  return (dispatch) => {
    return dispatch(fetchCreateDbCluster(newDb, callback))
  }
}

export const CREATE_REDIS_DATABASE_CACHE_REQUEST = 'CREATE_REDIS_DATABASE_CACHE_REQUEST'
export const CREATE_REDIS_DATABASE_CACHE_SUCCESS = 'CREATE_REDIS_DATABASE_CACHE_SUCCESS'
export const CREATE_REDIS_DATABASE_CACHE_FAILURE = 'CREATE_REDIS_DATABASE_CACHE_FAILURE'

function createRedisDbCluster(newDb, callback) {
  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_REDIS_DATABASE_CACHE_REQUEST, CREATE_REDIS_DATABASE_CACHE_SUCCESS, CREATE_REDIS_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${newDb.cluster}/createRedisCluster`,
      options: {
        method: 'POST',
        body: {
          name: newDb.name,
          servicesNum: newDb.servicesNum
        }
      },
      schema: {}
    },
    callback
  }
}

export function postCreateRedisDbCluster(newDb, callback) {
  return (dispatch) => {
    return dispatch(createRedisDbCluster(newDb, callback))
  }
}

export const GET_DATABASE_DETAIL_INFO_REQUEST = 'GET_DATABASE_DETAIL_INFO_REQUEST'
export const GET_DATABASE_DETAIL_INFO_SUCCESS = 'GET_DATABASE_DETAIL_INFO_SUCCESS'
export const GET_DATABASE_DETAIL_INFO_FAILURE = 'GET_DATABASE_DETAIL_INFO_FAILURE'

function getDbClusterDetail(cluster, dbName, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_DETAIL_INFO_REQUEST, GET_DATABASE_DETAIL_INFO_SUCCESS, GET_DATABASE_DETAIL_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}`,
      schema: {}
    },
    callback
  }
}

export function loadDbClusterDetail(cluster, dbName, callback) {
  return (dispatch) => {
    return dispatch(getDbClusterDetail(cluster, dbName, callback))
  }
}

export const UPDATA_DATABASE_DETAIL_INFO_REQUEST = 'UPDATA_DATABASE_DETAIL_INFO_REQUEST'
export const UPDATA_DATABASE_DETAIL_INFO_SUCCESS = 'UPDATA_DATABASE_DETAIL_INFO_SUCCESS'
export const UPDATA_DATABASE_DETAIL_INFO_FAILURE = 'UPDATA_DATABASE_DETAIL_INFO_FAILURE'

function fetchPutDbClusterDetail(cluster, dbName, replicas, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATA_DATABASE_DETAIL_INFO_REQUEST, UPDATA_DATABASE_DETAIL_INFO_SUCCESS, UPDATA_DATABASE_DETAIL_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}`,
      options: {
        method: 'PATCH',
        body: {'replicas': replicas}
      },
      schema: {}
    },
    dbName,
    callback
  }
}

export function putDbClusterDetail(cluster, dbName, replicas, callback) {
  return (dispatch) => {
    return dispatch(fetchPutDbClusterDetail(cluster, dbName, replicas, callback))
  }
}

export const DELETE_DATABASE_CACHE_REQUEST = 'DELETE_DATABASE_CACHE_REQUEST'
export const DELETE_DATABASE_CACHE_SUCCESS = 'DELETE_DATABASE_CACHE_SUCCESS'
export const DELETE_DATABASE_CACHE_FAILURE = 'DELETE_DATABASE_CACHE_FAILURE'

function deleteDbCluster(cluster, dbName, clusterTypes ,callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_DATABASE_CACHE_REQUEST, DELETE_DATABASE_CACHE_SUCCESS, DELETE_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    types: clusterTypes,
    dbName,
    callback
  }
}

export function deleteDatabaseCluster(cluster, dbName, clusterTypes ,callback) {
  return (dispatch) => {
    return dispatch(deleteDbCluster(cluster, dbName, clusterTypes , callback))
  }
}

export const SEARCH_DATABASE_CLUSTER_TYPES = 'SEARCH_DATABASE_CLUSTER_TYPES'
export function searchDbservice(types, name) {
  return {
    type: SEARCH_DATABASE_CLUSTER_TYPES,
    types,
    name
  }
}

export const GET_DATABASE_STORAGE_ALL_LIST_REQUEST = 'GET_DATABASE_STORAGE_ALL_LIST_REQUEST'
export const GET_DATABASE_STORAGE_ALL_LIST_SUCCESS = 'GET_DATABASE_STORAGE_ALL_LIST_SUCCESS'
export const GET_DATABASE_STORAGE_ALL_LIST_FAILURE = 'GET_DATABASE_STORAGE_ALL_LIST_FAILURE'

function fetchDBStorageAllList(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_STORAGE_ALL_LIST_REQUEST, GET_DATABASE_STORAGE_ALL_LIST_SUCCESS, GET_DATABASE_STORAGE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/persistentvolumeclaims`,
      schema: {}
    },
    callback
  }
}

export function loadDBStorageAllList(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchDBStorageAllList(cluster, callback))
  }
}