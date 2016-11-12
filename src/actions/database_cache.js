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


export const MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST = 'MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST'
export const MYSQL_DATABASE_CACHE_ALL_LIST_SUCCESS = 'MYSQL_DATABASE_CACHE_ALL_LIST_SUCCESS'
export const MYSQL_DATABASE_CACHE_ALL_LIST_FAILURE = 'MYSQL_DATABASE_CACHE_ALL_LIST_FAILURE'

function fetchMysqlDbCacheAllList(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST, MYSQL_DATABASE_CACHE_ALL_LIST_SUCCESS, MYSQL_DATABASE_CACHE_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/getMysql`,
      schema: {}
    },
    callback
  }
}

export function loadMysqlDbCacheAllList(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchMysqlDbCacheAllList(cluster, callback))
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

function createMysqlDbCluster(newDb, callback) {
  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_MYSQL_DATABASE_CACHE_REQUEST, CREATE_MYSQL_DATABASE_CACHE_SUCCESS, CREATE_MYSQL_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${newDb.cluster}/createMysqlCluster`,
      options: {
        method: 'POST',
        body: {
          name: newDb.name,
          servicesNum: newDb.servicesNum,
          password: newDb.password
        }
      },
      schema: {}
    },
    callback
  }
}

export function postCreateMysqlDbCluster(newDb, callback) {
  return (dispatch) => {
    return dispatch(createMysqlDbCluster(newDb, callback))
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
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/getDatabaseDetail/${dbName}`,
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

export const DELETE_DATABASE_CACHE_REQUEST = 'DELETE_DATABASE_CACHE_REQUEST'
export const DELETE_DATABASE_CACHE_SUCCESS = 'DELETE_DATABASE_CACHE_SUCCESS'
export const DELETE_DATABASE_CACHE_FAILURE = 'DELETE_DATABASE_CACHE_FAILURE'

function deleteDbCluster(cluster, dbName, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_DATABASE_CACHE_REQUEST, DELETE_DATABASE_CACHE_SUCCESS, DELETE_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/deleteDatabase/${dbName}`,
      schema: {}
    },
    callback
  }
}

export function deleteDatabaseCluster(cluster, dbName, callback) {
  return (dispatch) => {
    return dispatch(deleteDbCluster(cluster, dbName, callback))
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