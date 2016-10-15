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
import * as appManageReducers from './app_manage'
import * as appCenterReducers from './app_center'
import configReducers from './configs'
import storage from './storage'

// Updates an entity cache in response to any action with response.entities.
function entities(state = { isFetching: false, users: {}, rcs: {} }, action) {
  if (action.response && action.response.entities) {
    let isFetching = false
    if (action.type.indexOf('_REQUEST') > -1) {
      isFetching = true
    }
    return merge({}, state, action.response.entities, { isFetching })
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

function actionCallback(state = null, action) {
  if (action.type.indexOf('_REQUEST') >= 0) {
    return state
  }
  if (!action.callback) return state
  let callback = action.callback
  if (action.type.indexOf('_SUCCESS') >= 0) {
    if (!callback.success) return state
    if (callback.success.isAsync) {
      setTimeout(callback.success.func.bind(this, action.response.result))
      return state
    }
    callback.success.func(action.response.result)
    return state
  }
  if (action.type.indexOf('_FAILURE') >= 0) {
    if (!callback.failure) return state
    if (callback.failure.isAsync) {
      setTimeout(callback.failure.func.bind(this, action.response.result))
      return state
    }
    callback.failure.func(action.response.result)
    return state
  }
  return state
}

const rootReducer = combineReducers({
  entities,
  errorMessage,
  actionCallback,
  storage,
  ...appManageReducers,
  ...appCenterReducers,
  configReducers,
  routing
})

export default rootReducer
