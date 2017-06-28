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

export const ROLE_LIST_REQUEST = 'ROLE_LIST_REQUEST'
export const ROLE_LIST_SUCCESS = 'ROLE_LIST_SUCCESS'
export const ROLE_LIST_FAILURE = 'ROLE_LIST_FAILURE'
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

export const ROLE_GET_REQUEST = 'ROLE_GET_REQUEST'
export const ROLE_GET_SUCCESS = 'ROLE_GET_SUCCESS'
export const ROLE_GET_FAILURE = 'ROLE_GET_FAILURE'
function fetchGetRole(id,callback){
	let endpoint = `${API_URL_PREFIX}/role/${id}`
	return {
		[FETCH_API]: {
      types: [ROLE_GET_REQUEST, ROLE_GET_SUCCESS, ROLE_GET_FAILURE],
      endpoint,
      schema: {},
    },
    callback
	}
}

export const ROLE_UPDATE_REQUEST = 'ROLE_UPDATE_REQUEST'
export const ROLE_UPDATE_SUCCESS = 'ROLE_UPDATE_SUCCESS'
export const ROLE_UPDATE_FAILURE = 'ROLE_UPDATE_FAILURE'
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

export const ROLE_DELETE_REQUEST = 'ROLE_DELETE_REQUEST'
export const ROLE_DELETE_SUCCESS = 'ROLE_DELETE_SUCCESS'
export const ROLE_DELETE_FAILURE = 'ROLE_DELETE_FAILURE'
function fetchDeleteRole(id,query,callback){
	let endpoint = `${API_URL_PREFIX}/role/%{id}`
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

export const ROLE_ADDPERMISSION_REQUEST = 'ROLE_ADDPERMISSION_REQUEST'
export const ROLE_ADDPERMISSION_SUCCESS = 'ROLE_ADDPERMISSION_SUCCESS'
export const ROLE_ADDPERMISSION_FAILURE = 'ROLE_ADDPERMISSION_FAILURE'
function fetchAddPermissionRole(id,body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${id}/addPermission`
	return {
		[FETCH_API]: {
      types: [ROLE_ADDPERMISSION_REQUEST, ROLE_ADDPERMISSION_SUCCESS, ROLE_ADDPERMISSION_FAILURE],
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

export const ROLE_REMOVEPERMISSION_REQUEST = 'ROLE_REMOVEPERMISSION_REQUEST'
export const ROLE_REMOVEPERMISSION_SUCCESS = 'ROLE_REMOVEPERMISSION_SUCCESS'
export const ROLE_REMOVEPERMISSION_FAILURE = 'ROLE_REMOVEPERMISSION_FAILURE'
function fetchRemovePermissionRole(id,body,callback){
	let endpoint = `${API_URL_PREFIX}/role/${id}/removePermission`
	return {
		[FETCH_API]: {
      types: [ROLE_REMOVEPERMISSION_REQUEST, ROLE_REMOVEPERMISSION_SUCCESS, ROLE_REMOVEPERMISSION_FAILURE],
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

export const ROLE_EXISTENCE_REQUEST = 'ROLE_EXISTENCE_REQUEST'
export const ROLE_EXISTENCE_SUCCESS = 'ROLE_EXISTENCE_SUCCESS'
export const ROLE_EXISTENCE_FAILURE = 'ROLE_EXISTENCE_FAILURE'
function fetchExistenceRole(name,callback){
	let endpoint = `${API_URL_PREFIX}/role/${name}/existence`
	return {
		[FETCH_API]: {
      types: [ROLE_EXISTENCE_REQUEST, ROLE_EXISTENCE_SUCCESS, ROLE_EXISTENCE_FAILURE],
      endpoint,
      schema: {},
    },
    callback
	}
}

export const ROLE_ALLOWUPDATE_REQUEST = 'ROLE_ALLOWUPDATE_REQUEST'
export const ROLE_ALLOWUPDATE_SUCCESS = 'ROLE_ALLOWUPDATE_SUCCESS'
export const ROLE_ALLOWUPDATE_FAILURE = 'ROLE_ALLOWUPDATE_FAILURE'
function fetchExistenceRole(id,callback){
	let endpoint = `${API_URL_PREFIX}/role/${id}/allowUpdate`
	return {
		[FETCH_API]: {
      types: [ROLE_ALLOWUPDATE_REQUEST, ROLE_ALLOWUPDATE_SUCCESS, ROLE_ALLOWUPDATE_FAILURE],
      endpoint,
      schema: {},
    },
    callback
	}
}
