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
  const master = action.master
  const defaultState = {
    [master]: {
      isFetching: false,
      master,
      configGroup: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONFIG_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [master]: { isFetching: true }
      })
    case ActionTypes.CONFIG_LIST_SUCCESS:
      return merge({}, state, {
        [master]: {
          isFetching: false,
          master: action.response.result.master,
          configGroup: union(state.configGroupList, action.response.result.data)
        }
      })
    case ActionTypes.CONFIG_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [master]: { isFetching: false }
      })
    default:
      return state
  }
}
