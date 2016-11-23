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

// Fetches teamspace list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamspaceList(teamID, query) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces`
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

// Fetches teamspace list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamspaceList(teamID, query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamspaceList(teamID, query))
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

// Fetches team cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamClustersList(teamID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/clusters`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAM_CLUSTERS_LIST_REQUEST, TEAM_CLUSTERS_LIST_SUCCESS, TEAM_CLUSTERS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches team cluster list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamClustersList(teamID, query, callback) {
  return (dispatch) => {
    return dispatch(fetchTeamClustersList(teamID, query, callback))
  }
}

export const ALL_CLUSTERS_LIST_REQUEST = 'ALL_CLUSTERS_LIST_REQUEST'
export const ALL_CLUSTERS_LIST_SUCCESS = 'ALL_CLUSTERS_LIST_SUCCESS'
export const ALL_CLUSTERS_LIST_FAILURE = 'ALL_CLUSTERS_LIST_FAILURE'

// Fetches all cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAllClustersList(teamID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/clusters/all`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [ALL_CLUSTERS_LIST_REQUEST, ALL_CLUSTERS_LIST_SUCCESS, ALL_CLUSTERS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches all cluster list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAllClustersList(teamID, query, callback) {
  return (dispatch) => {
    return dispatch(fetchAllClustersList(teamID, query, callback))
  }
}

export const TEAM_CREATE_REQUEST = 'TEAM_CREATE_REQUEST'
export const TEAM_CREATE_SUCCESS = 'TEAM_CREATE_SUCCESS'
export const TEAM_CREATE_FAILURE = 'TEAM_CREATE_FAILURE'

// Create team from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateTeam(body, callback) {
  let endpoint = `${API_URL_PREFIX}/teams`
  return {
    [FETCH_API]: {
      types: [TEAM_CREATE_REQUEST, TEAM_CREATE_SUCCESS, TEAM_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

// Create team from API 
// Relies on Redux Thunk middleware.
export function createTeam(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateTeam(body, callback))
  }
}

export const TEAM_DELETE_REQUEST = 'TEAM_DELETE_REQUEST'
export const TEAM_DELETE_SUCCESS = 'TEAM_DELETE_SUCCESS'
export const TEAM_DELETE_FAILURE = 'TEAM_DELETE_FAILURE'

// Delete team from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteTeam(teamID, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}`
  return {
    [FETCH_API]: {
      types: [TEAM_DELETE_REQUEST, TEAM_DELETE_SUCCESS, TEAM_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Delete team from API
// Relies on Redux Thunk middleware.
export function deleteTeam(teamID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteTeam(teamID, callback))
  }
}

export const TEAMSPACE_CREATE_REQUEST = 'TEAMSPACE_CREATE_REQUEST'
export const TEAMSPACE_CREATE_SUCCESS = 'TEAMSPACE_CREATE_SUCCESS'
export const TEAMSPACE_CREATE_FAILURE = 'TEAMSPACE_CREATE_FAILURE'

// Create teamspace from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateTeamspace(teamID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces`
  return {
    [FETCH_API]: {
      types: [TEAMSPACE_CREATE_REQUEST, TEAMSPACE_CREATE_SUCCESS, TEAMSPACE_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

// Create teamspace from API 
// Relies on Redux Thunk middleware.
export function createTeamspace(teamID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateTeamspace(teamID, body, callback))
  }
}

export const TEAMUSERS_ADD_REQUEST = 'TEAMUSERS_ADD_REQUEST'
export const TEAMUSERS_ADD_SUCCESS = 'TEAMUSERS_ADD_SUCCESS'
export const TEAMUSERS_ADD_FAILURE = 'TEAMUSERS_ADD_FAILURE'

// Add team users from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddTeamusers(teamID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users`
  return {
    [FETCH_API]: {
      types: [TEAMUSERS_ADD_REQUEST, TEAMUSERS_ADD_SUCCESS, TEAMUSERS_ADD_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

// Add team users from API 
// Relies on Redux Thunk middleware.
export function addTeamusers(teamID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddTeamusers(teamID, body, callback))
  }
}

export const TEAMUSERS_REMOVE_REQUEST = 'TEAMUSERS_REMOVE_REQUEST'
export const TEAMUSERS_REMOVE_SUCCESS = 'TEAMUSERS_REMOVE_SUCCESS'
export const TEAMUSERS_REMOVE_FAILURE = 'TEAMUSERS_REMOVE_FAILURE'

// Remove team users from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRemoveTeamusers(teamID, userIDs, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users/${userIDs}`
  return {
    [FETCH_API]: {
      types: [TEAMUSERS_REMOVE_REQUEST, TEAMUSERS_REMOVE_SUCCESS, TEAMUSERS_REMOVE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Remove team users from API
// Relies on Redux Thunk middleware.
export function removeTeamusers(teamID, userIDs, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRemoveTeamusers(teamID, userIDs, callback))
  }
}

export const TEAMSPACE_DELETE_REQUEST = 'TEAMSPACE_DELETE_REQUEST'
export const TEAMSPACE_DELETE_SUCCESS = 'TEAMSPACE_DELETE_SUCCESS'
export const TEAMSPACE_DELETE_FAILURE = 'TEAMSPACE_DELETE_FAILURE'

// Remove team space from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteTeamspace(teamID, spaceID, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces/${spaceID}`
  return {
    [FETCH_API]: {
      types: [TEAMSPACE_DELETE_REQUEST, TEAMSPACE_DELETE_SUCCESS, TEAMSPACE_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Remove team space from API
// Relies on Redux Thunk middleware.
export function deleteTeamspace(teamID, spaceID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteTeamspace(teamID, spaceID, callback))
  }
}