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

export function apps(state = {}, action) {
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
      return merge({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          appList: union(state.apps, action.response.result.data)
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

export function services(state = {}, action) {
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
      return merge({}, state, {
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
    
    case ActionTypes.SERVICE_CREATE_REQUEST:
      return union({}, state, {
        [cluster]:  {
          [appName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_CREATE_SUCCESS:
      return union({}, state, {
        [cluster]:  {
          [appName]: {
            isFetching: false
          }
        }
      })
    case ActionTypes.SERVICE_CREATE_FAILURE:
      return union({}, state, {
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
      return merge({}, state, {
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