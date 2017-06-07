/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for harbor manage
 *
 * v0.1 - 2017-06-06
 * @author Zhangpc
 */

import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const HARBOR_PROJECT_LIST_REQUEST = 'HARBOR_PROJECT_LIST_REQUEST'
export const HARBOR_PROJECT_LIST_SUCCESS = 'HARBOR_PROJECT_LIST_SUCCESS'
export const HARBOR_PROJECT_LIST_FAILURE = 'HARBOR_PROJECT_LIST_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectList(registry, query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_PROJECT_LIST_REQUEST, HARBOR_PROJECT_LIST_SUCCESS, HARBOR_PROJECT_LIST_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadProjectList(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectList(registry, query, callback))
  }
}

export const HARBOR_GET_PROJECT_DETAIL_REQUEST = 'HARBOR_GET_PROJECT_DETAIL_REQUEST'
export const HARBOR_GET_PROJECT_DETAIL_SUCCESS = 'HARBOR_GET_PROJECT_DETAIL_SUCCESS'
export const HARBOR_GET_PROJECT_DETAIL_FAILURE = 'HARBOR_GET_PROJECT_DETAIL_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectDetail(registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${id}`
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_GET_PROJECT_DETAIL_REQUEST, HARBOR_GET_PROJECT_DETAIL_SUCCESS, HARBOR_GET_PROJECT_DETAIL_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadProjectDetail(registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectDetail(registry, id, callback))
  }
}

export const HARBOR_GET_PROJECT_REPOS_REQUEST = 'HARBOR_GET_PROJECT_REPOS_REQUEST'
export const HARBOR_GET_PROJECT_REPOS_SUCCESS = 'HARBOR_GET_PROJECT_REPOS_SUCCESS'
export const HARBOR_GET_PROJECT_REPOS_FAILURE = 'HARBOR_GET_PROJECT_REPOS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectRepos(registry, query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/repositories`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_GET_PROJECT_REPOS_REQUEST, HARBOR_GET_PROJECT_REPOS_SUCCESS, HARBOR_GET_PROJECT_REPOS_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadProjectRepos(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectRepos(registry, query, callback))
  }
}

export const HARBOR_PROJECT_LOGS_REQUEST = 'HARBOR_PROJECT_LOGS_REQUEST'
export const HARBOR_PROJECT_LOGS_SUCCESS = 'HARBOR_PROJECT_LOGS_SUCCESS'
export const HARBOR_PROJECT_LOGS_FAILURE = 'HARBOR_PROJECT_LOGS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectLogs(registry, projectID, query, body,callback) {
  let { customizeOpts } = query || {}
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/logs`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_PROJECT_LOGS_REQUEST, HARBOR_PROJECT_LOGS_SUCCESS, HARBOR_PROJECT_LOGS_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadProjectLogs(registry, projectID, query, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectLogs(registry, projectID, query, body, callback))
  }
}