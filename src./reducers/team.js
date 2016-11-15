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

const options = { overwrite: true }

export default function team(state = {
  teams: [],
  teamspaces: [],
  teamClusters: [],
  teamusers: [],
}, action) {
  return {
    teams: reducerFactory({
      REQUEST: ActionTypes.TEAM_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAM_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAM_LIST_FAILURE
    }, state.teams, action, options),
    teamspaces: reducerFactory({
      REQUEST: ActionTypes.TEAMSPACE_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAMSPACE_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAMSPACE_LIST_FAILURE
    }, state.teamspaces, action, options),
    teamusers: reducerFactory({
      REQUEST: ActionTypes.TEAMUSER_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAMUSER_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAMUSER_LIST_FAILURE
    }, state.teamusers, action, options),
    teamClusters: reducerFactory({
      REQUEST: ActionTypes.TEAM_CLUSTERS_LIST_REQUEST,
      SUCCESS: ActionTypes.TEAM_CLUSTERS_LIST_SUCCESS,
      FAILURE: ActionTypes.TEAM_CLUSTERS_LIST_FAILURE
    }, state.teamClusters, action, options),
  }
}