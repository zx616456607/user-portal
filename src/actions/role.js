/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Permission
 *
 * v0.1 - 2017-06-08
 * @author lijunbao
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const ROLE_CREATE_REQUEST = 'ROLE_CREATE_REQUEST'
export const ROLE_CREATE_SUCCESS = 'ROLE_CREATE_SUCCESS'
export const ROLE_CREATE_FAILURE = 'ROLE_CREATE_FAILURE'

// Fetches create role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role`
	return {
		[FETCH_API]: {
      types: [ROLE_CREATE_REQUEST, ROLE_CREATE_SUCCESS, ROLE_CREATE_FAILURE],
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

// Fetches create role from API
// Relies on Redux Thunk middleware.
export function CreateRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchCreateRole(body, callback))
	}
}

export const ROLE_LIST_REQUEST = 'ROLE_LIST_REQUEST'
export const ROLE_LIST_SUCCESS = 'ROLE_LIST_SUCCESS'
export const ROLE_LIST_FAILURE = 'ROLE_LIST_FAILURE'

// Fetches list role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchListRole(query,callback){
	let endpoint = `${API_URL_PREFIX}/role`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
	return {
		[FETCH_API]: {
      types: [ROLE_LIST_REQUEST, ROLE_LIST_SUCCESS, ROLE_LIST_FAILURE],
      endpoint,
      schema: {},
    },
    callback
	}
}

// Fetches list role from API
// Relies on Redux Thunk middleware.
export function ListRole(query, callback) {
  return (dispatch) => {
    return dispatch(fetchListRole(query, callback))
  }
}
export const ROLE_GET_REQUEST = 'ROLE_GET_REQUEST'
export const ROLE_GET_SUCCESS = 'ROLE_GET_SUCCESS'
export const ROLE_GET_FAILURE = 'ROLE_GET_FAILURE'

// Fetches get role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.roleId}`
	return {
    [FETCH_API]: {
      types: [ROLE_GET_REQUEST, ROLE_GET_SUCCESS, ROLE_GET_FAILURE],
      endpoint,
      schema: {},
    },
    callback
  }
}

// Fetches get role from API
// Relies on Redux Thunk middleware.
export function GetRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchGetRole(body, callback))
	}
}

export const ROLE_UPDATE_REQUEST = 'ROLE_UPDATE_REQUEST'
export const ROLE_UPDATE_SUCCESS = 'ROLE_UPDATE_SUCCESS'
export const ROLE_UPDATE_FAILURE = 'ROLE_UPDATE_FAILURE'

// Fetches get update from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateRole(query,callback){
  let endpoint = `${API_URL_PREFIX}/role/${query.id}`
  let body = query.body
	return {
		[FETCH_API]: {
      types: [ROLE_UPDATE_REQUEST, ROLE_UPDATE_SUCCESS, ROLE_UPDATE_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        body
      },
      schema: {},
    },
    callback
	}
}

// Fetches update role from API
// Relies on Redux Thunk middleware.
export function UpdateRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchUpdateRole(body, callback))
	}
}

export const ROLE_DELETE_REQUEST = 'ROLE_DELETE_REQUEST'
export const ROLE_DELETE_SUCCESS = 'ROLE_DELETE_SUCCESS'
export const ROLE_DELETE_FAILURE = 'ROLE_DELETE_FAILURE'

// Fetches get delete from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.res.id}`
	if (body.res.state) {
    endpoint += `?retain=${body.res.state}`
  }
	return {
		[FETCH_API]: {
      types: [ROLE_DELETE_REQUEST, ROLE_DELETE_SUCCESS, ROLE_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
	}
}

// Fetches delete role from API
// Relies on Redux Thunk middleware.
export function DeleteRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteRole(body, callback))
	}
}

export const ROLE_ADDPERMISSION_REQUEST = 'ROLE_ADDPERMISSION_REQUEST'
export const ROLE_ADDPERMISSION_SUCCESS = 'ROLE_ADDPERMISSION_SUCCESS'
export const ROLE_ADDPERMISSION_FAILURE = 'ROLE_ADDPERMISSION_FAILURE'

// Fetches add permission role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddPermissionRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.id}/addPermission`
	return {
		[FETCH_API]: {
      types: [ROLE_ADDPERMISSION_REQUEST, ROLE_ADDPERMISSION_SUCCESS, ROLE_ADDPERMISSION_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body.bodys
      },
      schema: {},
    },
    callback
	}
}

// Fetches add permission role from API
// Relies on Redux Thunk middleware.
export function AddPermissionRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchAddPermissionRole(body, callback))
	}
}


export const ROLE_REMOVEPERMISSION_REQUEST = 'ROLE_REMOVEPERMISSION_REQUEST'
export const ROLE_REMOVEPERMISSION_SUCCESS = 'ROLE_REMOVEPERMISSION_SUCCESS'
export const ROLE_REMOVEPERMISSION_FAILURE = 'ROLE_REMOVEPERMISSION_FAILURE'

// Fetches remove permission role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRemovePermissionRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.id}/removePermission`
	return {
		[FETCH_API]: {
      types: [ROLE_REMOVEPERMISSION_REQUEST, ROLE_REMOVEPERMISSION_SUCCESS, ROLE_REMOVEPERMISSION_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body.bodys
      },
      schema: {},
    },
    callback
	}
}

// Fetches remove permission role from API
// Relies on Redux Thunk middleware.
export function RemovePermissionRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchRemovePermissionRole(body, callback))
	}
}

