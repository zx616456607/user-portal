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

export const PERMISSION_LIST_REQUEST = 'PERMISSION_LIST_REQUEST'
export const PERMISSION_LIST_SUCCESS = 'PERMISSION_LIST_SUCCESS'
export const PERMISSION_LIST_FAILURE = 'PERMISSION_LIST_FAILURE'

// Fetches list permission from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPermission(callback) {
  return {
    [FETCH_API]: {
      types: [PERMISSION_LIST_REQUEST, PERMISSION_LIST_SUCCESS, PERMISSION_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/permission`,
      schema: {}
    },
    callback
  }
}

// Fetches list permission  from API
// Relies on Redux Thunk middleware.
export function Permission(body, callback) {
	return (dispatch) => {
		return dispatch(fetchPermission(callback))
	}
}

// Fetches list permission and count from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPermissionAndCount(body,callback) {
	return {
    [FETCH_API]: {
      types: [PERMISSION_LIST_REQUEST, PERMISSION_LIST_SUCCESS, PERMISSION_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/permission/withCount`,
      schema: {}
    },
    callback
  }
}

// Fetches list permission from and count API
// Relies on Redux Thunk middleware.
export function PermissionAndCount(body, callback) {
	return (dispatch) => {
		return dispatch(fetchPermissionAndCount(body, callback))
	}
}

export const PERMISSION_RETRIEVE_REQUEST = 'PERMISSION_RETRIEVE_REQUEST'
export const PERMISSION_RETRIEVE_SUCCESS = 'PERMISSION_RETRIEVE_SUCCESS'
export const PERMISSION_RETRIEVE_FAILURE = 'PERMISSION_RETRIEVE_FAILURE'

// Fetches retrieve permission from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRetrievePermission(body,callback){
	let endpoint = `${API_URL_PREFIX}/permission/${body.id}/retrieve`
	return {
    [FETCH_API]: {
      types: [PERMISSION_RETRIEVE_REQUEST, PERMISSION_RETRIEVE_SUCCESS, PERMISSION_RETRIEVE_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches retrieve permission from API
// Relies on Redux Thunk middleware.
export function RetrievePermission(body, callback) {
	return (dispatch) => {
		return dispatch(fetchRetrievePermission(body, callback))
	}
}

// Fetches retrieve permission and count from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRetrievePermissionAndCount(body,callback){
	let endpoint = `${API_URL_PREFIX}/permission/${body.id}/retrieve/withCount`
	return {
    [FETCH_API]: {
      types: [PERMISSION_RETRIEVE_REQUEST, PERMISSION_RETRIEVE_SUCCESS, PERMISSION_RETRIEVE_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches retrieve permission and count from API
// Relies on Redux Thunk middleware.
export function RetrievePermissionAndCount(body, callback) {
	return (dispatch) => {
		return dispatch(fetchRetrievePermissionAndCount(body, callback))
	}
}

export const PERMISSION_DEPENDENT_REQUEST = 'PERMISSION_DEPENDENT_REQUEST'
export const PERMISSION_DEPENDENT_SUCCESS = 'PERMISSION_DEPENDENT_SUCCESS'
export const PERMISSION_DEPENDENT_FAILURE = 'PERMISSION_DEPENDENT_FAILURE'

// Fetches dependent from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDependent(body,callback) {
	let endpoint = `${API_URL_PREFIX}/permission/${body.id}/dependent`
	return {
    [FETCH_API]: {
      types: [PERMISSION_DEPENDENT_REQUEST, PERMISSION_DEPENDENT_SUCCESS, PERMISSION_DEPENDENT_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches dependent from API
// Relies on Redux Thunk middleware.
export function AllowUpdateRole(body, callback) {
	return (dispatch) => {
		return dispatch(fetchDependent(body, callback))
	}
}