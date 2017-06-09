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

export const HARBOR_GET_PROJECT_MEMBERS_REQUEST = 'HARBOR_GET_PROJECT_MEMBERS_REQUEST'
export const HARBOR_GET_PROJECT_MEMBERS_SUCCESS = 'HARBOR_GET_PROJECT_MEMBERS_SUCCESS'
export const HARBOR_GET_PROJECT_MEMBERS_FAILURE = 'HARBOR_GET_PROJECT_MEMBERS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectMembers(registry, projectID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/members`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_GET_PROJECT_MEMBERS_REQUEST, HARBOR_GET_PROJECT_MEMBERS_SUCCESS, HARBOR_GET_PROJECT_MEMBERS_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadProjectMembers(registry, projectID, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectMembers(registry, projectID, query, callback))
  }
}

export const HARBOR_ADD_PROJECT_MEMBER_REQUEST = 'HARBOR_ADD_PROJECT_MEMBER_REQUEST'
export const HARBOR_ADD_PROJECT_MEMBER_SUCCESS = 'HARBOR_ADD_PROJECT_MEMBER_SUCCESS'
export const HARBOR_ADD_PROJECT_MEMBER_FAILURE = 'HARBOR_ADD_PROJECT_MEMBER_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddProjectMember(registry, projectID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/members`
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_ADD_PROJECT_MEMBER_REQUEST, HARBOR_ADD_PROJECT_MEMBER_SUCCESS, HARBOR_ADD_PROJECT_MEMBER_FAILURE ],
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
export function addProjectMember(registry, projectID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddProjectMember(registry, projectID, body, callback))
  }
}

export const HARBOR_DELETE_PROJECT_MEMBER_REQUEST = 'HARBOR_DELETE_PROJECT_MEMBER_REQUEST'
export const HARBOR_DELETE_PROJECT_MEMBER_SUCCESS = 'HARBOR_DELETE_PROJECT_MEMBER_SUCCESS'
export const HARBOR_DELETE_PROJECT_MEMBER_FAILURE = 'HARBOR_DELETE_PROJECT_MEMBER_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProjectMember(registry, projectID, userId, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/members/${userId}`
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_DELETE_PROJECT_MEMBER_REQUEST, HARBOR_DELETE_PROJECT_MEMBER_SUCCESS, HARBOR_DELETE_PROJECT_MEMBER_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function deleteProjectMember(registry, projectID, userId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteProjectMember(registry, projectID, userId, callback))
  }
}

export const HARBOR_UPDATE_PROJECT_MEMBER_REQUEST = 'HARBOR_UPDATE_PROJECT_MEMBER_REQUEST'
export const HARBOR_UPDATE_PROJECT_MEMBER_SUCCESS = 'HARBOR_UPDATE_PROJECT_MEMBER_SUCCESS'
export const HARBOR_UPDATE_PROJECT_MEMBER_FAILURE = 'HARBOR_UPDATE_PROJECT_MEMBER_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectMember(registry, projectID, userId, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/members/${userId}`
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_UPDATE_PROJECT_MEMBER_REQUEST, HARBOR_UPDATE_PROJECT_MEMBER_SUCCESS, HARBOR_UPDATE_PROJECT_MEMBER_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function updateProjectMember(registry, projectID, userId, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProjectMember(registry, projectID, userId, body, callback))
  }
}

export const HARBOR_PROJECT_LOGS_REQUEST = 'HARBOR_PROJECT_LOGS_REQUEST'
export const HARBOR_PROJECT_LOGS_SUCCESS = 'HARBOR_PROJECT_LOGS_SUCCESS'
export const HARBOR_PROJECT_LOGS_FAILURE = 'HARBOR_PROJECT_LOGS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectLogs(registry, projectID, query, body,callback) {
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

export const HARBOR_ALL_PROJECT_REQUEST = 'HARBOR_ALL_PROJECT_REQUEST'
export const HARBOR_ALL_PROJECT_SUCCESS = 'HARBOR_ALL_PROJECT_SUCCESS'
export const HARBOR_ALL_PROJECT_FAILURE = 'HARBOR_ALL_PROJECT_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAllProject(registry, query, callback) {
  let { customizeOpts } = query || {}
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/search`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    registry,
    callback,
    [FETCH_API]: {
      types: [ HARBOR_ALL_PROJECT_REQUEST, HARBOR_ALL_PROJECT_SUCCESS, HARBOR_ALL_PROJECT_FAILURE ],
      endpoint,
      schema: {}
    }
  }
}


// Relies on Redux Thunk middleware.
export function loadAllProject(registry, query,callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAllProject(registry, query, callback))
  }
}

export const CREATE_HARBOR_PROJECT_REQUEST = 'CREATE_HARBOR_PROJECT_REQUEST'
export const CREATE_HARBOR_PROJECT_SUCCESS = 'CREATE_HARBOR_PROJECT_SUCCESS'
export const CREATE_HARBOR_PROJECT_FAILURE = 'CREATE_HARBOR_PROJECT_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateProject(registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects`
  return {
    registry,
    [FETCH_API]: {
      types: [ CREATE_HARBOR_PROJECT_REQUEST, CREATE_HARBOR_PROJECT_SUCCESS, CREATE_HARBOR_PROJECT_FAILURE ],
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
export function createProject(registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateProject(registry, body, callback))
  }
}

