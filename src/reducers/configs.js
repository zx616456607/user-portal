/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/26
 * @author ZhaoXueYu
 */

import * as ActionTypes from  '../actions/configs'
import merge from 'lodash/merge'
import union from 'lodash/union'

export function configGroupList(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false,
      cluster,
      configGroup: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONFIG_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: { isFetching: true }
      })
    case ActionTypes.CONFIG_LIST_SUCCESS:
      return merge({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          configGroup: union(state.configGroupList, action.response.result.data)
        }
      })
    case ActionTypes.CONFIG_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: { isFetching: false }
      })
    default:
      return state
  }
}
