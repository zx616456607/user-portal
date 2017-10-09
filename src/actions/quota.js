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
  if (query.header) {
    if (query.header.project) {
      let project = query.header.project
      headers = { project }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser }
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

export const FETCH_GLOBALE_GET_QUOTA_REQUEST = 'FETCH_GLOBALE_GET_QUOTA_REQUEST'
export const FETCH_GLOBALE_GET_QUOTA_SUCCESS = 'FETCH_GLOBALE_GET_QUOTA_SUCCESS'
export const FETCH_GLOBALE_GET_QUOTA_FAILURE = 'FETCH_GLOBALE_GET_QUOTA_FAILURE'

function fetchGlobaleQuotaList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/resourcequota/inuse`
  let headers
  if (query.header) {
    if (query.header.project) {
      let project = query.header.project
      headers = { project }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser }
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

export const UPDATE_GLOBALE_QUOTA_REQUEST = 'UPDATE_GLOBALE_QUOTA_REQUEST'
export const UPDATE_GLOBALE_QUOTA_SUCCESS = 'UPDATE_GLOBALE_QUOTA_SUCCESS'
export const UPDATE_GLOBALE_QUOTA_FAILURE = 'UPDATE_GLOBALE_QUOTA_FAILURE'

function updateGlobaleQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/resourcequota`
  let body = query.body
  let headers
  if (query.header) {
    if (query.header.project) {
      let project = query.header.project
      headers = { project }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser }
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

export const FETCH_CLUSTER_QUOTA_REQUEST = 'FETCH_CLUSTER_QUOTA_REQUEST'
export const FETCH_CLUSTER_QUOTA_SUCCESS = 'FETCH_CLUSTER_QUOTA_SUCCESS'
export const FETCH_CLUSTER_QUOTA_FAILURE = 'FETCH_CLUSTER_QUOTA_FAILURE'

function fetchClusterQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${query.id}/resourcequota`
  let headers
  if (query.header) {
    if (query.header.project) {
      let project = query.header.project
      headers = { project }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser }
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
  if (query.header) {
    if (query.header.project) {
      let project = query.header.project
      headers = { project }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser }
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
  if (query.header) {
    if (query.header.project) {
      let project = query.header.project
      headers = { project }
    } else {
      let onbehalfuser = query.header.onbehalfuser
      headers = { onbehalfuser }
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
