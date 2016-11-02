/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/user'
import reducerFactory from './factory'

export default function user(state = {
  userDetail: {},
  users: []
 }, action) {
  return {
    userDetail: reducerFactory({
      REQUEST: ActionTypes.USER_DETAIL_REQUEST,
      SUCCESS: ActionTypes.USER_DETAIL_SUCCESS,
      FAILURE: ActionTypes.USER_DETAIL_FAILURE
    }, state.userDetail, action),
    users: reducerFactory({
      REQUEST: ActionTypes.USER_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_LIST_FAILURE
    }, state.users, action)
  }
}