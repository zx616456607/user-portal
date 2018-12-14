/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Redux reducers for middleware center
 *
 * @author zhangxuan
 * @date 2018-09-10
 */

import * as ActionTypes from '../actions/middlewareCenter'

function appConfigs(state = {}, action) {
  switch (action.type) {
    case ActionTypes.SET_BPM_FORM_FIELDS:
      return Object.assign({}, state, {
        ...action.fields,
      })
    case ActionTypes.CLEAR_BPM_FORM_FIELDS:
      return {}
    default:
      return state
  }
}

function AppClusterList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.APP_CLUSTER_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.APP_CLUSTER_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.result && action.response.result.result.data,
      });
    case ActionTypes.APP_CLUSTER_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        data: { items: [], total: 0 },
      });
    default:
      return state;
  }
}

function AppClusterServerList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.APP_CLUSTER_SERVER_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.APP_CLUSTER_SERVER_LIST_SUCCESS: {
      const newState = Object.assign({}, state, {
        isFetching: false,
        data: action.response.result,
      });
      return newState
    }
    case ActionTypes.APP_CLUSTER_SERVER_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

function appClassifies(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_MIDDLEWARE_APP_CLASSIFIES_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.GET_MIDDLEWARE_APP_CLASSIFIES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.GET_MIDDLEWARE_APP_CLASSIFIES_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}


function apps(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_MIDDLEWARE_APPS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.GET_MIDDLEWARE_APPS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.GET_MIDDLEWARE_APPS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function currentApp(state = {}, action) {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_APP:
      return {
        app: action.app,
      }
    default:
      return state
  }
}

export default function middlewareCenter(state = {}, action) {
  return {
    appConfigs: appConfigs(state.appConfigs, action),
    appClassifies: appClassifies(state.appClassifies, action),
    apps: apps(state.apps, action),
    currentApp: currentApp(state.currentApp, action),
    AppClusterList: AppClusterList(state.AppClusterList, action),
    AppClusterServerList: AppClusterServerList(state.AppClusterServerList, action),
  }
}
