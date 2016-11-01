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

export const TEAM_LIST_REQUEST = 'TEAM_LIST_REQUEST'
export const TEAM_LIST_SUCCESS = 'TEAM_LIST_SUCCESS'
export const TEAM_LIST_FAILURE = 'TEAM_LIST_FAILURE'

// Fetches team list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamList(query) {
  let endpoint = `${API_URL_PREFIX}/teams`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAM_LIST_REQUEST, TEAM_LIST_SUCCESS, TEAM_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches teamspace list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamList(query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamList(query))
  }
}

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

