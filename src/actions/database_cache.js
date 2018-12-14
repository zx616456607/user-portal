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
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/dbservices?type=${types}`
  if (types === 'mysql' || types === 'redis' || types === 'rabbitmq') {
    endpoint = `${API_URL_PREFIX}/clusters/${cluster}/daas/${types}`
  }
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_CACHE_ALL_LIST_REQUEST, GET_DATABASE_CACHE_ALL_LIST_SUCCESS, GET_DATABASE_CACHE_ALL_LIST_FAILURE],
      endpoint,
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

export const CREATE_DATABASE_CACHE_REQUEST = 'CREATE_DATABASE_CACHE_REQUEST'
export const CREATE_DATABASE_CACHE_SUCCESS = 'CREATE_DATABASE_CACHE_SUCCESS'
export const CREATE_DATABASE_CACHE_FAILURE = 'CREATE_DATABASE_CACHE_FAILURE'

function fetchCreateDbCluster(newDb, callback) {
  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_DATABASE_CACHE_REQUEST, CREATE_DATABASE_CACHE_SUCCESS, CREATE_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${newDb.cluster}/dbservices`,
      options: {
        headers: { teamspace: newDb.teamspace },
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

function getDbClusterDetail(cluster, dbName, type, needLoading, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/daas/${type}/${dbName}`
  if(type === 'zookeeper' || type === 'elasticsearch') {
    endpoint = `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}`
  }
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_DATABASE_DETAIL_INFO_REQUEST, GET_DATABASE_DETAIL_INFO_SUCCESS, GET_DATABASE_DETAIL_INFO_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
    needLoading
  }
}

export function loadDbClusterDetail(cluster, dbName, type, needLoading, callback) {
  if(typeof needLoading != 'boolean') {
    callback = needLoading
    needLoading = true
  }
  return (dispatch) => {
    return dispatch(getDbClusterDetail(cluster, dbName, type, needLoading, callback))
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
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/daas/${clusterTypes}/${dbName}`
  if(clusterTypes === 'zookeeper' || clusterTypes === 'elasticsearch') {
    endpoint = `${API_URL_PREFIX}/clusters/${cluster}/dbservices/${dbName}?type=${clusterTypes}`
  }
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_DATABASE_CACHE_REQUEST, DELETE_DATABASE_CACHE_SUCCESS, DELETE_DATABASE_CACHE_FAILURE],
      endpoint,
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

// 获取MySQL集群配置
export const GET_MYSQL_CONFIG_REQUEST = 'GET_MYSQL_CONFIG_REQUEST'
export const GET_MYSQL_CONFIG_SUCCESS = 'GET_MYSQL_CONFIG_SUCCESS'
export const GET_MYSQL_CONFIG_FAILURE = 'GET_MYSQL_CONFIG_FAILURE'