export const HARBOR_REPOSITORIES_TAGS_REQUEST = 'HARBOR_REPOSITORIES_TAGS_REQUEST'
export const HARBOR_REPOSITORIES_TAGS_SUCCESS = 'HARBOR_REPOSITORIES_TAGS_SUCCESS'
export const HARBOR_REPOSITORIES_TAGS_FAILURE = 'HARBOR_REPOSITORIES_TAGS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRepositoriesTags(registry, imageName, callback) {
  return {
    registry,
    imageName,
    callback,
    [FETCH_API]: {
      types: [ HARBOR_REPOSITORIES_TAGS_REQUEST, HARBOR_REPOSITORIES_TAGS_SUCCESS, HARBOR_REPOSITORIES_TAGS_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/repositories/${imageName}/tags`,
      schema: {}
    }
  }
}

// Relies on Redux Thunk middleware.
export function loadRepositoriesTags(registry, imageName,callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRepositoriesTags(registry, imageName, callback))
  }
}

export const DELETE_HARBOR_PROJECT_REQUEST = 'DELETE_HARBOR_PROJECT_REQUEST'
export const DELETE_HARBOR_PROJECT_SUCCESS = 'DELETE_HARBOR_PROJECT_SUCCESS'
export const DELETE_HARBOR_PROJECT_FAILURE = 'DELETE_HARBOR_PROJECT_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProject(registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${id}`
  return {
    registry,
    [FETCH_API]: {
      types: [ DELETE_HARBOR_PROJECT_REQUEST, DELETE_HARBOR_PROJECT_SUCCESS, DELETE_HARBOR_PROJECT_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function deleteProject(registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteProject(registry, id, callback))
  }
}

export const HARBOR_REPOSITORIES_TAG_CONFIGINFO_REQUEST = 'HARBOR_REPOSITORIES_TAG_CONFIGINFO_REQUEST'
export const HARBOR_REPOSITORIES_TAG_CONFIGINFO_SUCCESS = 'HARBOR_REPOSITORIES_TAG_CONFIGINFO_SUCCESS'
export const HARBOR_REPOSITORIES_TAG_CONFIGINFO_FAILURE = 'HARBOR_REPOSITORIES_TAG_CONFIGINFO_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRepositoriesTagConfigInfo(registry, imageName, tag, callback) {
  return {
    registry,
    imageName,
    tag,
    callback,
    [FETCH_API]: {
      types: [ HARBOR_REPOSITORIES_TAG_CONFIGINFO_REQUEST, HARBOR_REPOSITORIES_TAG_CONFIGINFO_SUCCESS, HARBOR_REPOSITORIES_TAG_CONFIGINFO_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/repositories/${imageName}/tags/${tag}/configinfo`,
      schema: {}
    }
  }
}

// Relies on Redux Thunk middleware.
export function loadRepositoriesTagConfigInfo(registry, imageName, tag, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRepositoriesTagConfigInfo(registry, imageName, tag, callback))
  }
}

export const UPDATE_HARBOR_PROJECT_REQUEST = 'UPDATE_HARBOR_PROJECT_REQUEST'
export const UPDATE_HARBOR_PROJECT_SUCCESS = 'UPDATE_HARBOR_PROJECT_SUCCESS'
export const UPDATE_HARBOR_PROJECT_FAILURE = 'UPDATE_HARBOR_PROJECT_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProject(registry, id, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${id}/publicity`
  return {
    registry,
    [FETCH_API]: {
      types: [ UPDATE_HARBOR_PROJECT_REQUEST, UPDATE_HARBOR_PROJECT_SUCCESS, UPDATE_HARBOR_PROJECT_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function updateProject(registry, id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProject(registry, id, body, callback))
  }
}


export const GET_CONFIGURATIONS_REQUEST = 'GET_CONFIGURATIONS_REQUEST'
export const GET_CONFIGURATIONS_SUCCESS = 'GET_CONFIGURATIONS_SUCCESS'
export const GET_CONFIGURATIONS_FAILURE = 'GET_CONFIGURATIONS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetConfigurations(registry, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/configurations`
  return {
    registry,
    [FETCH_API]: {
      types: [ GET_CONFIGURATIONS_REQUEST, GET_CONFIGURATIONS_SUCCESS, GET_CONFIGURATIONS_FAILURE ],
      endpoint,
      schema: {},
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function getConfigurations(registry, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetConfigurations(registry, callback))
  }
}

export const UPDATE_CONFIGURATIONS_REQUEST = 'UPDATE_CONFIGURATIONS_REQUEST'
export const UPDATE_CONFIGURATIONS_SUCCESS = 'UPDATE_CONFIGURATIONS_SUCCESS'
export const UPDATE_CONFIGURATIONS_FAILURE = 'UPDATE_CONFIGURATIONS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateConfigurations(registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/configurations`
  return {
    registry,
    [FETCH_API]: {
      types: [ UPDATE_CONFIGURATIONS_REQUEST, UPDATE_CONFIGURATIONS_SUCCESS, UPDATE_CONFIGURATIONS_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function updateConfigurations(registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateConfigurations(registry, body, callback))
  }
}