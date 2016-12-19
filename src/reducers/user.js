/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2016 tenxcloud. all rights reserved.
 *
 * redux reducers for app manage
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/user'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'

const option = {
  overwrite: true
}

function standardUserDetail(state = {}, action) {
  const defaultState = {
    ifFetching: false
  }
  switch(action.type) {
    case ActionTypes.STANDARD_USER_INFO_REQUEST: {
      return Object.assign({}, {
        isFetching: true
      })
    }
    case ActionTypes.STANDARD_USER_INFO_SUCCESS: {
      return Object.assign({}, action.response.result, {
        isFetching: false
      })
    }
    case ActionTypes.STANDARD_USER_INFO_FAILURE: {
      return Object.assign({}, {
        isFetching: false
      })
    }
    case ActionTypes.USER_CHANGE_USERINFO_REQUEST: {
      return state
    }
    case ActionTypes.USER_CHANGE_USERINFO_SUCCESS: {
      const resultState = cloneDeep(state)
      if(action.body.email) {
        resultState.result.userInfo.email = action.body.emial
      }
      return resultState
    }
    case ActionTypes.USER_CHANGE_USERINFO_FAILURE: {
      return state
    }
    default: {
      return state
    }
  }
}

export default function user(state = {
  userDetail: {},
  users: [],
  teams: {},
  teamspaces: [],
  teamspaceDetails: [],
  userAppInfo: {}
 }, action) {
  return {
    userDetail: reducerFactory({
      REQUEST: ActionTypes.USER_DETAIL_REQUEST,
      SUCCESS: ActionTypes.USER_DETAIL_SUCCESS,
      FAILURE: ActionTypes.USER_DETAIL_FAILURE
    }, state.userDetail, action, option),
    standardUserDetail: standardUserDetail(state.standardUserDetail, action),
    userAppInfo: reducerFactory({
      REQUEST: ActionTypes.USER_APPINFO_REQUEST,
      SUCCESS: ActionTypes.USER_APPINFO_SUCCESS,
      FAILURE: ActionTypes.USER_APPINFO_FAILURE
    }, state.userAppInfo, action, option),
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
    }, state.teamspaces, action, option),
    teamspaceDetails: reducerFactory({
      REQUEST: ActionTypes.USER_TEAMSPACE_DETAIL_LIST_REQUEST,
      SUCCESS: ActionTypes.USER_TEAMSPACE_DETAIL_LIST_SUCCESS,
      FAILURE: ActionTypes.USER_TEAMSPACE_DETAIL_LIST_FAILURE
    }, state.teamspaceDetails, action, option)
  }
}