function fetchMySqlConfig(cluster, name, callback) {
  return {
    [FETCH_API]: {
      types: [GET_MYSQL_CONFIG_REQUEST, GET_MYSQL_CONFIG_SUCCESS, GET_MYSQL_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/daas/mysql/${name}/config`,
      schema: {}
    },
    callback
  }
}
export function getMySqlConfig(cluster, name, callback) {
  return (dispatch) => {
    return dispatch(fetchMySqlConfig(cluster, name, callback))
  }
}
// 获取集群默认配置
export const GET_DB_CLUSTER_CONFIG_DEFAULT_REQUEST = 'GET_DB_CLUSTER_CONFIG_DEFAULT_REQUEST'
export const GET_DB_CLUSTER_CONFIG_DEFAULT_SUCCESS = 'GET_DB_CLUSTER_CONFIG_DEFAULT_SUCCESS'
export const GET_DB_CLUSTER_CONFIG_DEFAULT_FAILURE = 'GET_DB_CLUSTER_CONFIG_DEFAULT_FAILURE'

function fetchConfigDefault(cluster, type, callback) {
  return {
    [FETCH_API]: {
      types: [GET_DB_CLUSTER_CONFIG_DEFAULT_REQUEST, GET_DB_CLUSTER_CONFIG_DEFAULT_SUCCESS, GET_DB_CLUSTER_CONFIG_DEFAULT_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/daas/${type}/config/default`,
      schema: {}
    },
    callback
  }
}
export function getConfigDefault(cluster, type, callback) {
  return (dispatch) => {
    return dispatch(fetchConfigDefault(cluster, type, callback))
  }
}

// 创建集群配置
export const CREATE_DB_CLUSTER_CONFIG_REQUEST = 'CREATE_DB_CLUSTER_CONFIG_REQUEST'
export const CREATE_DB_CLUSTER_CONFIG_SUCCESS = 'CREATE_DB_CLUSTER_CONFIG_SUCCESS'
export const CREATE_DB_CLUSTER_CONFIG_FAILURE = 'CREATE_DB_CLUSTER_CONFIG_FAILURE'

function createMySqlConfigRequest(cluster, name, config, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_DB_CLUSTER_CONFIG_REQUEST, CREATE_DB_CLUSTER_CONFIG_SUCCESS, CREATE_DB_CLUSTER_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/daas/mysql/${name}/config`,
      schema: {},
      options: {
        method: 'POST',
        body: {
          config
        }
      },
    },
    callback
  }
}
export function createMySqlConfig(cluster, name, config, callback) {
  return (dispatch) => {
    return dispatch(createMySqlConfigRequest(cluster, name, config, callback))
  }
}


// 更新集群配置
export const UPDATE_DB_CLUSTER_CONFIG_REQUEST = 'UPDATE_DB_CLUSTER_CONFIG_REQUEST'
export const UPDATE_DB_CLUSTER_CONFIG_SUCCESS = 'UPDATE_DB_CLUSTER_CONFIG_SUCCESS'
export const UPDATE_DB_CLUSTER_CONFIG_FAILURE = 'UPDATE_DB_CLUSTER_CONFIG_FAILURE'

function updateMySqlConfigRequest(cluster, name, config, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_DB_CLUSTER_CONFIG_REQUEST, UPDATE_DB_CLUSTER_CONFIG_SUCCESS, UPDATE_DB_CLUSTER_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/daas/mysql/${name}/config`,
      schema: {},
      options: {
        method: 'PUT',
        body: {
          config
        }
      },
    },
    callback
  }
}
export function updateMySqlConfig(cluster, name, config, callback) {
  return (dispatch) => {
    return dispatch(updateMySqlConfigRequest(cluster, name, config, callback))
  }
}


 // 创建MYSQL集群密码
export const CREATE_MYSQL_PWD_REQUEST = 'CREATE_MYSQL_PWD_REQUEST'
export const CREATE_MYSQL_PWD_SUCCESS = 'CREATE_MYSQL_PWD_SUCCESS'
export const CREATE_MYSQL_PWD_FAILURE = 'CREATE_MYSQL_PWD_FAILURE'

function createMySqlPwd(clusterID, clusterName, pwd, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_MYSQL_PWD_REQUEST, CREATE_MYSQL_PWD_SUCCESS, CREATE_MYSQL_PWD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/daas/mysql/${clusterName}/secret`,
      options: {
        method: 'POST',
        body: {
          root_password: pwd
        }
      },
      schema: {}
    },
    callback
  }
}
export function createMySqlClusterPwd(cluster, clusterName, pwd, callback) {
  return (dispatch) => {
    return dispatch(createMySqlPwd(cluster, clusterName, pwd, callback))
  }
}

// 修改MYSQL集群密码
export const UPDATE_MYSQL_PWD_REQUEST = 'UPDATE_MYSQL_PWD_REQUEST'
export const UPDATE_MYSQL_PWD_SUCCESS = 'UPDATE_MYSQL_PWD_SUCCESS'
export const UPDATE_MYSQL_PWD_FAILURE = 'UPDATE_MYSQL_PWD_FAILURE'

function updateMySqlCreatePwdRequest(clusterID, clusterName, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_MYSQL_PWD_REQUEST, UPDATE_MYSQL_PWD_SUCCESS, UPDATE_MYSQL_PWD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/daas/mysql/${name}/secret`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {}
    },
    callback
  }
}
export function updateMySqlClusterPwd(cluster, name, pwd, username, callback) {
  return (dispatch) => {
    return dispatch(updateMySqlCreatePwdRequest(cluster, name, pwd, username, callback))
  }
}

