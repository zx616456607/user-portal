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

const option = {
  overwrite: true
}

export default function user(state = {
  userDetail: {},
  users: [],
  teams: {},
  teamspaces: {}
 }, action) {
  return {
    userDetail: reducerFactory({
      REQUEST: ActionTypes.USER_DETAIL_REQUEST,
      SUCCESS: ActionTypes.USER_DETAIL_SUCCESS,
      FAILURE: ActionTypes.USER_DETAIL_FAILURE
    }, state.userDetail, action, option),
    users: reducerFactory({
      REQUEST: ActionTypes.USER_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_LIST_FAILURE
    }, state.users, action, option),
    createUser: reducerFactory({
      REQUEST: ActionTypes.USER_CREATE_REQUEST,
      SUCCESS: ActionTypes.USER_CREATE_SUCCESS,
      FAILURE: ActionTypes.USER_CREATE_FAILURE
    }, state.createUser, action, option),
    teams: reducerFactory({
      REQUEST: ActionTypes.USER_TEAM_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_TEAM_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_TEAM_LIST_FAILURE
    }, state.teams, action, option),
    teamspaces: reducerFactory({
      REQUEST: ActionTypes.USER_TEAMSPACE_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_TEAMSPACE_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_TEAMSPACE_LIST_FAILURE
    }, state.teamspaces, action, option)
  }
}