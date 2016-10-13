/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux reducers for app manage
 * 
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/app_manage'
import merge from 'lodash/merge'
import union from 'lodash/union'
import reducerFactory from './factory'

function appItems(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false,
      cluster,
      appList: []
    }
  }
  switch (action.type) {
    case ActionTypes.APP_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {isFetching: true}
      })
    case ActionTypes.APP_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          appList: action.response.result.data || []
        }
      })
    case ActionTypes.APP_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {isFetching: false}
      })
    default:
      return state
  }
}

function appDetail(state = {}, action) {
  const cluster = action.cluster
  const appName = action.appName
  const defaultState = {
    isFetching: false,
    cluster,
    appName,
    app: {}
  }
  switch (action.type) {
    case ActionTypes.APP_DETAIL_REQUEST:
      return merge({}, defaultState, state, {isFetching: true})
    case ActionTypes.APP_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        app: action.response.result.data || {}
      })
    case ActionTypes.APP_DETAIL_FAILURE:
      return merge({}, defaultState, state, {isFetching: true})
    default:
      return state
  }
}

export function apps(state = { appItmes: {} }, action) {
  return {
    appItems: appItems(state.appItems, action),
    appDetail: appDetail(state.appDetail, action),
    createApp: reducerFactory({
      REQUEST: ActionTypes.APP_CREATE_REQUEST,
      SUCCESS: ActionTypes.APP_CREATE_SUCCESS,
      FAILURE: ActionTypes.APP_CREATE_FAILURE
    }, state.deleteApps, action),
    deleteApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_DELETE_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_DELETE_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_DELETE_FAILURE
    }, state.deleteApps, action),
    stopApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_STOP_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_STOP_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_STOP_FAILURE
    }, state.stopApps, action),
    restartApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_RESTART_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_RESTART_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_RESTART_FAILURE
    }, state.restartApps, action),
    startApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_START_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_START_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_START_FAILURE
    }, state.startApps, action)
  }
}

// ~~~ services

function serviceItmes(state = {}, action) {
  const cluster = action.cluster
  const appName = action.appName
  const defaultState = {
    [cluster]: {
      [appName]: {
        isFetching: false,
        cluster,
        appName,
        serviceList: []
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]:  {
          [appName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]:  {
          [appName]: {
            isFetching: false,
            cluster: action.response.result.cluster,
            appName: action.response.result.appName,
            serviceList: union(state.services, action.response.result.data)
          }
        }
      })
    case ActionTypes.SERVICE_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]:  {
          [appName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}

export function services(state = { appItmes: {} }, action) {
  return {
    serviceItmes: serviceItmes(state.serviceItmes, action)
  }
}

// ~~~ containers

export function containers(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false,
      cluster,
      containerList: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]:  {
          isFetching: true
        }
      })
    case ActionTypes.CONTAINER_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]:  {
          isFetching: false,
          cluster: action.response.result.cluster,
          appName: action.response.result.appName,
          containerList: union(state.containers, action.response.result.data)
        }
      })
    case ActionTypes.CONTAINER_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]:  {
          isFetching: false
        }
      })
    default:
      return state
  }
}