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
  const master = action.master
  const defaultState = {
    [master]: {
      isFetching: false,
      master,
      appList: []
    }
  }
  switch (action.type) {
    case ActionTypes.APP_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [master]: {isFetching: true}
      })
    case ActionTypes.APP_LIST_SUCCESS:
      return merge({}, state, {
        [master]: {
          isFetching: false,
          master: action.response.result.master,
          appList: union(state.apps, action.response.result.data)
        }
      })
    case ActionTypes.APP_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [master]: {isFetching: false}
      })
    default:
      return state
  }
}

export function containers(state = {}, action) {
  const master = action.master
  const appName = action.appName
  const defaultState = {
    [master]: {
      [appName]: {
        isFetching: false,
        master,
        appName,
        containerList: []
      }
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [master]:  {
          [appName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.CONTAINER_LIST_SUCCESS:
      return merge({}, state, {
        [master]:  {
          [appName]: {
            isFetching: false,
            master: action.response.result.master,
            appName: action.response.result.appName,
            containerList: union(state.containers, action.response.result.data)
          }
        }
      })
    case ActionTypes.CONTAINER_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [master]:  {
          [appName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}