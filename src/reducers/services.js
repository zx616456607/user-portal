/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/services'
import merge from 'lodash/merge'
import union from 'lodash/union'
import reducerFactory from './factory'

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

function serviceDetail(state = {}, action) {
  const cluster = action.cluster
  const serviceName = action.serviceName
  const defaultState = {
    [cluster]: {
      [serviceName]: {
        isFetching: false,
        cluster,
        serviceName,
        service: {}
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false,
            cluster: action.response.result.cluster,
            serviceName: action.response.result.serviceName,
            service: action.response.result.data
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}

function serviceContainers(state = {}, action) {
  const cluster = action.cluster
  const serviceName = action.serviceName
  const defaultState = {
    [cluster]: {
      [serviceName]: {
        isFetching: false,
        cluster,
        serviceName,
        containerList: []
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_CONTAINERS_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_CONTAINERS_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false,
            cluster: action.response.result.cluster,
            serviceName: action.response.result.serviceName,
            containerList: union(state.services, action.response.result.data)
          }
        }
      })
    case ActionTypes.SERVICE_CONTAINERS_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}

function serviceDetailEvents(state = {}, action) {
  const cluster = action.cluster
  const serviceName = action.serviceName
  const defaultState = {
    [cluster]: {
      [serviceName]: {
        isFetching: false,
        cluster,
        serviceName,
        eventList: []
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_DETAIL_EVENTS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_EVENTS_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false,
            eventList: action.response.result.data.events
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_EVENTS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
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
    serviceItmes: serviceItmes(state.serviceItmes, action),
    serviceContainers: serviceContainers(state.serviceContainers, action),
    serviceDetail: serviceDetail(state.serviceDetail, action),
    serviceDetailEvents: serviceDetailEvents(state.serviceDetailEvents, action),
    deleteServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_DELETE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_DELETE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_DELETE_FAILURE
    }, state.deleteServices, action),
    stopServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_STOP_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_STOP_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_STOP_FAILURE
    }, state.stopServices, action),
    startServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_START_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_START_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_START_FAILURE
    }, state.startServices, action),
    restartServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_RESTART_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_RESTART_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_RESTART_FAILURE
    }, state.restartServices, action),
    quickRestartServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_QUICK_RESTART_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_QUICK_RESTART_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_QUICK_RESTART_FAILURE
    }, state.quickRestartServices, action),
    rollingUpdateServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_ROLLING_UPDATE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_ROLLING_UPDATE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_ROLLING_UPDATE_FAILURE
    }, state.rollingUpdateServices, action),
  }
}