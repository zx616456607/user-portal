/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for database cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import * as ActionTypes from '../actions/database_cache'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'

function databaseAllNames(state = {}, action) {
  const defaultState = {
    'DbClusters': {
      isFetching: false,
      databaseNames: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_ALL_NAME_REQUEST:
      return merge({}, defaultState, state, {
        'DbClusters': { isFetching: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_NAME_SUCCESS:
      return Object.assign({}, state, {
        'DbClusters': {
          isFetching: false,
          databaseNames: action.response.result.databaseNames || []
        }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_NAME_FAILURE:
      return merge({}, defaultState, state, {
        'DbClusters': { isFetching: false }
      })
    default:
      return state
  }
}

function databaseAllList(state = {}, action) {
  const defaultState = {
    'mysql': {
      isFetching: false,
      database: 'mysql',
      databaseList: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [action.types]: { isFetching: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_SUCCESS:
      return Object.assign({}, state, {
        [action.types]: {
          isFetching: false,
          database: action.types,
          databaseList: action.response.result.databaseList || []
        }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [action.types]: { isFetching: false }
      })
    default:
      return state
  }
}

function redisDatabaseAllList(state = {}, action) {
  const defaultState = {
    'Redis': {
      isFetching: false,
      database: 'Redis',
      databaseList: []
    }
  }
  switch (action.type) {
    case ActionTypes.REDIS_DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        'Redis': { isFetching: true }
      })
    case ActionTypes.REDIS_DATABASE_CACHE_ALL_LIST_SUCCESS:
      return Object.assign({}, state, {
        'Redis': {
          isFetching: false,
          database: 'Redis',
          databaseList: action.response.result.databaseList || []
        }
      })
    case ActionTypes.REDIS_DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        'Redis': { isFetching: false }
      })
    default:
      return state
  }
}

function databaseClusterDetail(state = {}, action) {
  const defaultState = {
    databaseInfo: {
      isFetching: false,
      databaseInfo: null
    }
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_DETAIL_INFO_REQUEST:
      return merge({}, defaultState, state, {
        databaseInfo: { isFetching: true }
      })
    case ActionTypes.GET_DATABASE_DETAIL_INFO_SUCCESS:
      return Object.assign({}, state, {
        databaseInfo: {
          isFetching: false,
          databaseInfo: action.response.result.database || null
        }
      })
    case ActionTypes.GET_DATABASE_DETAIL_INFO_FAILURE:
      return merge({}, defaultState, state, {
        databaseInfo: { isFetching: false }
      })
    default:
      return state
  }
}

function loadDBStorageAllList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    storageList: []
  }
  switch (action.type) {
    case ActionTypes.GET_DATABASE_STORAGE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_DATABASE_STORAGE_ALL_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        storageList: action.response.result.result.data.items || []
      })
    case ActionTypes.GET_DATABASE_STORAGE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}


export function databaseCache(state = { databaseCache: {} }, action) {
  return {
    databaseAllNames: databaseAllNames(state.databaseAllNames, action),
    databaseAllList: databaseAllList(state.databaseAllList, action),
    redisDatabaseAllList: redisDatabaseAllList(state.redisDatabaseAllList, action),
    loadDBStorageAllList: loadDBStorageAllList(state.loadDBStorageAllList, action),
    createMySql: reducerFactory({
      REQUEST: ActionTypes.CREATE_MYSQL_DATABASE_CACHE_REQUEST,
      SUCCESS: ActionTypes.CREATE_MYSQL_DATABASE_CACHE_SUCCESS,
      FAILURE: ActionTypes.CREATE_MYSQL_DATABASE_CACHE_FAILURE
    }, state.createMySql, action),
    createRedis: reducerFactory({
      REQUEST: ActionTypes.CREATE_REDIS_DATABASE_CACHE_REQUEST,
      SUCCESS: ActionTypes.CREATE_REDIS_DATABASE_CACHE_SUCCESS,
      FAILURE: ActionTypes.CREATE_REDIS_DATABASE_CACHE_FAILURE
    }, state.createRedis, action),
    deleteDatabase: reducerFactory({
      REQUEST: ActionTypes.DELETE_DATABASE_CACHE_REQUEST,
      SUCCESS: ActionTypes.DELETE_DATABASE_CACHE_SUCCESS,
      FAILURE: ActionTypes.DELETE_DATABASE_CACHE_FAILURE
    }, state.deleteDatabase, action),
    databaseClusterDetail: databaseClusterDetail(state.databaseClusterDetail, action)
  }
}