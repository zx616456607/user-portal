/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux reducers
 * 
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import * as ActionTypes from '../actions'
import merge from 'lodash/merge'
import union from 'lodash/union'
import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'

// Updates an entity cache in response to any action with response.entities.
function entities(state = { isFetching:false, users: {}, rcs: {} }, action) {
  if (action.response && action.response.entities) {
    let isFetching = false
    if (action.type.indexOf('_REQUEST') > -1) {
      isFetching = true
    }
    return merge({}, state, action.response.entities, {isFetching})
  }

  return state
}

// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}

function containerList(state = {}, action) {
  const master = action.master
  const defaultState = {
    [master]: {
      isFetching: false,
      master,
      login: null,
      number: 0,
      rcList: []
    }
  }
  switch (action.type) {
    case ActionTypes.RC_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [master]: {isFetching: true}
      })
    case ActionTypes.RC_LIST_SUCCESS:
      return merge({}, state, {
        [master]: {
          isFetching: false,
          master: action.response.result.master,
          login: action.response.result.login,
          number: action.response.result.number,
          rcList: union(state.rcList, action.response.result.rcList)
        }
      })
    case ActionTypes.RC_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [master]: {isFetching: false}
      })
    default:
      return state
  }
}

function transhRcs(state = {}, action) {
  const master = action.master
  const defaultState = {
    [master]: {
      isFetching: false,
      master,
      login: null,
      number: 0,
      rcList: []
    }
  }
  switch (action.type) {
    case ActionTypes.TRANSH_RC_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [master]: {isFetching: true}
      })
    case ActionTypes.TRANSH_RC_LIST_SUCCESS:
      return merge({}, state, {
        [master]: {
          isFetching: false,
          master: action.response.result.master,
          login: action.response.result.login,
          number: action.response.result.number,
          rcList: union(state.rcList, action.response.result.rcList)
        }
      })
    case ActionTypes.TRANSH_RC_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [master]: {isFetching: false}
      })
    default:
      return state
  }
}

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


function storage(state = {}, action) {
  return {
    storageList: storageList(state.storageList, action),
    deleteStorage: deleteStorage(state.deleteStorage, action)
  }
}

const rootReducer = combineReducers({
  entities,
  errorMessage,
  containerList,
  transhRcs,
  storage,
  routing
})


export default rootReducer
