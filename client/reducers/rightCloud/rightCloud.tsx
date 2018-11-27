/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Redux reducers for Right cloud integration
 *
 * v0.1 - 2018-11-26
 * @author Zhangxuan
 */
import * as ActionTypes from '../../actions/rightCloud/integration'

function hostList(state, action) {
  switch (action.type) {
    case ActionTypes.RIGHT_CLOUD_HOSTLIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.RIGHT_CLOUD_HOSTLIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.RIGHT_CLOUD_HOSTLIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function volumes(state, action) {
  switch (action.type) {
    case ActionTypes.RIGHT_CLOUD_VOLUMES_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.RIGHT_CLOUD_VOLUMES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.RIGHT_CLOUD_VOLUMES_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function envs(state, action) {
  switch (action.type) {
    case ActionTypes.RIGHT_CLOUD_ENVS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.RIGHT_CLOUD_ENVS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.RIGHT_CLOUD_ENVS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function currentEnv(state, action) {
  switch (action.type) {
    case ActionTypes.CURRENT_CLOUD_ENV_CHANGE:
      return {
        currentEnv: action.env,
      }
    default:
      return state
  }
}

export default function rightCloud(state = {
  hostList: {},
  volumes: {},
  envs: {},
  currentEnv: {},
},                                 action) {
  return {
    hostList: hostList(state.hostList, action),
    volumes: volumes(state.volumes, action),
    envs: envs(state.envs, action),
    currentEnv: currentEnv(state.currentEnv, action),
  }
}
