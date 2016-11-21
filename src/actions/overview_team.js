/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-11-18
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const OVERVIEW_TEAM_DETAIL_REQUEST = 'OVERVIEW_TEAM_DETAIL_REQUEST'
export const OVERVIEW_TEAM_DETAIL_SUCCESS = 'OVERVIEW_TEAM_DETAIL_SUCCESS'
export const OVERVIEW_TEAM_DETAIL_FAILURE = 'OVERVIEW_TEAM_DETAIL_FAILURE'

// Fetches team overview detail from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamDetail(teamID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_TEAM_DETAIL_REQUEST, OVERVIEW_TEAM_DETAIL_SUCCESS, OVERVIEW_TEAM_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/teams/${teamID}/detail`,
      schema: {}
    }
  }
}

// Fetches team overview detail from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamDetail(teamID) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamDetail(teamID))
  }
}

export const OVERVIEW_TEAM_OPERATIONS_REQUEST = 'OVERVIEW_TEAM_OPERATIONS_REQUEST'
export const OVERVIEW_TEAM_OPERATIONS_SUCCESS = 'OVERVIEW_TEAM_OPERATIONS_SUCCESS'
export const OVERVIEW_TEAM_OPERATIONS_FAILURE = 'OVERVIEW_TEAM_OPERATIONS_FAILURE'

// Fetches team operations from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamOperations(teamID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_TEAM_OPERATIONS_REQUEST, OVERVIEW_TEAM_OPERATIONS_SUCCESS, OVERVIEW_TEAM_OPERATIONS_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/teams/${teamID}/operations`,
      schema: {}
    }
  }
}

// Fetches team operations from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamOperations(teamID) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamOperations(teamID))
  }
}