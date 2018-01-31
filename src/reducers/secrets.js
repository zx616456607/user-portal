/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * secrets reducers for redux
 *
 * 2018-01-31
 * @author zhangpc
 */

import * as ActionTypes from '../actions/secrets'

function list(state, action) {
  const { clusterID, type } = action
  const defaultState = {
    [clusterID]: {
      isFetching: false
    }
  }
  switch (type) {
    case ActionTypes.GET_SECRETS_REQUEST:
      return {
        ...state,
        [clusterID]: {
          isFetching: true
        }
      }
    case ActionTypes.GET_SECRETS_SUCCESS:
      return {
        ...state,
        [clusterID]: {
          isFetching: false,
          data: action.response.result.data,
        }
      }
    case ActionTypes.GET_SECRETS_FAILURE:
      return {
        ...state,
        [clusterID]: {
          isFetching: false
        }
      }
    default:
      return state
  }
}

export default function secrets(state = {
  list: {},
 }, action) {
  return {
    list: list(state.list, action),
  }
 }
