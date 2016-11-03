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

export const USER_LIST_REQUEST = 'USER_LIST_REQUEST'
export const USER_LIST_SUCCESS = 'USER_LIST_SUCCESS'
export const USER_LIST_FAILURE = 'USER_LIST_FAILURE'

// Fetches user list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserList(query) {
  let endpoint = `${API_URL_PREFIX}/users`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [USER_LIST_REQUEST, USER_LIST_SUCCESS, USER_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches users list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserList(query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchUserList(query))
  }
}

export const USER_DETAIL_REQUEST = 'USER_DETAIL_REQUEST'
export const USER_DETAIL_SUCCESS = 'USER_DETAIL_SUCCESS'
export const USER_DETAIL_FAILURE = 'USER_DETAIL_FAILURE'

// Fetches user list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserDetail(userID) {
  return {
    [FETCH_API]: {
      types: [USER_DETAIL_REQUEST, USER_DETAIL_SUCCESS, USER_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/users/${userID}`,
      schema: {}
    }
  }
}

// Fetches user detail from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserDetail(userID, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchUserDetail(userID))
  }
}

export const USER_TEAM_LIST_REQUEST = 'USER_TEAM_LIST_REQUEST'
export const USER_TEAM_LIST_SUCCESS = 'USER_TEAM_LIST_SUCCESS'
export const USER_TEAM_LIST_FAILURE = 'USER_TEAM_LIST_FAILURE'

// Fetches team list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserTeamList(userID, query) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}/teams`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [USER_TEAM_LIST_REQUEST, USER_TEAM_LIST_SUCCESS, USER_TEAM_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches team list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserTeamList(userID, query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchUserTeamList(userID, query))
  }
}

export const USER_TEAMSAPCE_LIST_REQUEST = 'USER_TEAMSAPCE_LIST_REQUEST'
export const USER_TEAMSAPCE_LIST_SUCCESS = 'USER_TEAMSAPCE_LIST_SUCCESS'
export const USER_TEAMSAPCE_LIST_FAILURE = 'USER_TEAMSAPCE_LIST_FAILURE'

// Fetches teamspace list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserTeamspaceList(userID, query) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}/teamspaces`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [USER_TEAMSAPCE_LIST_REQUEST, USER_TEAMSAPCE_LIST_SUCCESS, USER_TEAMSAPCE_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches teamspace list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserTeamspaceList(userID, query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchUserTeamspaceList(userID, query))
  }
}