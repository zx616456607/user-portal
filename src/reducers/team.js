/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/team'
import reducerFactory from './factory'

export default function team(state = {
  teams: [],
  teamspaces: []
}, action) {
  return {
    teams: reducerFactory({
      REQUEST: ActionTypes.TEAM_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAM_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAM_LIST_FAILURE
    }, state.teams, action),
    teamspaces: reducerFactory({
      REQUEST: ActionTypes.TEAMSPACE_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAMSPACE_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAMSPACE_LIST_FAILURE
    }, state.teamspaces, action),
    teamusers: reducerFactory({
      REQUEST: ActionTypes.TTEAMUSER_LIST_REQUEST,
      SUCCESS: ActionTypes.TTEAMUSER_LIST_SUCCESS,
      FAILURE: ActionTypes.TTEAMUSER_LIST_FAILURE
    }, state.teamusers, action),
    teamClusters: reducerFactory({
      REQUEST: ActionTypes.TEAMSPACE_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAMSPACE_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAMSPACE_LIST_FAILURE
    }, state.teamspaces, action),
  }
}