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

export const PERMISSION_RESOURCE_LIST_REQUEST = 'PERMISSION_RESOURCE_LIST_REQUEST'
export const PERMISSION_RESOURCE_LIST_SUCCESS = 'PERMISSION_RESOURCE_LIST_SUCCESS'
export const PERMISSION_RESOURCE_LIST_FAILURE = 'PERMISSION_RESOURCE_LIST_FAILURE'

function fetchPermissionResource(callback) {
  return {
    [FETCH_API]: {
      types: [PERMISSION_RESOURCE_LIST_REQUEST, PERMISSION_RESOURCE_LIST_SUCCESS, PERMISSION_RESOURCE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/permission/resource-operations`,
      schema: {}
    },
    callback
  }
}

export function PermissionResource(callback) {
	return (dispatch) => {
		return dispatch(fetchPermissionResource(callback))
	}
}

export const DELETE_PERMISSION_CONTROL_REQUEST = 'DELETE_PERMISSION_CONTROL_REQUEST'
export const DELETE_PERMISSION_CONTROL_SUCCESS = 'DELETE_PERMISSION_CONTROL_SUCCESS'
export const DELETE_PERMISSION_CONTROL_FAILURE = 'DELETE_PERMISSION_CONTROL_FAILURE'

function fetchDeletePermissionControl(ruleIds, callback) {
  return {
    [FETCH_API]: {
      types: [
        DELETE_PERMISSION_CONTROL_REQUEST,
        DELETE_PERMISSION_CONTROL_SUCCESS,
        DELETE_PERMISSION_CONTROL_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/permission/access-controls/${ruleIds}`,
      schema: {},
      options: {
        method: "DELETE"
      },
    },
    callback
  }
}

export function deletePermissionControl(ruleIds, callback) {
  return dispatch => {
    return dispatch(fetchDeletePermissionControl(ruleIds, callback))
  }
}

export const PERMISSION_OVERVIEW_REQUEST = 'PERMISSION_OVERVIEW_REQUEST'
export const PERMISSION_OVERVIEW_SUCCESS = 'PERMISSION_OVERVIEW_SUCCESS'
export const PERMISSION_OVERVIEW_FAILURE = 'PERMISSION_OVERVIEW_FAILURE'

const fetchPermissionOverview = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        PERMISSION_OVERVIEW_REQUEST,
        PERMISSION_OVERVIEW_SUCCESS,
        PERMISSION_OVERVIEW_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/permission/access-controls/overview?${toQuerystring(query)}`,
      schema: {},
    },
    callback
  }
}

export const permissionOverview = (query, callback) =>
  dispatch => dispatch(fetchPermissionOverview(query, callback))