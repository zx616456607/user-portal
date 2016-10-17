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

export function services(state = { appItmes: {} }, action) {
  return {
    serviceItmes: serviceItmes(state.serviceItmes, action),
    serviceContainers: serviceContainers(state.serviceContainers, action),
    serviceDetail: serviceDetail(state.serviceDetail, action),
  }
}