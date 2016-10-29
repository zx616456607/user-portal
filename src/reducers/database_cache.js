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
import { cloneDeep } from 'lodash'

function mysqlDatabaseAllList(state = {}, action) {
  const defaultState = {
    'MySql': {
      isFetching: false,
      database: 'MySql',
      databaseList: []
    }
  }
  switch (action.type) {
    case ActionTypes.MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        'MySql': { isFetching: true }
      })
    case ActionTypes.MYSQL_DATABASE_CACHE_ALL_LIST_SUCCESS:
      return merge({}, state, {
        'MySql': {
          isFetching: false,
          database: 'MySql',
          databaseList: action.response.result.databaseList || []
        }
      })
    case ActionTypes.MYSQL_DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        'MySql': { isFetching: false }
      })
    default:
      return state
  }
}

function mysqlDatabaseDetail(state = {}, action) {
  const database = 'test'
  const defaultState = {
    [database]: {
      isFetching: false,
      databaseInfo: null
    }
  }
  switch (action.type) {
    case ActionTypes.MYSQL_DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [database]: { isFetching: true }
      })
    case ActionTypes.MYSQL_DATABASE_CACHE_ALL_LIST_SUCCESS:
      return merge({}, state, {
        [database]: {
          isFetching: false,
          databaseInfo: action.response.result.databaseInfo || null
        }
      })
    case ActionTypes.MYSQL_DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [database]: { isFetching: false }
      })
    default:
      return state
  }
}


export function databaseCache(state = { databaseCache: {} }, action) {
  return {
    mysqlDatabaseAllList: mysqlDatabaseAllList(state.mysqlDatabaseAllList, action),
    createMySql: reducerFactory({
      REQUEST: ActionTypes.CREATE_MYSQL_DATABASE_CACHE_REQUEST,
      SUCCESS: ActionTypes.CREATE_MYSQL_DATABASE_CACHE_SUCCESS,
      FAILURE: ActionTypes.CREATE_MYSQL_DATABASE_CACHE_FAILURE
    }, state.createMySql, action),
    mysqlDatabaseDetail: mysqlDatabaseDetail(state.mysqlDatabaseDetail, action)
  }
}