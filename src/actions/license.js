/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for licenses
 *
 * v0.1 - 2017-02-09
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const LICENSE_LIST_REQUEST = 'LICENSE_LIST_REQUEST'
export const LICENSE_LIST_SUCCESS = 'LICENSE_LIST_SUCCESS'
export const LICENSE_LIST_FAILURE = 'LICENSE_LIST_FAILURE'

// Fetches license list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchLicenseList(callback) {
  let endpoint = `${API_URL_PREFIX}/licenses`
  return {
    [FETCH_API]: {
      types: [LICENSE_LIST_REQUEST, LICENSE_LIST_SUCCESS, LICENSE_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches license list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadLicenseList(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchLicenseList(callback))
  }
}

export const LICENSE_MERGED_REQUEST = 'LICENSE_MERGED_REQUEST'
export const LICENSE_MERGED_SUCCESS = 'LICENSE_MERGED_SUCCESS'
export const LICENSE_MERGED_FAILURE = 'LICENSE_MERGED_FAILURE'

// Fetches merged license from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchMergedLicense() {
  return {
    [FETCH_API]: {
      types: [LICENSE_MERGED_REQUEST, LICENSE_MERGED_SUCCESS, LICENSE_MERGED_FAILURE],
      endpoint: `${API_URL_PREFIX}/licenses/merged`,
      schema: {}
    }
  }
}

// Fetches merged license from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadMergedLicense() {
  return (dispatch, getState) => {
    return dispatch(fetchMergedLicense())
  }
}

export const LICENSE_ADD_REQUEST = 'LICENSE_ADD_REQUEST'
export const LICENSE_ADD_SUCCESS = 'LICENSE_ADD_SUCCESS'
export const LICENSE_ADD_FAILURE = 'LICENSE_ADD_FAILURE'

// Add license from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddLicense(body, callback) {
  let endpoint = `${API_URL_PREFIX}/licenses`
  return {
    [FETCH_API]: {
      types: [LICENSE_ADD_REQUEST, LICENSE_ADD_SUCCESS, LICENSE_ADD_FAILURE],
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

// Add license from API
// Relies on Redux Thunk middleware.
export function addLicense(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddLicense(body, callback))
  }
}

export const LICENSE_PLATFORM_REQUEST = 'LICENSE_PLATFORM_REQUEST'
export const LICENSE_PLATFORM_SUCCESS = 'LICENSE_PLATFORM_SUCCESS'
export const LICENSE_PLATFORM_FAILURE = 'LICENSE_PLATFORM_FAILURE'

// Fetches license platform from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchLicensePlatform() {
  return {
    [FETCH_API]: {
      types: [LICENSE_PLATFORM_REQUEST, LICENSE_PLATFORM_SUCCESS, LICENSE_PLATFORM_FAILURE],
      endpoint: `${API_URL_PREFIX}/licenses/platform`,
      schema: {}
    }
  }
}

// Fetches license platform from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadLicensePlatform() {
  return (dispatch, getState) => {
    return dispatch(fetchLicensePlatform())
  }
}

export const LICENSE_ADMINPASS_REQUEST = 'LICENSE_ADMINPASS_REQUEST'
export const LICENSE_ADMINPASS_SUCCESS = 'LICENSE_ADMINPASS_SUCCESS'
export const LICENSE_ADMINPASS_FAILURE = 'LICENSE_ADMINPASS_FAILURE'

// Check whether the 'admin' user's password is set from API
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchIsAdminPasswordSet() {
  return {
    [FETCH_API]: {
      types: [LICENSE_ADMINPASS_REQUEST, LICENSE_ADMINPASS_SUCCESS, LICENSE_ADMINPASS_FAILURE],
      endpoint: `${API_URL_PREFIX}/licenses/adminpass`,
      schema: {}
    }
  }
}

// Check whether the 'admin' user's password is set from API unless it is cached.
// Relies on Redux Thunk middleware.
export function isAdminPasswordSet() {
  return (dispatch, getState) => {
    return dispatch(fetchIsAdminPasswordSet())
  }
}

export const LICENSE_ADMINPASS_SET_REQUEST = 'LICENSE_ADMINPASS_SET_REQUEST'
export const LICENSE_ADMINPASS_SET_SUCCESS = 'LICENSE_ADMINPASS_SET_SUCCESS'
export const LICENSE_ADMINPASS_SET_FAILURE = 'LICENSE_ADMINPASS_SET_FAILURE'

// Set 'admin' user password from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSetAdminPassword(body, callback) {
  let endpoint = `${API_URL_PREFIX}/licenses/adminpass`
  return {
    [FETCH_API]: {
      types: [LICENSE_ADMINPASS_SET_REQUEST, LICENSE_ADMINPASS_SET_SUCCESS, LICENSE_ADMINPASS_SET_FAILURE],
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

// Set 'admin' user password from API
// Relies on Redux Thunk middleware.
export function setAdminPassword(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSetAdminPassword(body, callback))
  }
}