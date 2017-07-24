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
function fetchListRole(callback){
	let endpoint = `${API_URL_PREFIX}/role`
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
export function ListRole(body, callback) {
  return (dispatch) => {
    return dispatch(fetchListRole(body, callback))
  }
}
export const ROLE_GET_REQUEST = 'ROLE_GET_REQUEST'
export const ROLE_GET_SUCCESS = 'ROLE_GET_SUCCESS'
export const ROLE_GET_FAILURE = 'ROLE_GET_FAILURE'

// Fetches get role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.id}`
	return {
		[FETCH_API]: {
      types: [ROLE_GET_REQUEST, ROLE_GET_SUCCESS, ROLE_GET_FAILURE],
      endpoint,
      schema: {},
    },
    id: body.id,
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
function fetchUpdateRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role`
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
function fetchDeleteRole(body,query,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.id}`
	if (query) {
    endpoint += `?${toQuerystring(query)}`
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
export function DeleteRole(body,query, callback) {
	return (dispatch) => {
		return dispatch(fetchDeleteRole(body, query, callback))
	}
}

export const ROLE_ADDPERMISSION_REQUEST = 'ROLE_ADDPERMISSION_REQUEST'
export const ROLE_ADDPERMISSION_SUCCESS = 'ROLE_ADDPERMISSION_SUCCESS'
export const ROLE_ADDPERMISSION_FAILURE = 'ROLE_ADDPERMISSION_FAILURE'

// Fetches add permission role from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddPermissionRole(body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${body.id}/addPermission`
  let data = body.body
	return {
		[FETCH_API]: {
      types: [ROLE_ADDPERMISSION_REQUEST, ROLE_ADDPERMISSION_SUCCESS, ROLE_ADDPERMISSION_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        data
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
        method: 'PUT',
        body: body.body
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

export const ROLE_GETWITHMEMEBERS_REQUEST = 'ROLE_GETWITHMEMEBERS_REQUEST'
export const ROLE_GETWITHMEMEBERS_SUCCESS = 'ROLE_GETWITHMEMEBERS_SUCCESS'
export const ROLE_GETWITHMEMEBERS_FAILURE = 'ROLE_GETWITHMEMEBERS_FAILURE'

// Fetches get role with members from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetWithMembers(body,callback) {
  let endpoint = `${API_URL_PREFIX}/role/${body.id}/withMember`
  return {
    [FETCH_API]: {
      types: [ROLE_GETWITHMEMEBERS_REQUEST, ROLE_GETWITHMEMEBERS_SUCCESS, ROLE_GETWITHMEMEBERS_FAILURE],
      endpoint,
      schema: {},
    },
    callback
  }
}

// Fetches get role with members from API
// Relies on Redux Thunk middleware.
export function GetWithMembers(body,callback){
  return(dispatch) => {
    return dispatch(fetchGetWithMembers(body,callback))
  }
}
