/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const TEAMSPACE_LIST_REQUEST = 'TEAMSPACE_LIST_REQUEST'
export const TEAMSPACE_LIST_SUCCESS = 'TEAMSPACE_LIST_SUCCESS'
export const TEAMSPACE_LIST_FAILURE = 'TEAMSPACE_LIST_FAILURE'

// Fetches user list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamspaceList(teamID) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAMSPACE_LIST_REQUEST, TEAMSPACE_LIST_SUCCESS, TEAMSPACE_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches user detail from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserDetail(userID, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamspaceList(userID))
  }
}

export const TEAMUSER_LIST_REQUEST = 'TEAMUSER_LIST_REQUEST'
export const TEAMUSER_LIST_SUCCESS = 'TEAMUSER_LIST_SUCCESS'
export const TEAMUSER_LIST_FAILURE = 'TEAMUSER_LIST_FAILURE'

// Fetches team user list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamUserList(teamID, query) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAMUSER_LIST_REQUEST, TEAMUSER_LIST_SUCCESS, TEAMUSER_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches team users list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamUserList(teamID, query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamUserList(teamID, query))
  }
}

export const TEAM_CLUSTERS_LIST_REQUEST = 'TEAM_CLUSTERS_LIST_REQUEST'
export const TEAM_CLUSTERS_LIST_SUCCESS = 'TEAM_CLUSTERS_LIST_SUCCESS'
export const TEAM_CLUSTERS_LIST_FAILURE = 'TEAM_CLUSTERS_LIST_FAILURE'

// Fetches user list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamClustersList(teamID) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/clusters`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAM_CLUSTERS_LIST_REQUEST, TEAM_CLUSTERS_LIST_SUCCESS, TEAM_CLUSTERS_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches user detail from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamClustersList(teamID, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamClustersList(teamID))
  }
}
