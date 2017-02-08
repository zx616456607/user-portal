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
import entities from './entities'
import * as appManageReducers from './app_manage'
import * as appCenterReducers from './app_center'
import * as servicesReducers from './services'
import * as databaseCacheReducers from './database_cache'
import * as manageMonitorReducers from './manage_monitor'
import * as integrationReducers from './integration'
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
import consumption from './consumption'
import userPreference from './user_preference'
import user3rdAccount from './user_3rd_account'
import { LOGIN_EXPIRED_MESSAGE, PAYMENT_REQUIRED_CODE, UPGRADE_EDITION_REQUIRED_CODE, } from '../constants'


// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  }

  // Avoid error is repeatedly handled
  if (error && !error.handledByCallback) {
    return {
      type,
      error,
    }
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
    // Mark error is already handled(except login expired)
    if (action.error.statusCode !== PAYMENT_REQUIRED_CODE // 余额不足
       && action.error.statusCode !== UPGRADE_EDITION_REQUIRED_CODE // 升级版本
       && action.error.message !== LOGIN_EXPIRED_MESSAGE) {
      action.error.handledByCallback = true
    }
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
  ...integrationReducers,
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
  consumption,
  userPreference,
  user3rdAccount,
})

export default rootReducer
