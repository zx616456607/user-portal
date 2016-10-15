/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Default reducers factory
 *
 * v0.1 - 2016-10-09
 * @author Zhangpc
 */

import merge from 'lodash/merge'

export default function reducerFactory(ActionTypes = {}, state, action) {
  const defaultState = {
    isFetching: false
  }
  switch (action.type) {
    case ActionTypes.REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.SUCCESS:
      return merge({}, state, {
        isFetching: false,
        result: action.response.result
      })
    case ActionTypes.FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}