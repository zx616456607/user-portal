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

export const CREATE_MYSQL_DATABASE_CACHE_REQUEST = 'CREATE_MYSQL_DATABASE_CACHE_REQUEST'
export const CREATE_MYSQL_DATABASE_CACHE_SUCCESS = 'CREATE_MYSQL_DATABASE_CACHE_SUCCESS'
export const CREATE_MYSQL_DATABASE_CACHE_FAILURE = 'CREATE_MYSQL_DATABASE_CACHE_FAILURE'

function createMysqlDbCluster(newDb, callback) {
  return {
    cluster: newDb.cluster,
    [FETCH_API]: {
      types: [CREATE_MYSQL_DATABASE_CACHE_REQUEST, CREATE_MYSQL_DATABASE_CACHE_SUCCESS, CREATE_MYSQL_DATABASE_CACHE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/createMysqlCluster`,
      options: {
        method: 'POST',
        body: {
          name: newDb.dbName,
          servicesNum: newDb.servicesNum,
          password: newDb.password,
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