export const ROLE_EXISTENCE_REQUEST = 'ROLE_EXISTENCE_REQUEST'
export const ROLE_EXISTENCE_SUCCESS = 'ROLE_EXISTENCE_SUCCESS'
export const ROLE_EXISTENCE_FAILURE = 'ROLE_EXISTENCE_FAILURE'
// Fetches exist role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchExistenceRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.name}/existence`
	return {
		[FETCH_API]: {
      types: [ROLE_EXISTENCE_REQUEST, ROLE_EXISTENCE_SUCCESS, ROLE_EXISTENCE_FAILURE],
      endpoint,
      schema: {},
    },
    callback
	}
}

// Fetches exist role from API
// Relies on Redux Thunk middleware.
export function ExistenceRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchExistenceRole(body, callback))
	}
}

export const ROLE_ALLOWUPDATE_REQUEST = 'ROLE_ALLOWUPDATE_REQUEST'
export const ROLE_ALLOWUPDATE_SUCCESS = 'ROLE_ALLOWUPDATE_SUCCESS'
export const ROLE_ALLOWUPDATE_FAILURE = 'ROLE_ALLOWUPDATE_FAILURE'

// Fetches allow update role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAllowUpdateRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.id}/allowUpdate`
	return {
		[FETCH_API]: {
      types: [ROLE_ALLOWUPDATE_REQUEST, ROLE_ALLOWUPDATE_SUCCESS, ROLE_ALLOWUPDATE_FAILURE],
      endpoint,
      schema: {},
    },
    callback
	}
}

// Fetches allow update role from API
// Relies on Redux Thunk middleware.
export function AllowUpdateRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchAllowUpdateRole(body, callback))
	}
}

export const USERS_ADD_ROLES_REQUEST = 'USERS_ADD_ROLES_REQUEST'
export const USERS_ADD_ROLES_SUCCESS = 'USERS_ADD_ROLES_SUCCESS'
export const USERS_ADD_ROLES__FAILURE = 'USERS_ADD_ROLES__FAILURE'

function fetchUsersAddRoles(body,callback) {
  return {
    [FETCH_API]: {
      types: [USERS_ADD_ROLES_REQUEST, USERS_ADD_ROLES_SUCCESS, USERS_ADD_ROLES__FAILURE],
      endpoint: `${API_URL_PREFIX}/role/${body.roleID}/${body.scope}/${body.scopeID}`,
      options: {
        method: 'POST',
        body: body.body
      },
      schema: {}
    },
    callback
  }
}

export function usersAddRoles(body,callback) {
  return (dispatch,getState) => {
    return dispatch(fetchUsersAddRoles(body,callback))
  }
}

export const USERS_LOSE_ROLES_REQUEST = 'USERS_LOSE_ROLES_REQUEST'
export const USERS_LOSE_ROLES_SUCCESS = 'USERS_LOSE_ROLES_SUCCESS'
export const USERS_LOSE_ROLES__FAILURE = 'USERS_LOSE_ROLES__FAILURE'

function fetchUsersLoseRoles(body,callback) {
  return {
    [FETCH_API]: {
      types: [USERS_LOSE_ROLES_REQUEST, USERS_LOSE_ROLES_SUCCESS, USERS_LOSE_ROLES__FAILURE],
      endpoint: `${API_URL_PREFIX}/role/${body.roleID}/${body.scope}/${body.scopeID}/batch-delete`,
      options: {
        method: 'POST',
        body: body.body
      },
      schema: {}
    },
    callback
  }
}

export function usersLoseRoles(body,callback) {
  return (dispatch,getState) => {
    return dispatch(fetchUsersLoseRoles(body,callback))
  }
}

export const ROLE_WITH_MEMBERS_REQUEST = 'ROLE_WITH_MEMBERS_REQUEST'
export const ROLE_WITH_MEMBERS_SUCCESS = 'ROLE_WITH_MEMBERS_SUCCESS'
export const ROLE_WITH_MEMBERS__FAILURE = 'ROLE_WITH_MEMBERS__FAILURE'

function fetchRoleWithMembers(body,callback) {
  return {
    [FETCH_API]: {
      types: [ROLE_WITH_MEMBERS_REQUEST, ROLE_WITH_MEMBERS_SUCCESS, ROLE_WITH_MEMBERS__FAILURE],
      endpoint: `${API_URL_PREFIX}/role/${body.roleID}/${body.scope}/${body.scopeID}/users`,
      schema: {}
    },
    callback
  }
}

export function roleWithMembers(body,callback) {
  return (dispatch,getState) => {
    return dispatch(fetchRoleWithMembers(body,callback))
  }
}

export const ROLE_GET_SEARCH_REQUEST = 'ROLE_GET_SEARCH_REQUEST'
export const ROLE_GET_SEARCH_SUCCESS = 'ROLE_GET_SEARCH_SUCCESS'
export const ROLE_GET_SEARCH_FAILURE = 'ROLE_GET_SEARCH_FAILURE'

function fetchGetSearchInfo(body, callback){
  let endpoint = `${API_URL_PREFIX}/role`
  if (body) {
    endpoint += `?filter=${body.value}`
  }
	return {
		[FETCH_API]: {
      types: [ROLE_GET_SEARCH_REQUEST, ROLE_GET_SEARCH_SUCCESS, ROLE_GET_SEARCH_FAILURE],
      endpoint,
      schema: {},
    },
    callback
	}
}

export function GetSearchList(body, callback){
  return(dispatch, getState) => {
    return dispatch(fetchGetSearchInfo(body, callback))
  }
}


