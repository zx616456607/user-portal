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
import cloneDeep from 'lodash/cloneDeep'
import reducerFactory from './factory'
import { DEFAULT_PAGE_SIZE } from '../constants'

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
        [cluster]: { isFetching: true }
      })
    case ActionTypes.APP_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          appList: action.response.result.data || [],
          size: action.response.result.count,
          total: action.response.result.total,
        }
      })
    case ActionTypes.APP_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: { isFetching: false }
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
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.APP_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        app: action.response.result.data || {}
      })
    case ActionTypes.APP_DETAIL_FAILURE:
      return merge({}, defaultState, state, { isFetching: true })
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
    }, state.startApps, action),
    appOrchfile: reducerFactory({
      REQUEST: ActionTypes.APP_ORCH_FILE_REQUEST,
      SUCCESS: ActionTypes.APP_ORCH_FILE_SUCCESS,
      FAILURE: ActionTypes.APP_ORCH_FILE_FAILURE
    }, state.appOrchfile, action),
    appLogs: reducerFactory({
      REQUEST: ActionTypes.APP_OPERATION_LOG_REQUEST,
      SUCCESS: ActionTypes.APP_OPERATION_LOG_SUCCESS,
      FAILURE: ActionTypes.APP_OPERATION_LOG_FAILURE
    }, state.appLogs, action),
    checkAppName: reducerFactory({
      REQUEST: ActionTypes.APP_CHECK_NAME_REQUEST,
      SUCCESS: ActionTypes.APP_CHECK_NAME_SUCCESS,
      FAILURE: ActionTypes.APP_CHECK_NAME_FAILURE
    }, state.checkAppName, action),
    checkServiceName: reducerFactory({
      REQUEST: ActionTypes.SERVICE_CHECK_NAME_REQUEST,
      SUCCESS: ActionTypes.SERVICE_CHECK_NAME_SUCCESS,
      FAILURE: ActionTypes.SERVICE_CHECK_NAME_FAILURE
    }, state.checkServiceName, action),
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
        [cluster]: {
          [appName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
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
        [cluster]: {
          [appName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}

// ~~~ containers

function containerItems(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false,
      cluster,
      size: DEFAULT_PAGE_SIZE,
      total: 0,
      containerList: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.CONTAINER_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          appName: action.response.result.appName,
          size: action.response.result.count,
          total: action.response.result.total,
          containerList: action.response.result.data,
        }
      })
    case ActionTypes.CONTAINER_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    default:
      return state
  }
}

function containerDetail(state = {}, action) {
  const cluster = action.cluster
  const containerName = action.containerName
  const defaultState = {
    [cluster]: {
      isFetching: false,
      containerName,
      containerList: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.CONTAINER_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          containerName: action.response.result.containerName,
          container: action.response.result.data
        }
      })
    case ActionTypes.CONTAINER_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    default:
      return state
  }
}

function containerDetailEvents(state = {}, action) {
  const cluster = action.cluster
  const containerName = action.containerName
  const defaultState = {
    [cluster]: {
      isFetching: false,
      containerName,
      eventList: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_DETAIL_EVENTS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.CONTAINER_DETAIL_EVENTS_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          eventList: action.response.result.data.events
        }
      })
    case ActionTypes.CONTAINER_DETAIL_EVENTS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    default:
      return state
  }
}

function containerLogs(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_LOGS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.CONTAINER_LOGS_SUCCESS:
      const uState = cloneDeep(state)
      if (!uState[cluster].logs) uState[cluster].logs = {}
      if (!action.response.result.data) return uState
      uState[cluster].logs.data = union(action.response.result.data, uState[cluster].logs.data)
      if (uState[cluster].logs.data.length % 50 !== 0) uState[cluster].logs.data.unshift({ log: '无更多日志\n' })
      return uState
    case ActionTypes.CONTAINER_LOGS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    case ActionTypes.CONTAINER_LOGS_CLEAR:
      console.log(action.type)
      var dd = merge({}, defaultState, {
        [cluster]: {
          isFetching: false
        }
      })
      return dd
    default:
      return merge({}, state)
  }
}


export function containers(state = {}, action) {
  return {
    containerItems: containerItems(state.containerItems, action),
    containerDetail: containerDetail(state.containerDetail, action),
    containerDetailEvents: containerDetailEvents(state.containerDetailEvents, action),
    containerLogs: containerLogs(state.containerLogs, action)
  }
}