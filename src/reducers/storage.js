/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux reducers for app manage
 * 
 * v0.1 - 2016-09-21
 * @author YangYuBiao
 */
import * as ActionTypes from  '../actions/storage'


function storageList(state = {}, action) {
  const pool = action.pool
  const defaultState = {
    [pool]: {
      isFetching: false,
      pool,
      login: null,
      number: 0,
      storageList: []
    }
  }
  switch (action.type) {
    case ActionTypes.STORAGE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [pool]: { isFetching: true }
      })
    case ActionTypes.STORAGE_LIST_SUCCESS:
      return Object.assign({}, defaultState, state, {
        [pool]: {
          isFetching: false,
          storageList: action.response.result.storageList,
          number: action.response.result.number,
          login: action.response.result.login,
          pool: action.response.result.pool
        }
      })
    case ActionTypes.STORAGE_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [pool]: { isFetching: false }
      })
    default: 
      return state
  }
}

function deleteStorage(state = {}, action) {
  switch(action.type) {
    case ActionTypes.STORAGE_DELETE_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.STORAGE_DELETE_SUCCESS: 
      if (action.callback) {
        setTimeout(function() {
          action.callback()
        },0)
      }
      return merge({}, state, {
        isFetching: false
      })
    case ActionTypes.STORAGE_DELETE_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default: 
      return state
  }
}


export default function storageReducers(state = {}, action) {
  return {
    storageList: storageList(state.storageList, action),
    deleteStorage: deleteStorage(state.deleteStorage, action)
  }
}