// 查看MYSQL集群密码
export const GET_MYSQL_PWD_REQUEST = 'GET_MYSQL_PWD_REQUEST'
export const GET_MYSQL_PWD_SUCCESS = 'GET_MYSQL_PWD_SUCCESS'
export const GET_MYSQL_PWD_FAILURE = 'GET_MYSQL_PWD_FAILURE'

function fetchMySqlCreatePwd(clusterID, clusterName, callback) {
  return {
    [FETCH_API]: {
      types: [GET_MYSQL_PWD_REQUEST, GET_MYSQL_PWD_SUCCESS, GET_MYSQL_PWD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/daas/mysql/${name}/secret`,
      schema: {}
    },
    callback
  }
}
export function getMySqlClusterPwd(cluster, name, callback) {
  return (dispatch) => {
    return dispatch(fetchMySqlCreatePwd(cluster, name, callback))
  }
}

// 修改mysql集群密码
export const UPDATE_MYSQL_CLUSTER_PWD_REQUEST = 'UPDATE_MYSQL_CLUSTER_PWD_REQUEST'
export const UPDATE_MYSQL_CLUSTER_PWD_SUCCESS = 'UPDATE_MYSQL_CLUSTER_PWD_SUCCESS'
export const UPDATE_MYSQL_CLUSTER_PWD_FAILURE = 'UPDATE_MYSQL_CLUSTER_PWD_FAILURE'

function updateMysqlPwdRequest (clusterId, name, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_MYSQL_CLUSTER_PWD_REQUEST, UPDATE_MYSQL_CLUSTER_PWD_SUCCESS, UPDATE_MYSQL_CLUSTER_PWD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/mysql/${name}/secret`,
      schema: {},
      options: {
        method: 'PUT',
        body
      },
    },
    callback
  }
}
export function updateMysqlPwd(cluster, name, body, callback) {
  return (dispatch) => {
    return dispatch(updateMysqlPwdRequest(cluster, name, body, callback))
  }
}

// 创建集群
export const CREATE_DB_CLUSTER_REQUEST = 'CREATE_DB_CLUSTER_REQUEST'
export const CREATE_DB_CLUSTER_SUCCESS = 'CREATE_DB_CLUSTER_SUCCESS'
export const CREATE_DB_CLUSTER_FAILURE = 'CREATE_DB_CLUSTER_FAILURE'

function createDatabaseClusterRequest (clusterId, template, type) {
  return {
    [FETCH_API]: {
      types: [CREATE_DB_CLUSTER_REQUEST, CREATE_DB_CLUSTER_SUCCESS, CREATE_DB_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}`,
      schema: {},
      options: {
        headers: {
          'Content-Type': 'text/plain'
        },
        method: 'POST',
        body: template
      },
    },
  }
}
export function createDatabaseCluster(cluster, template, type) {
  return (dispatch) => {
    return dispatch(createDatabaseClusterRequest(cluster, template, type))
  }
}

// 编辑集群
export const UPDATE_DB_CLUSTER_REQUEST = 'UPDATE_DB_CLUSTER_REQUEST'
export const UPDATE_DB_CLUSTER_SUCCESS = 'UPDATE_DB_CLUSTER_SUCCESS'
export const UPDATE_DB_CLUSTER_FAILURE = 'UPDATE_DB_CLUSTER_FAILURE'

function editDatabaseClusterRequest (clusterId, type, name, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_DB_CLUSTER_REQUEST, UPDATE_DB_CLUSTER_SUCCESS, UPDATE_DB_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${name}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      },
    },
    callback
  }
}
export function editDatabaseCluster(cluster, type, name, body, callback) {
  return (dispatch) => {
    return dispatch(editDatabaseClusterRequest(cluster, type, name, body, callback))
  }
}

// 删除手动备份
export function deleteRadisManualBackup(clusterId, type, template, callback) {
  return {
    [FETCH_API]: {
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/backup`,
      schema: {},
      options: {
        headers: {
          'Content-Type': 'text/plain'
        },
        method: 'POST',
        body: template
      },
      callback
    }
  }
}


// redis扩容
export const EXPEND_DB_CLUSTER_REQUEST = 'EXPEND_DB_CLUSTER_REQUEST'
export const EXPEND_DB_CLUSTER_SUCCESS = 'EXPEND_DB_CLUSTER_SUCCESS'
export const EXPEND_DB_CLUSTER_FAILURE = 'EXPEND_DB_CLUSTER_FAILURE'

function expendDatabaseClusterRequest (clusterId, type, name, body, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${name}/expands`
  return {
    [FETCH_API]: {
      types: [EXPEND_DB_CLUSTER_REQUEST, EXPEND_DB_CLUSTER_SUCCESS, EXPEND_DB_CLUSTER_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body
      },
    },
    callback
  }
}
export function expendDatabaseCluster(clusterId, type, name, body, callback) {
  return (dispatch) => {
    return dispatch(expendDatabaseClusterRequest(clusterId, type, name, body, callback))
  }
}

export const GET_DB_DETAIL_REQUEST = 'GET_DB_DETAIL_REQUEST'
export const GET_DB_DETAIL_SUCCESS = 'GET_DB_DETAIL_SUCCESS'
export const GET_DB_DETAIL_FAILURE = 'GET_DB_DETAIL_FAILURE'

function getDbDetailRequest (clusterId, name, body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_DB_DETAIL_REQUEST, GET_DB_DETAIL_SUCCESS, GET_DB_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/dbservices/${name}`,
      schema: {}
    },
    callback
  }
}
export function getDbDetail(clusterId, name, body, callback) {
  return (dispatch) => {
    return dispatch(getDbDetailRequest(clusterId, name, body, callback))
  }
}


