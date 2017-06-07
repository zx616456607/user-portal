/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Reducer of harbor registry
 *
 * v0.1 - 2017-05-05
 * @author Zhangpc
 */
import * as ActionTypes from '../actions/harbor'
import merge from 'lodash/merge'

function projects(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false,
      list: []
    }
  }
  switch (action.type) {
    case ActionTypes.HARBOR_PROJECT_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: {
          isFetching: true
        }
      })
    case ActionTypes.HARBOR_PROJECT_LIST_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          server: action.response.result.server,
          list: action.response.result.data,
          total: action.response.result.total,
        }
      })
    case ActionTypes.HARBOR_PROJECT_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

function projectLogs(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false, logs: []
    }
  }
  switch (action.type) {
  case ActionTypes.HARBOR_PROJECT_LOGS_REQUEST:
    return merge({}, defaultState, state, {
      [registry]: {
        isFetching: true
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_SUCCESS:
    return Object.assign({}, state, {
      [registry]: {
        isFetching: false,
        server: action.response.result.server,
        list: action.response.result.data,
        total: action.response.result.total
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_FAILURE:
    return merge({}, defaultState, state, {
      [registry]: { isFetching: false }
    })
  default:
    return state
  }
}

function repos(state = {}, action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
    list: []
  }
  switch (action.type) {
    case ActionTypes.HARBOR_GET_PROJECT_REPOS_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.HARBOR_GET_PROJECT_REPOS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        server: action.response.result.server,
        list: action.response.result.data,
        total: action.response.result.total,
      })
    case ActionTypes.HARBOR_GET_PROJECT_REPOS_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function detail(state = {}, action) {
  const { registry } = action
  const defaultState = {
    isFetching: false,
    data: {}
  }
  switch (action.type) {
    case ActionTypes.HARBOR_GET_PROJECT_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.HARBOR_GET_PROJECT_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        server: action.response.result.server,
        data: action.response.result.data,
      })
    case ActionTypes.HARBOR_GET_PROJECT_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function projectLogs(state = {}, action) {
  const { registry } = action
  const defaultState = {
    [registry]: {
      isFetching: false, logs: []
    }
  }
  switch (action.type) {
  case ActionTypes.HARBOR_PROJECT_LOGS_REQUEST:
    return merge({}, defaultState, state, {
      [registry]: {
        isFetching: true
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_SUCCESS:
    return Object.assign({}, state, {
      [registry]: {
        isFetching: false,
        server: action.response.result.server,
        list: action.response.result.data,
        total: action.response.result.total
      }
    })
  case ActionTypes.HARBOR_PROJECT_LOGS_FAILURE:
    return merge({}, defaultState, state, {
      [registry]: { isFetching: false }
    })
  default:
    return state
  }
}

export default function harborRegistry(state = { projects: {} }, action) {
  return {
    projects: projects(state.projects, action),
    projectLogs: projectLogs(state.projectLogs, action),
    detail: detail(state.detail, action),
    repos: repos(state.repos, action),
  }
}