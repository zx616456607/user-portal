/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Entities reducer
 *
 * v0.1 - 2016-11-21
 * @author Zhangpc
 */
import * as ActionTypes from '../actions/entities'
import merge from 'lodash/merge'
import { STANDARD_MODE } from '../../configs/constants'
import { mode } from '../../configs/model'

function current(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CURRENT:
      let current = action.current
      if (!current.team) {
        current.team = state.team
      }
      if (!current.space) {
        current.space = state.space
      }
      if (!current.cluster) {
        current.cluster = state.cluster
      }
      current.unit = 'T'
      if (mode === STANDARD_MODE) {
         current.unit = '￥'
      }
      return Object.assign({}, state, current)
    default:
      return state
  }
}

function loginUser(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_REQUEST:
    case ActionTypes.LOGIN_USER_DETAIL_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        info: action.response.result.user
      })
    case ActionTypes.LOGIN_USER_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        info: action.response.result.data
      })
    case ActionTypes.LOGIN_FAILURE:
    case ActionTypes.LOGIN_USER_DETAIL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function sockets(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SOCKETS:
      let sockets = action.sockets
      if (!sockets.statusWatchWs) {
        sockets.statusWatchWs = state.statusWatchWs
      }
      return Object.assign({}, state, sockets)
    default:
      return state
  }
}

// Updates an entity cache in response to any action with response.entities.
export default function entities(state = {
  // isFetching: false,
  loginUser: {
    isFetching: false,
    info: {}
  },
  current: {
    team: {},
    space: {},
    cluster: {},
  },
  sockets: {},
}, action) {
  /*if (action.response && action.response.entities) {
    let isFetching = false
    if (action.type.indexOf('_REQUEST') > -1) {
      isFetching = true
    }
    return merge({}, state, action.response.entities, { isFetching })
  }*/
  return {
    current: current(state.current, action),
    loginUser: loginUser(state.loginUser, action),
    sockets: sockets(state.sockets, action),
  }
}