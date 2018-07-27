/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Quota
 *
 * v0.1 - 2017-09-25
 * @author Zhaoyb
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const FETCH_GLOBALE_QUOTA_REQUEST = 'FETCH_GLOBALE_QUOTA_REQUEST'
export const FETCH_GLOBALE_QUOTA_SUCCESS = 'FETCH_GLOBALE_QUOTA_SUCCESS'
export const FETCH_GLOBALE_QUOTA_FAILURE = 'FETCH_GLOBALE_QUOTA_FAILURE'

// Fetches get quota from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGlobaleQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/resourcequota`
  let headers
  if (query.header !== undefined) {
    if (query.header.teamspace) {
      let teamspace = query.header.teamspace
      headers = { teamspace }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser: '' }
    }
  }
  return {
    [FETCH_API]: {
      types: [FETCH_GLOBALE_QUOTA_REQUEST, FETCH_GLOBALE_QUOTA_SUCCESS, FETCH_GLOBALE_QUOTA_FAILURE],
      endpoint,
      options: {
        headers,
        method: 'GET',
      },
      schema: {},
    },
    callback
  }
}

// Fetches get quota from API
// Relies on Redux Thunk middleware.
export function getGlobaleQuota(query, callback) {
  return (dispatch) => {
    return dispatch(fetchGlobaleQuota(query, callback))
  }
}

// 这里请求的是api_server中的全局资源使用量
export const FETCH_GLOBALE_GET_QUOTA_REQUEST = 'FETCH_GLOBALE_GET_QUOTA_REQUEST'
export const FETCH_GLOBALE_GET_QUOTA_SUCCESS = 'FETCH_GLOBALE_GET_QUOTA_SUCCESS'
export const FETCH_GLOBALE_GET_QUOTA_FAILURE = 'FETCH_GLOBALE_GET_QUOTA_FAILURE'

function fetchGlobaleQuotaList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/resourcequota/inuse`
  let headers
  if (query.header !== undefined) {
    if (query.header.teamspace) {
      let teamspace = query.header.teamspace
      headers = { teamspace }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser: '' }
    }
  }

  return {
    [FETCH_API]: {
      types: [FETCH_GLOBALE_GET_QUOTA_REQUEST, FETCH_GLOBALE_GET_QUOTA_SUCCESS, FETCH_GLOBALE_GET_QUOTA_FAILURE],
      endpoint,
      options: {
        headers,
        method: 'GET',
      },
      schema: {},
    },
    callback
  }
}

export function getGlobaleQuotaList(query, callback) {
  return (dispatch) => {
    return dispatch(fetchGlobaleQuotaList(query, callback))
  }
}

// 这里请求的是devops中的全局资源使用量
export const FETCH_DEVOPS_GLOBALE_GET_QUOTA_REQUEST = 'FETCH_DEVOPS_GLOBALE_GET_QUOTA_REQUEST'
export const FETCH_DEVOPS_GLOBALE_GET_QUOTA_SUCCESS = 'FETCH_DEVOPS_GLOBALE_GET_QUOTA_SUCCESS'
export const FETCH_DEVOPS_GLOBALE_GET_QUOTA_FAILURE = 'FETCH_DEVOPS_GLOBALE_GET_QUOTA_FAILURE'

function fetchDevopsGlobaleQuotaList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/devops/resourcequota/inuse`
  let newheaders
  if (query.header !== undefined) {
    newheaders = query.header
  }
  return {
    [FETCH_API]: {
      types: [FETCH_DEVOPS_GLOBALE_GET_QUOTA_REQUEST, FETCH_DEVOPS_GLOBALE_GET_QUOTA_SUCCESS, FETCH_DEVOPS_GLOBALE_GET_QUOTA_FAILURE],
      endpoint,
      options: {
        headers: newheaders,
        method: 'GET',
      },
      schema: {},
    },
    callback
  }
}

export function getDevopsGlobaleQuotaList(query, callback) {
  return (dispatch) => {
    return dispatch(fetchDevopsGlobaleQuotaList(query, callback))
  }
}




export const UPDATE_GLOBALE_QUOTA_REQUEST = 'UPDATE_GLOBALE_QUOTA_REQUEST'
export const UPDATE_GLOBALE_QUOTA_SUCCESS = 'UPDATE_GLOBALE_QUOTA_SUCCESS'
export const UPDATE_GLOBALE_QUOTA_FAILURE = 'UPDATE_GLOBALE_QUOTA_FAILURE'

function updateGlobaleQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/resourcequota`
  let body = query.body
  let headers
  if (query.header !== undefined) {
    if (query.header.teamspace) {
      let teamspace = query.header.teamspace
      headers = { teamspace }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser: '' }
    }
  }
  return {
    [FETCH_API]: {
      types: [UPDATE_GLOBALE_QUOTA_REQUEST, UPDATE_GLOBALE_QUOTA_SUCCESS, UPDATE_GLOBALE_QUOTA_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        body,
        headers,
      },
      schema: {},
    },
    callback
  }
}

export function putGlobaleQuota(query, callback) {
  return (dispatch) => {
    return dispatch(updateGlobaleQuota(query, callback))
  }
}

/**
* 获取资源定义
*
* */
export const GET_RESOURCE_DEFINITION_REQUEST = 'GET_RESOURCE_DEFINITION_REQUEST'
export const GET_RESOURCE_DEFINITION_SUCCESS = 'GET_RESOURCE_DEFINITION_SUCCESS'
export const GET_RESOURCE_DEFINITION_FAILURE = 'GET_RESOURCE_DEFINITION_FAILURE'

function fetchResourceDefination(callback) {
  let endpoint = `${API_URL_PREFIX}/resourcequota/definitions`

  return {
    [FETCH_API]: {
      types: [GET_RESOURCE_DEFINITION_REQUEST, GET_RESOURCE_DEFINITION_SUCCESS, GET_RESOURCE_DEFINITION_FAILURE],
      endpoint,
      options: {
        method: 'GET',
      },
      schema: {},
    },
    callback
  }

}

export function getResourceDefinition(callback) {
  return (dispatch) => {
    return dispatch(fetchResourceDefination(callback))
  }
}

export const FETCH_CLUSTER_QUOTA_REQUEST = 'FETCH_CLUSTER_QUOTA_REQUEST'
export const FETCH_CLUSTER_QUOTA_SUCCESS = 'FETCH_CLUSTER_QUOTA_SUCCESS'
export const FETCH_CLUSTER_QUOTA_FAILURE = 'FETCH_CLUSTER_QUOTA_FAILURE'

function fetchClusterQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${query.id}/resourcequota`
  let headers
  if (query.header !== undefined) {
    if (query.header.teamspace) {
      let teamspace = query.header.teamspace
      headers = { teamspace }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser: '' }
    }
  }
  return {
    [FETCH_API]: {
      types: [FETCH_CLUSTER_QUOTA_REQUEST, FETCH_CLUSTER_QUOTA_SUCCESS, FETCH_CLUSTER_QUOTA_FAILURE],
      endpoint,
      options: {
        headers,
        method: 'GET',
      },
      schema: {},
    },
    callback
  }
}

export function getClusterQuota(query, callback) {
  return (dispatch) => {
    return dispatch(fetchClusterQuota(query, callback))
  }
}

export const UPDATE_CLUSTER_QUOTA_REQUEST = 'UPDATE_CLUSTER_QUOTA_REQUEST'
export const UPDATE_CLUSTER_QUOTA_SUCCESS = 'UPDATE_CLUSTER_QUOTA_SUCCESS'
export const UPDATE_CLUSTER_QUOTA_FAILURE = 'UPDATE_CLUSTER_QUOTA_FAILURE'

function updateClusterQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${query.id}/resourcequota`
  let body = query.body
  let headers
  if (query.header !== undefined) {
    if (query.header.teamspace) {
      let teamspace = query.header.teamspace
      headers = { teamspace }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser: '' }
    }
  }
  return {
    [FETCH_API]: {
      types: [UPDATE_CLUSTER_QUOTA_REQUEST, UPDATE_CLUSTER_QUOTA_SUCCESS, UPDATE_CLUSTER_QUOTA_FAILURE],
      endpoint,
      options: {
        headers,
        method: 'PUT',
        body
      },
      schema: {},
    },
    callback
  }
}

export function putClusterQuota(query, callback) {
  return (dispatch) => {
    return dispatch(updateClusterQuota(query, callback))
  }
}

export const FETCH_CLUSTER_GET_REQUEST = 'FETCH_CLUSTER_GET_REQUEST'
export const FETCH_CLUSTER_GET_SUCCESS = 'FETCH_CLUSTER_GET_SUCCESS'
export const FETCH_CLUSTER_GET_FAILURE = 'FETCH_CLUSTER_GET_FAILURE'

function fetchClusterQuotaList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${query.id}/resourcequota/inuse`
  let headers
  if (query.header !== undefined) {
    if (query.header.teamspace) {
      let teamspace = query.header.teamspace
      headers = { teamspace }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser: '' }
    }
  }
  return {
    [FETCH_API]: {
      types: [FETCH_CLUSTER_GET_REQUEST, FETCH_CLUSTER_GET_SUCCESS, FETCH_CLUSTER_GET_FAILURE],
      endpoint,
      options: {
        headers,
        method: 'GET'
      },
      schema: {},
    },
    callback
  }
}

export function getClusterQuotaList(query, callback) {
  return (dispatch) => {
    return dispatch(fetchClusterQuotaList(query, callback))
  }
}
