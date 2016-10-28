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

function databaseAllList(state = {}, action) {
  const database = action.database
  const defaultState = {
    [database]: {
      isFetching: false,
      database,
      databaseList: []
    }
  }
  switch (action.type) {
    case ActionTypes.DATABASE_CACHE_ALL_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [database]: { isFetching: true }
      })
    case ActionTypes.DATABASE_CACHE_ALL_LIST_SUCCESS:
      console.log(action.response.result)
      return merge({}, state, {
        [database]: {
          isFetching: false,
        }
      })
    case ActionTypes.DATABASE_CACHE_ALL_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [database]: { isFetching: false }
      })
    default:
      return state
  }
}

export function images(state = { publicImages: {} }, action) {
  return {
    privateImages: privateImages(state.privateImages, action),
  }
}