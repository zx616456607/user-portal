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
function fetchUserList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/users`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [USER_LIST_REQUEST, USER_LIST_SUCCESS, USER_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches users list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserList(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUserList(query, callback))
  }
}

export const USER_DETAIL_REQUEST = 'USER_DETAIL_REQUEST'
export const USER_DETAIL_SUCCESS = 'USER_DETAIL_SUCCESS'
export const USER_DETAIL_FAILURE = 'USER_DETAIL_FAILURE'

// Fetches user detail from API.
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

export const USER_APPINFO_REQUEST = 'USER_APPINFO_REQUEST'
export const USER_APPINFO_SUCCESS = 'USER_APPINFO_SUCCESS'
export const USER_APPINFO_FAILURE = 'USER_APPINFO_FAILURE'

// Fetches user app info from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserAppInfo(userID) {
  return {
    [FETCH_API]: {
      types: [USER_APPINFO_REQUEST, USER_APPINFO_SUCCESS, USER_APPINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/users/${userID}/app_info`,
      schema: {}
    }
  }
}

// Fetches user app info from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserAppInfo(userID, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchUserAppInfo(userID))
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

export const USER_TEAMSPACE_LIST_REQUEST = 'USER_TEAMSPACE_LIST_REQUEST'
export const USER_TEAMSPACE_LIST_SUCCESS = 'USER_TEAMSPACE_LIST_SUCCESS'
export const USER_TEAMSPACE_LIST_FAILURE = 'USER_TEAMSPACE_LIST_FAILURE'

// Fetches teamspace list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserTeamspaceList(userID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}/teamspaces/detail`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [USER_TEAMSPACE_LIST_REQUEST, USER_TEAMSPACE_LIST_SUCCESS, USER_TEAMSPACE_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches teamspace list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserTeamspaceList(userID, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUserTeamspaceList(userID, query, callback))
  }
}

export const USER_CREATE_REQUEST = 'USER_CREATE_REQUEST'
export const USER_CREATE_SUCCESS = 'USER_CREATE_SUCCESS'
export const USER_CREATE_FAILURE = 'USER_CREATE_FAILURE'

// Create user from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateUser(body, callback) {
  let endpoint = `${API_URL_PREFIX}/users`
  return {
    [FETCH_API]: {
      types: [USER_CREATE_REQUEST, USER_CREATE_SUCCESS, USER_CREATE_FAILURE],
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

// Create user from API 
// Relies on Redux Thunk middleware.
export function createUser(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateUser(body, callback))
  }
}

export const USER_DELETE_REQUEST = 'USER_DELETE_REQUEST'
export const USER_DELETE_SUCCESS = 'USER_DELETE_SUCCESS'
export const USER_DELETE_FAILURE = 'USER_DELETE_FAILURE'

// Delete user from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteUser(userID, callback) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}`
  return {
    [FETCH_API]: {
      types: [USER_DELETE_REQUEST, USER_DELETE_SUCCESS, USER_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Delete user from API
// Relies on Redux Thunk middleware.
export function deleteUser(userID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteUser(userID, callback))
  }
}

export const USER_UPDATE_REQUEST = 'USER_UPDATE_REQUEST'
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS'
export const USER_UPDATE_FAILURE = 'USER_UPDATE_FAILURE'

// Update user from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateUser(userID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}`
  return {
    [FETCH_API]: {
      types: [USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS, USER_UPDATE_FAILURE],
      endpoint,
      options: {
        method: 'PATCH',
        body
      },
      schema: {},
    },
    callback
  }
}

// Update user from API 
// Relies on Redux Thunk middleware.
export function updateUser(userID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateUser(userID, body, callback))
  }
}
