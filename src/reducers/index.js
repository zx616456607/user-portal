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
import storageReducers from './storage'

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



const rootReducer = combineReducers({
  entities,
  errorMessage,
  storageReducers,
  ...appManageReducers,
  routing
})

export default rootReducer
