/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for manage monitor
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import * as ActionTypes from '../actions/manage_monitor'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'

function operationAuditLog(state = {}, action) {
  const defaultState = {
    logs: {
      isFetching: false,
      logs: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_MANAGE_MONITOR_LOG_REQUEST:
      return Object.assign({}, defaultState, state, {
        logs: { isFetching: true }
      })
    case ActionTypes.GET_MANAGE_MONITOR_LOG_SUCCESS:
      return Object.assign({}, state, {
        logs: {
          isFetching: false,
          logs: action.response.result.logs || []
        }
      })
    case ActionTypes.GET_MANAGE_MONITOR_LOG_FAILURE:
      return Object.assign({}, defaultState, state, {
        logs: { isFetching: false }
      })
    default:
      return state
  }
}

function getQueryLog(state = {}, action) {
  const defaultState = {
    logs: {
      isFetching: false,
      logs: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_QUERY_LOG_REQUEST:
      return Object.assign({}, defaultState, state, {
        logs: { isFetching: true }
      })
    case ActionTypes.GET_QUERY_LOG_SUCCESS:
      return Object.assign({}, state, {
        logs: {
          isFetching: false,
          logs: action.response.result.logs || []
        }
      })
    case ActionTypes.GET_QUERY_LOG_FAILURE:
      return Object.assign({}, defaultState, state, {
        logs: { isFetching: false }
      })
    default:
      return state
  }
}

function getClusterOfQueryLog(state = {}, action) {
  const defaultState = {
    isFetching: false,
    clusterList: []
  }
  switch (action.type) {
    case ActionTypes.GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        clusterList: action.response.result.clusterList || []
      })
    case ActionTypes.GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getServiceOfQueryLog(state = {}, action) {
  const defaultState = {
    isFetching: false,
    clusterList: []
  }
  switch (action.type) {
    case ActionTypes.GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        clusterList: action.response.result.data || []
      })
    case ActionTypes.GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export function manageMonitor(state = { manageMonitor: {} }, action) {
  return {
    operationAuditLog: operationAuditLog(state.operationAuditLog, action),
    getQueryLog: getQueryLog(state.getQueryLog, action),
    getClusterOfQueryLog: getClusterOfQueryLog(state.getClusterOfQueryLog, action),
    getServiceOfQueryLog: getServiceOfQueryLog(state.getServiceOfQueryLog, action),
  }
}