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
import * as servicesReducers from './services'
import * as databaseCacheReducers from './database_cache'
import * as manageMonitorReducers from './manage_monitor'
import configReducers from './configs'
import storage from './storage'
import metrics from './metrics'
import user from './user'
import openApi from './open_api'
import team from './team'
import cicd_flow from './cicd_flow'
import cluster from './cluster'
import overviewTeam from './overview_team'
import overviewCluster from './overview_cluster'
import overviewSpace from './overview_space'

// Updates an entity cache in response to any action with response.entities.
function entities(state = {
  // isFetching: false,
  loginUser: {
    isFetching: false,
    info: {}
  },
  current: {
    team: {},
    space: {},
    cluster: {},
  },
}, action) {
  /*if (action.response && action.response.entities) {
    let isFetching = false
    if (action.type.indexOf('_REQUEST') > -1) {
      isFetching = true
    }
    return merge({}, state, action.response.entities, { isFetching })
  }*/
  return {
    current: current(state.current, action),
    loginUser: loginUser(state.loginUser, action),
  }
}

function current(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CURRENT:
      let current = action.current
      if (!current.team) {
        current.team = state.team
      }
      if (!current.space) {
        current.space = state.space
      }
      if (!current.cluster) {
        current.cluster = state.cluster
      }
      return Object.assign({}, state, current)
    default:
      return state
  }
}

function loginUser(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_REQUEST:
    case ActionTypes.LOGIN_USER_DETAIL_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        info: action.response.result.user
      })
    case ActionTypes.LOGIN_USER_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        info: action.response.result.data
      })
    case ActionTypes.LOGIN_FAILURE:
    case ActionTypes.LOGIN_USER_DETAIL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  }
  // Avoid error is repeatedly handled
  if (error && !error.handledByCallback) {
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
    if (!callback.failed) return state
    // Mark error is already handled
    action.error.handledByCallback = true
    if (callback.failed.isAsync) {
      setTimeout(callback.failed.func.bind(this, action.error))
      return state
    }
    callback.failed.func(action.error)
    return state
  }
  return state
}



const rootReducer = combineReducers({
  entities,
  actionCallback, // actionCallback must be in front of errorMessage
  errorMessage,
  storage,
  ...appManageReducers,
  ...appCenterReducers,
  ...servicesReducers,
  ...databaseCacheReducers,
  ...manageMonitorReducers,
  configReducers,
  metrics,
  user,
  routing,
  openApi,
  team,
  cicd_flow,
  cluster,
  overviewTeam,
  overviewCluster,
  overviewSpace,
})

export default rootReducer
