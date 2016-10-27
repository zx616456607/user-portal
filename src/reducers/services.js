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
import cloneDeep from 'lodash/cloneDeep'

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
            serviceList: union(state.services, action.response.result.data),
            size: action.response.result.count,
            total: action.response.result.total,
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

function serviceLogs(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_LOGS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.SERVICE_LOGS_SUCCESS:
      const uState = cloneDeep(state)
      if (!uState[cluster].logs) uState[cluster].logs = {}
      if (!action.response.result.data) return uState
      uState[cluster].logs.data = union(action.response.result.data, uState[cluster].logs.data)
      if (uState[cluster].logs.data.length % 50 !== 0) uState[cluster].logs.data.unshift({ log: '无更多日志\n' })
      return uState
    case ActionTypes.SERVICE_LOGS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    case ActionTypes.SERVICE_LOGS_CLEAR:
      return merge({}, defaultState, {
        [cluster]: {
          isFetching: false
        }
      })
    default:
      return merge({}, state)
  }
}

function k8sService(state = {}, action) {
  switch (action.type) {
    case ActionTypes.SERVICE_GET_K8S_SERVICE_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.SERVICE_GET_K8S_SERVICE_SUCCESS:
      return merge({}, { isFetching: false }, action.response.result)
    case ActionTypes.SERVICE_GET_K8S_SERVICE_FAILURE:
      return merge({}, state, { isFetching: false })
    case ActionTypes.SERVICE_CLEAR_K8S_SERVICE:
      return merge({}, { isFetching: false })
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
    k8sService: k8sService(state.k8sService, action),
    serviceLogs: serviceLogs(state.serviceLogs, action),
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
    serviceAvailability: reducerFactory({
      REQUEST: ActionTypes.SERVICE_AVAILABILITY_REQUEST,
      SUCCESS: ActionTypes.SERVICE_AVAILABILITY_SUCCESS,
      FAILURE: ActionTypes.SERVICE_AVAILABILITY_FAILURE
    }, state.serviceAvailability, action),
    autoScale: reducerFactory({
      REQUEST: ActionTypes.SERVICE_GET_AUTO_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_GET_AUTO_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_GET_AUTO_SCALE_FAILURE
    }, state.autoScale, action, { overwrite: true }),
    deleteAutoScale: reducerFactory({
      REQUEST: ActionTypes.SERVICE_DELETE_AUTO_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_DELETE_AUTO_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_DELETE_AUTO_SCALE_FAILURE
    }, state.deleteAutoScale, action, { overwrite: true }),
    updateAutoScale: reducerFactory({
      REQUEST: ActionTypes.SERVICE_UPDATE_AUTO_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_UPDATE_AUTO_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_UPDATE_AUTO_SCALE_FAILURE
    }, state.updateAutoScale, action, { overwrite: true }),
    manualScaleService: reducerFactory({
      REQUEST: ActionTypes.SERVICE_MANUAL_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_MANUAL_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_MANUAL_SCALE_FAILURE
    }, state.manualScaleService, action, { overwrite: true }),
  }
}