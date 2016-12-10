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
import findIndex from 'lodash/findIndex'

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
  const clusterType = action.types || 'mysql'
  switch (action.type) {
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: true }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_SUCCESS:
      return Object.assign({}, state, {
        [clusterType]: {
          isFetching: false,
          database: clusterType,
          bak: action.response.result.databaseList || [],
          databaseList: action.response.result.databaseList || []
        }
      })
    case ActionTypes.GET_DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [clusterType]: { isFetching: false }
      })
  // delete database cluster 
    case ActionTypes.DELETE_DATABASE_CACHE_SUCCESS: {
      const delState = cloneDeep(state)
      const databaseList = delState[clusterType].databaseList
      let findex = findIndex(databaseList, list=> {
        return action.dbName === list.serivceName
      })
      databaseList.splice(findex, 1)
      delState[clusterType].bak.splice(findex, 1)
      return delState
    }
  // search database cluster
    case ActionTypes.SEARCH_DATABASE_CLUSTER_TYPES: {
      const searchState = cloneDeep(state)
      if (action.name == '') {
        searchState[clusterType].databaseList = searchState[clusterType].bak
        return searchState
      }

      const list = searchState[clusterType].bak.filter(item => {
        const search = new RegExp(action.name)
        if (search.test(item.name)) {
          return true
        }
        return false
      })
      searchState[clusterType].databaseList = list

      return searchState
    }
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
    databaseClusterDetail: databaseClusterDetail(state.databaseClusterDetail, action)
  }
}