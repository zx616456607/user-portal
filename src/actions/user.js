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
function fetchUserTeamList(userID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}/teams`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [USER_TEAM_LIST_REQUEST, USER_TEAM_LIST_SUCCESS, USER_TEAM_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches team list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserTeamList(userID, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUserTeamList(userID, query, callback))
  }
}

export const USER_TEAMSPACE_LIST_REQUEST = 'USER_TEAMSPACE_LIST_REQUEST'
export const USER_TEAMSPACE_LIST_SUCCESS = 'USER_TEAMSPACE_LIST_SUCCESS'
export const USER_TEAMSPACE_LIST_FAILURE = 'USER_TEAMSPACE_LIST_FAILURE'

// Fetches teamspace list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserTeamspaceList(userID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}/teamspaces`
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

export const USER_TEAMSPACE_DETAIL_LIST_REQUEST = 'USER_TEAMSPACE_DETAIL_LIST_REQUEST'
export const USER_TEAMSPACE_DETAIL_LIST_SUCCESS = 'USER_TEAMSPACE_DETAIL_LIST_SUCCESS'
export const USER_TEAMSPACE_DETAIL_LIST_FAILURE = 'USER_TEAMSPACE_DETAIL_LIST_FAILURE'

// Fetches teamspace list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUserTeamspaceDetailList(userID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/users/${userID}/teamspaces/detail`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [USER_TEAMSPACE_DETAIL_LIST_REQUEST, USER_TEAMSPACE_DETAIL_LIST_SUCCESS, USER_TEAMSPACE_DETAIL_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches teamspace list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUserTeamspaceDetailList(userID, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUserTeamspaceDetailList(userID, query, callback))
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
      schema: {}
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

export const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST'
export const USER_REGISTER_SUCCESS = 'USER_REGISTER_SUCCESS'
export const USER_REGISTER_FAILURE = 'USER_REGISTER_FAILURE'

// Register user for standard edition from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRegisterUser(body, callback) {
  let endpoint = `${API_URL_PREFIX}/stdusers`
  return {
    [FETCH_API]: {
      types: [USER_REGISTER_REQUEST, USER_REGISTER_SUCCESS, USER_REGISTER_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

// Register user for standard edition from API
// Relies on Redux Thunk middleware.
export function registerUser(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRegisterUser(body, callback))
  }
}

export const USER_REGISTER_JOINTEAM_REQUEST = 'USER_REGISTER_JOINTEAM_REQUEST'
export const USER_REGISTER_JOINTEAM_SUCCESS = 'USER_REGISTER_JOINTEAM_SUCCESS'
export const USER_REGISTER_JOINTEAM_FAILURE = 'USER_REGISTER_JOINTEAM_FAILURE'

// Register user and join team for standard edition from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRegisterUserAndJoinTeam(body, callback) {
  let endpoint = `${API_URL_PREFIX}/stdusers/jointeam`
  return {
    [FETCH_API]: {
      types: [USER_REGISTER_JOINTEAM_REQUEST, USER_REGISTER_JOINTEAM_SUCCESS, USER_REGISTER_JOINTEAM_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

// Register user and join team for standard edition from API
// Relies on Redux Thunk middleware.
export function registerUserAndJoinTeam(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRegisterUserAndJoinTeam(body, callback))
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
      schema: {}
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
      schema: {}
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

// Check user name existence
export const USER_CHECK_NAME_REQUEST = 'USER_CHECK_NAME_REQUEST'
export const USER_CHECK_NAME_SUCCESS = 'USER_CHECK_NAME_SUCCESS'
export const USER_CHECK_NAME_FAILURE = 'USER_CHECK_NAME_FAILURE'

function fetchCheckUserName(userName, callback) {
  return {
    userName,
    [FETCH_API]: {
      types: [USER_CHECK_NAME_REQUEST, USER_CHECK_NAME_SUCCESS, USER_CHECK_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/users/${userName}/existence`,
      schema: {}
    },
    callback
  }
}

export function checkUserName(userName, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckUserName(userName, callback))
  }
}

export const STANDARD_USER_INFO_REQUEST = 'STANDARD_USER_INFO_REQUEST'
export const STANDARD_USER_INFO_SUCCESS = 'STANDARD_USER_INFO_SUCCESS'
export const STANDARD_USER_INFO_FAILURE = 'STANDARD_USER_INFO_FAILURE'

function fetchStandardUserInfo(callback) { 
  return {
    [FETCH_API]: {
      types: [STANDARD_USER_INFO_REQUEST, STANDARD_USER_INFO_SUCCESS, STANDARD_USER_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/myaccount`,
      method: 'get',
      schema: {}
    },
    callback
  }
}

export function loadStandardUserInfo(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStandardUserInfo(callback))
  }
}




export const USER_CHANGE_USERINFO_REQUEST = 'USER_CHANGE_USERINFO_REQUEST'
export const USER_CHANGE_USERINFO_SUCCESS = 'USER_CHANGE_USERINFO_SUCCESS'
export const USER_CHANGE_USERINFO_FAILURE = 'USER_CHANGE_USERINFO_FAILURE'

function fetchChangeUserInfo(inputInfo, callback) {
  return {
    [FETCH_API]: {
      types: [USER_CHANGE_USERINFO_REQUEST, USER_CHANGE_USERINFO_SUCCESS, USER_CHANGE_USERINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/myaccount`,
      schema: {},
      options: {
        method: 'PATCH',
        body: inputInfo
      }
    },
		body: inputInfo,
    callback
  }
}

export function changeUserInfo(inputInfo, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchChangeUserInfo(inputInfo, callback))
  }
}


export const CREATE_CERT_INFO_REQUEST = 'CREATE_CERT_INFO_REQUEST'
export const CREATE_CERT_INFO_SUCCESS = 'CREATE_CERT_INFO_SUCCESS'
export const CREATE_CERT_INFO_FAILUER = 'CREATE_CERT_INFO_FAILUER'
function fetchCreateCertInfo(body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_CERT_INFO_REQUEST, CREATE_CERT_INFO_SUCCESS, CREATE_CERT_INFO_FAILUER],
      endpoint: `${API_URL_PREFIX}/certificates`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function createCertInfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateCertInfo(body, callback))
  }
}
export const GET_USER_CERTIFICATE_REQUEST = 'GET_USER_CERTIFICATE_REQUEST'
export const GET_USER_CERTIFICATE_SUCCESS = 'GET_USER_CERTIFICATE_SUCCESS'
export const GET_USER_CERTIFICATE_FAILURE = 'GET_USER_CERTIFICATE_FAILURE'

function fetchStandardUserCertificate(callback) { 
  return {
    [FETCH_API]: {
      types: [GET_USER_CERTIFICATE_REQUEST, GET_USER_CERTIFICATE_SUCCESS, GET_USER_CERTIFICATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/certificates`,
      schema: {}
    }
  }
}

export function loadStandardUserCertificate(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStandardUserCertificate(callback))
  }
}