// 扩容
export const CHECK_DB_NAME_REQUEST = 'GET_DB_DETAIL_REQUEST'
export const CHECK_DB_NAME_SUCCESS = 'CHECK_DB_NAME_SUCCESS'
export const CHECK_DB_NAME_FAILURE = 'CHECK_DB_NAME_FAILURE'

function checkDbNameRequest(clusterId, name, callback) {

  return {
    [FETCH_API]: {
      types: [CHECK_DB_NAME_REQUEST, CHECK_DB_NAME_SUCCESS, CHECK_DB_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${name}/check/exist`,
      schema: {}
    },
    callback
  }
}
export function checkDbName(clusterId, name, callback) {
  return (dispatch) => {
    return dispatch(checkDbNameRequest(clusterId, name, callback))
  }
}

// 重启集群
export const DB_CLUSTER_REBOOT_REQUEST = 'DB_CLUSTER_REBOOT_REQUEST'
export const DB_CLUSTER_REBOOT_SUCCESS = 'DB_CLUSTER_REBOOT_SUCCESS'
export const DB_CLUSTER_REBOOT_FAILURE = 'DB_CLUSTER_REBOOT_FAILURE'

function rebootRequest(clusterId, name, type, callback) {

  return {
    [FETCH_API]: {
      types: [DB_CLUSTER_REBOOT_REQUEST, DB_CLUSTER_REBOOT_SUCCESS, DB_CLUSTER_REBOOT_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${name}/reboot`,
      schema: {},
      options: {
        method: 'PUT'
      }
    },
    callback
  }
}
export function rebootCluster(clusterId, name, type, callback) {
  return (dispatch) => {
    return dispatch(rebootRequest(clusterId, name, type, callback))
  }
}

export const DB_EVENTS_REQUEST = 'DB_EVENTS_REQUEST'
export const DB_EVENTS_SUCCESS = 'DB_EVENTS_SUCCESS'
export const DB_EVENTS_FAILURE = 'DB_EVENTS_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDbEvents(cluster, type, name, callback) {
  return {
    [FETCH_API]: {
      types: [DB_EVENTS_REQUEST, DB_EVENTS_SUCCESS, DB_EVENTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/daas/${type}/${name}/events`,
      schema: {}
    },
    callback,
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadDbEvents(cluster, type, name, callback) {
  return dispatch => {
    return dispatch(fetchDbEvents(cluster, type, name, callback))
  }
}
