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

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring, encodeImageFullname } from '../common/tools'

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

export const HARBOR_SYSTEMINFO_REQUEST = 'HARBOR_SYSTEMINFO_REQUEST'
export const HARBOR_SYSTEMINFO_SUCCESS = 'HARBOR_SYSTEMINFO_SUCCESS'
export const HARBOR_SYSTEMINFO_FAILURE = 'HARBOR_SYSTEMINFO_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSysteminfo(registry, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/systeminfo`
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_SYSTEMINFO_REQUEST, HARBOR_SYSTEMINFO_SUCCESS, HARBOR_SYSTEMINFO_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadSysteminfo(registry, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSysteminfo(registry, callback))
  }
}

export const HARBOR_GET_PROJECT_DETAIL_REQUEST = 'HARBOR_GET_PROJECT_DETAIL_REQUEST'
export const HARBOR_GET_PROJECT_DETAIL_SUCCESS = 'HARBOR_GET_PROJECT_DETAIL_SUCCESS'
export const HARBOR_GET_PROJECT_DETAIL_FAILURE = 'HARBOR_GET_PROJECT_DETAIL_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectDetail(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${id}?harbor=${harbor}`
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
export function loadProjectDetail(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectDetail(harbor, registry, id, callback))
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

export const HARBOR_GET_PROJECT_MAXTAGS_REQUEST = 'HARBOR_GET_PROJECT_MAXTAGS_REQUEST'
export const HARBOR_GET_PROJECT_MAXTAGS_SUCCESS = 'HARBOR_GET_PROJECT_MAXTAGS_SUCCESS'
export const HARBOR_GET_PROJECT_MAXTAGS_FAILURE = 'HARBOR_GET_PROJECT_MAXTAGS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectMaxTagCount(registry, query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/repositories`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_GET_PROJECT_MAXTAGS_REQUEST, HARBOR_GET_PROJECT_MAXTAGS_SUCCESS, HARBOR_GET_PROJECT_MAXTAGS_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadProjectMaxTagCount(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectMaxTagCount(registry, query, callback))
  }
}

export const HARBOR_SET_PROJECT_MAXTAGS_REQUEST = 'HARBOR_SET_PROJECT_MAXTAGS_REQUEST'
export const HARBOR_SET_PROJECT_MAXTAGS_SUCCESS = 'HARBOR_SET_PROJECT_MAXTAGS_SUCCESS'
export const HARBOR_SET_PROJECT_MAXTAGS_FAILURE = 'HARBOR_SET_PROJECT_MAXTAGS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectMaxTagCount(query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${query.registry}/repositories/${query.name}/maxtag`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  const body = {
    max_tags_count: query.max_tags_count
  }
  return {
    registry: query.registry,
    [FETCH_API]: {
      types: [ HARBOR_SET_PROJECT_MAXTAGS_REQUEST, HARBOR_SET_PROJECT_MAXTAGS_SUCCESS, HARBOR_SET_PROJECT_MAXTAGS_FAILURE ],
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
export function updateProjectMaxTagCount(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProjectMaxTagCount(query, callback))
  }
}

export const HARBOR_SET_PROJECT_TAGLABEL_REQUEST = 'HARBOR_SET_PROJECT_TAGLABEL_REQUEST'
export const HARBOR_SET_PROJECT_TAGLABEL_SUCCESS = 'HARBOR_SET_PROJECT_TAGLABEL_SUCCESS'
export const HARBOR_SET_PROJECT_TAGLABEL_FAILURE = 'HARBOR_SET_PROJECT_TAGLABEL_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSetRepositoriesTagLabel(query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${query.registry}/repositories/${query.name}/tags/${query.tagName}/labels`
  if (query) {
    endpoint += `?${toQuerystring({ harbor: query.harbor })}`
  }
  const body = {
    id: query.id,
  }
  return {
    registry: query.registry,
    [FETCH_API]: {
      types: [ HARBOR_SET_PROJECT_TAGLABEL_REQUEST, HARBOR_SET_PROJECT_TAGLABEL_SUCCESS, HARBOR_SET_PROJECT_TAGLABEL_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function setRepositoriesTagLabel(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSetRepositoriesTagLabel(query, callback))
  }
}

export const HARBOR_DEL_PROJECT_TAGLABEL_REQUEST = 'HARBOR_DEL_PROJECT_TAGLABEL_REQUEST'
export const HARBOR_DEL_PROJECT_TAGLABEL_SUCCESS = 'HARBOR_DEL_PROJECT_TAGLABEL_SUCCESS'
export const HARBOR_DEL_PROJECT_TAGLABEL_FAILURE = 'HARBOR_DEL_PROJECT_TAGLABEL_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDelRepositoriesTagLabel(query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${query.registry}/repositories/${query.name}/tags/${query.tagName}/labels/${query.id}`
  if (query) {
    endpoint += `?${toQuerystring({ harbor: query.harbor })}`
  }
  return {
    registry: query.registry,
    [FETCH_API]: {
      types: [ HARBOR_DEL_PROJECT_TAGLABEL_REQUEST, HARBOR_DEL_PROJECT_TAGLABEL_SUCCESS, HARBOR_DEL_PROJECT_TAGLABEL_FAILURE ],
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
export function delRepositoriesTagLabel(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDelRepositoriesTagLabel(query, callback))
  }
}

// router.post('/registries/:registry/repositories/:user/:name/tags/labels', harborController.setRepositoriesTagLock)
// router.del('/registries/:registry/repositories/:user/:name/tags/labels/:id', harborController.setRepositoriesTagUnlock)

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
function fetchAddProjectMember(harbor, registry, projectID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/members?harbor=${harbor}`
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
export function addProjectMember(harbor, registry, projectID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddProjectMember(harbor, registry, projectID, body, callback))
  }
}

export const HARBOR_DELETE_PROJECT_MEMBER_REQUEST = 'HARBOR_DELETE_PROJECT_MEMBER_REQUEST'
export const HARBOR_DELETE_PROJECT_MEMBER_SUCCESS = 'HARBOR_DELETE_PROJECT_MEMBER_SUCCESS'
export const HARBOR_DELETE_PROJECT_MEMBER_FAILURE = 'HARBOR_DELETE_PROJECT_MEMBER_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProjectMember(harbor, registry, projectID, userId, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/members/${userId}?harbor=${harbor}`
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
export function deleteProjectMember(harbor, registry, projectID, userId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteProjectMember(harbor, registry, projectID, userId, callback))
  }
}

export const HARBOR_UPDATE_PROJECT_MEMBER_REQUEST = 'HARBOR_UPDATE_PROJECT_MEMBER_REQUEST'
export const HARBOR_UPDATE_PROJECT_MEMBER_SUCCESS = 'HARBOR_UPDATE_PROJECT_MEMBER_SUCCESS'
export const HARBOR_UPDATE_PROJECT_MEMBER_FAILURE = 'HARBOR_UPDATE_PROJECT_MEMBER_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectMember(harbor, registry, projectID, userId, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${projectID}/members/${userId}?harbor=${harbor}`
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
export function updateProjectMember(harbor, registry, projectID, userId, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProjectMember(harbor, registry, projectID, userId, body, callback))
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
        method: 'GET'
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
export function loadAllProject(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAllProject(registry, query, callback))
  }
}

export const CREATE_HARBOR_PROJECT_REQUEST = 'CREATE_HARBOR_PROJECT_REQUEST'
export const CREATE_HARBOR_PROJECT_SUCCESS = 'CREATE_HARBOR_PROJECT_SUCCESS'
export const CREATE_HARBOR_PROJECT_FAILURE = 'CREATE_HARBOR_PROJECT_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateProject(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects?harbor=${harbor}`
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
export function createProject(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateProject(harbor, registry, body, callback))
  }
}

export const HARBOR_REPOSITORIES_TAGS_REQUEST = 'HARBOR_REPOSITORIES_TAGS_REQUEST'
export const HARBOR_REPOSITORIES_TAGS_SUCCESS = 'HARBOR_REPOSITORIES_TAGS_SUCCESS'
export const HARBOR_REPOSITORIES_TAGS_FAILURE = 'HARBOR_REPOSITORIES_TAGS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRepositoriesTags(harbor, registry, imageName, callback, is_detail) {
  return {
    registry: registry,
    imageName: imageName,
    callback,
    [FETCH_API]: {
      types: [ HARBOR_REPOSITORIES_TAGS_REQUEST, HARBOR_REPOSITORIES_TAGS_SUCCESS, HARBOR_REPOSITORIES_TAGS_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/repositories/${encodeImageFullname(imageName)}/tags?harbor=${harbor}&is_detail=${is_detail ? 1 : 0}`,
      schema: {}
    }
  }
}

// Relies on Redux Thunk middleware.
export function loadRepositoriesTags(harbor, registry, imageName, callback, is_detail) {
  return (dispatch, getState) => {
    return dispatch(fetchRepositoriesTags(harbor, registry, imageName, callback, is_detail))
  }
}

export const HARBOR_APP_WRAP_TAGS_REQUEST = 'HARBOR_APP_WRAP_TAGS_REQUEST'
export const HARBOR_APP_WRAP_TAGS_SUCCESS = 'HARBOR_APP_WRAP_TAGS_SUCCESS'
export const HARBOR_APP_WRAP_TAGS_FAILURE = 'HARBOR_APP_WRAP_TAGS_FAILURE'

function fetchLoadWrapTags(body,callback) {
  return {
    [FETCH_API]: {
      types: [HARBOR_APP_WRAP_TAGS_REQUEST,HARBOR_APP_WRAP_TAGS_SUCCESS,HARBOR_APP_WRAP_TAGS_FAILURE],
      endpoint:`${API_URL_PREFIX}/pkg/${body.filename}/${body.filetype}/versions?harbor=${loadWrapTags}`,
      schema: {},
    },
    callback
  }
}

export function loadWrapTags(harbor, body, callback) {
  return (dispatch) => {
    return dispatch(fetchLoadWrapTags(harbor, body, callback))
  }
}

export const HARBOR_DELETE_REPO_REQUEST = 'HARBOR_DELETE_REPO_REQUEST'
export const HARBOR_DELETE_REPO_SUCCESS = 'HARBOR_DELETE_REPO_SUCCESS'
export const HARBOR_DELETE_REPO_FAILURE = 'HARBOR_DELETE_REPO_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteRepo(harbor, registry, repoName, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/repositories/${repoName}/tags?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_DELETE_REPO_REQUEST, HARBOR_DELETE_REPO_SUCCESS, HARBOR_DELETE_REPO_FAILURE ],
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
export function deleteRepo(harbor, registry, repoName, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteRepo(harbor, registry, repoName, callback))
  }
}

export const DELETE_DETAIL_ALONE_REQUEST = 'DELETE_DETAIL_ALONE_REQUEST'
export const DELETE_DETAIL_ALONE_SUCCESS = 'DELETE_DETAIL_ALONE_SUCCESS'
export const DELETE_DETAIL_ALONE_FAILURE = 'DELETE_DETAIL_ALONE_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteAlone(query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${query.registry}/repositories/${query.repoName}/tags/${query.tagName}?harbor=${query.harbor}`
  return {
    [FETCH_API]: {
      types: [ DELETE_DETAIL_ALONE_REQUEST, DELETE_DETAIL_ALONE_SUCCESS, DELETE_DETAIL_ALONE_FAILURE ],
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
export function deleteAlone(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteAlone(query, callback))
  }
}

export const DELETE_HARBOR_PROJECT_REQUEST = 'DELETE_HARBOR_PROJECT_REQUEST'
export const DELETE_HARBOR_PROJECT_SUCCESS = 'DELETE_HARBOR_PROJECT_SUCCESS'
export const DELETE_HARBOR_PROJECT_FAILURE = 'DELETE_HARBOR_PROJECT_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteProject(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${id}?harbor=${harbor}`
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
export function deleteProject(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteProject(harbor, registry, id, callback))
  }
}

export const HARBOR_REPOSITORIES_TAG_CONFIGINFO_REQUEST = 'HARBOR_REPOSITORIES_TAG_CONFIGINFO_REQUEST'
export const HARBOR_REPOSITORIES_TAG_CONFIGINFO_SUCCESS = 'HARBOR_REPOSITORIES_TAG_CONFIGINFO_SUCCESS'
export const HARBOR_REPOSITORIES_TAG_CONFIGINFO_FAILURE = 'HARBOR_REPOSITORIES_TAG_CONFIGINFO_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRepositoriesTagConfigInfo(harbor, registry, imageName, tag, callback) {
  return {
    registry,
    imageName,
    tag,
    callback,
    [FETCH_API]: {
      types: [ HARBOR_REPOSITORIES_TAG_CONFIGINFO_REQUEST, HARBOR_REPOSITORIES_TAG_CONFIGINFO_SUCCESS, HARBOR_REPOSITORIES_TAG_CONFIGINFO_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/repositories/${encodeImageFullname(imageName)}/tags/${tag}/configinfo?harbor=${harbor}`,
      schema: {}
    }
  }
}

// Relies on Redux Thunk middleware.
export function loadRepositoriesTagConfigInfo(harbor, registry, imageName, tag, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRepositoriesTagConfigInfo(harbor, registry, imageName, tag, callback))
  }
}

export const UPDATE_HARBOR_PROJECT_PUBLIC_REQUEST = 'UPDATE_HARBOR_PROJECT_PUBLIC_REQUEST'
export const UPDATE_HARBOR_PROJECT_PUBLIC_SUCCESS = 'UPDATE_HARBOR_PROJECT_PUBLIC_SUCCESS'
export const UPDATE_HARBOR_PROJECT_PUBLIC_FAILURE = 'UPDATE_HARBOR_PROJECT_PUBLIC_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProjectPublicity(harbor, registry, id, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${id}/publicity?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ UPDATE_HARBOR_PROJECT_PUBLIC_REQUEST, UPDATE_HARBOR_PROJECT_PUBLIC_SUCCESS, UPDATE_HARBOR_PROJECT_PUBLIC_FAILURE ],
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
export function updateProjectPublicity(harbor, registry, id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProjectPublicity(harbor, registry, id, body, callback))
  }
}

export const UPDATE_HARBOR_PROJECT_REQUEST = 'UPDATE_HARBOR_PROJECT_REQUEST'
export const UPDATE_HARBOR_PROJECT_SUCCESS = 'UPDATE_HARBOR_PROJECT_SUCCESS'
export const UPDATE_HARBOR_PROJECT_FAILURE = 'UPDATE_HARBOR_PROJECT_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateProject(harbor, registry, id, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects/${id}?harbor=${harbor}`
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
export function updateProject(harbor, registry, id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProject(harbor, registry, id, body, callback))
  }
}

export const GET_CONFIGURATIONS_REQUEST = 'GET_CONFIGURATIONS_REQUEST'
export const GET_CONFIGURATIONS_SUCCESS = 'GET_CONFIGURATIONS_SUCCESS'
export const GET_CONFIGURATIONS_FAILURE = 'GET_CONFIGURATIONS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetConfigurations(harbor, registry, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/configurations?harbor=${harbor}`
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
export function getConfigurations(harbor, registry, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetConfigurations(harbor, registry, callback))
  }
}

export const LOAD_IMAGEUPDATE_LIST_REQUEST = 'LOAD_IMAGEUPDATE_LIST_REQUEST'
export const LOAD_IMAGEUPDATE_LIST_SUCCESS = 'LOAD_IMAGEUPDATE_LIST_SUCCESS'
export const LOAD_IMAGEUPDATE_LIST_FAILURE = 'LOAD_IMAGEUPDATE_LIST_FAILURE'

function fetchLoadImageUpdateList(harbor, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${body.registry}/projects/${body.projectID}/replication/summary?harbor=${harbor}`
  return {
    registry: body.registry,
    [FETCH_API]: {
      types: [ LOAD_IMAGEUPDATE_LIST_REQUEST, LOAD_IMAGEUPDATE_LIST_SUCCESS, LOAD_IMAGEUPDATE_LIST_FAILURE ],
      endpoint,
      schema: {},
    },
    callback
  }
}

export function loadImageUpdateList(harbor, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchLoadImageUpdateList(harbor, body, callback))
  }
}

export const LOAD_LABEL_LIST_REQUEST = 'LOAD_LABEL_LIST_REQUEST'
export const LOAD_LABEL_LIST_SUCCESS = 'LOAD_LABEL_LIST_SUCCESS'
export const LOAD_LABEL_LIST_FAILURE = 'LOAD_LABEL_LIST_FAILURE'

function fetchLabelList(registry, query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/label`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [ LOAD_LABEL_LIST_REQUEST, LOAD_LABEL_LIST_SUCCESS, LOAD_LABEL_LIST_FAILURE ],
      endpoint,
      schema: {},
    },
    callback
  }
}

export function loadLabelList(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchLabelList(registry, query, callback))
  }
}

export const UPDATE_LABEL_REQUEST = 'UPDATE_LABEL_REQUEST'
export const UPDATE_LABEL_SUCCESS = 'UPDATE_LABEL_SUCCESS'
export const UPDATE_LABEL_FAILURE = 'UPDATE_LABEL_FAILURE'

function fetchUpdateLabel(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/label?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ UPDATE_LABEL_REQUEST, UPDATE_LABEL_SUCCESS, UPDATE_LABEL_FAILURE ],
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

export function updateLabel(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateLabel(harbor, registry, body, callback))
  }
}
export const DELETE_LABEL_REQUEST = 'DELETE_LABEL_REQUEST'
export const DELETE_LABEL_SUCCESS = 'DELETE_LABEL_SUCCESS'
export const DELETE_LABEL_FAILURE = 'DELETE_LABEL_FAILURE'

function fetchDelLabel(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/label/${id}?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ DELETE_LABEL_REQUEST, DELETE_LABEL_SUCCESS, DELETE_LABEL_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    callback
  }
}

export function deleteLabel(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDelLabel(harbor, registry, body, callback))
  }
}

export const CREATE_LABEL_REQUEST = 'CREATE_LABEL_REQUEST'
export const CREATE_LABEL_SUCCESS = 'CREATE_LABEL_SUCCESS'
export const CREATE_LABEL_FAILURE = 'CREATE_LABEL_FAILURE'

function fetchCreateLabel(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/label?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ CREATE_LABEL_REQUEST, CREATE_LABEL_SUCCESS, CREATE_LABEL_FAILURE ],
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

export function createLabel(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateLabel(harbor, registry, body, callback))
  }
}

export const SET_LABEL_REQUEST = 'SET_LABEL_REQUEST'
export const SET_LABEL_SUCCESS = 'SET_LABEL_SUCCESS'
export const SET_LABEL_FAILURE = 'SET_LABEL_FAILURE'

function fetchSetImageLabel(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/images/label?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ SET_LABEL_REQUEST, SET_LABEL_SUCCESS, SET_LABEL_FAILURE ],
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

export function setImageLabel(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSetImageLabel(harbor, registry, body, callback))
  }
}

export const IMAGE_UPDATE_RULES_SWITCH_REQUEST = 'IMAGE_UPDATE_RULES_SWITCH_REQUEST'
export const IMAGE_UPDATE_RULES_SWITCH_SUCCESS = 'IMAGE_UPDATE_RULES_SWITCH_SUCCESS'
export const IMAGE_UPDATE_RULES_SWITCH_FAILURE = 'IMAGE_UPDATE_RULES_SWITCH_FAILURE'

function fetchImageUpdateSwitch(harbor, registry, id, body,  callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/policies/replication/${id}/enablement?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ IMAGE_UPDATE_RULES_SWITCH_REQUEST, IMAGE_UPDATE_RULES_SWITCH_SUCCESS, IMAGE_UPDATE_RULES_SWITCH_FAILURE ],
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

export function imageUpdateSwitch(harbor, registry, id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchImageUpdateSwitch(harbor, registry, id, body, callback))
  }
}

export const DELETE_IMAGE_UPDATE_RULES_REQUEST = 'DELETE_IMAGE_UPDATE_RULES_REQUEST'
export const DELETE_IMAGE_UPDATE_RULES_SUCCESS = 'DELETE_IMAGE_UPDATE_RULES_SUCCESS'
export const DELETE_IMAGE_UPDATE_RULES_FAILURE = 'DELETE_IMAGE_UPDATE_RULES_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDelteImageUpdateRules(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/policies/replication/${id}?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ DELETE_IMAGE_UPDATE_RULES_REQUEST, DELETE_IMAGE_UPDATE_RULES_SUCCESS, DELETE_IMAGE_UPDATE_RULES_FAILURE ],
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
export function deleteImageUpdateRules(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDelteImageUpdateRules(harbor, registry, id, callback))
  }
}

export const EDIT_IMAGE_UPDATE_RULES_REQUEST = 'EDIT_IMAGE_UPDATE_RULES_REQUEST'
export const EDIT_IMAGE_UPDATE_RULES_SUCCESS = 'EDIT_IMAGE_UPDATE_RULES_SUCCESS'
export const EDIT_IMAGE_UPDATE_RULES_FAILURE = 'EDIT_IMAGE_UPDATE_RULES_FAILURE'

function fetchEditImageUpdateRules(harbor, registry, id, body,  callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/policies/replication/${id}?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ EDIT_IMAGE_UPDATE_RULES_REQUEST, EDIT_IMAGE_UPDATE_RULES_SUCCESS, EDIT_IMAGE_UPDATE_RULES_FAILURE ],
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

export function editImageUpdateRules(harbor, registry, id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchEditImageUpdateRules(harbor, registry, id, body, callback))
  }
}

export const CREATE_TARGET_STORE_REQUEST = 'CREATE_TARGET_STORE_REQUEST'
export const CREATE_TARGET_STORE_SUCCESS = 'CREATE_TARGET_STORE_SUCCESS'
export const CREATE_TARGET_STORE_FAILURE = 'CREATE_TARGET_STORE_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateTargeStore(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/targets?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ CREATE_TARGET_STORE_REQUEST, CREATE_TARGET_STORE_SUCCESS, CREATE_TARGET_STORE_FAILURE ],
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
export function createTargetStore(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateTargeStore(harbor, registry, body, callback))
  }
}

export const UPDATE_CONFIGURATIONS_REQUEST = 'UPDATE_CONFIGURATIONS_REQUEST'
export const UPDATE_CONFIGURATIONS_SUCCESS = 'UPDATE_CONFIGURATIONS_SUCCESS'
export const UPDATE_CONFIGURATIONS_FAILURE = 'UPDATE_CONFIGURATIONS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateConfigurations(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/configurations?harbor=${harbor}`
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
export function updateConfigurations(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateConfigurations(harbor, registry, body, callback))
  }
}

export const IMAGE_UPDATE_ADD_NEW_RULES_REQUEST = 'IMAGE_UPDATE_ADD_NEW_RULES_REQUEST'
export const IMAGE_UPDATE_ADD_NEW_RULES_SUCCESS = 'IMAGE_UPDATE_ADD_NEW_RULES_SUCCESS'
export const IMAGE_UPDATE_ADD_NEW_RULES_FAILURE = 'IMAGE_UPDATE_ADD_NEW_RULES_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchiImageUpdateAddNewRules(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/policies/replication?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ IMAGE_UPDATE_ADD_NEW_RULES_REQUEST, IMAGE_UPDATE_ADD_NEW_RULES_SUCCESS, IMAGE_UPDATE_ADD_NEW_RULES_FAILURE ],
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
export function iamgeUpdateAddNewRules(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchiImageUpdateAddNewRules(harbor, registry, body, callback))
  }
}

export const VALIDATION_NEW_TARGET_STORE_REQUEST = 'VALIDATION_NEW_TARGET_STORE_REQUEST'
export const VALIDATION_NEW_TARGET_STORE_SUCCESS = 'VALIDATION_NEW_TARGET_STORE_SUCCESS'
export const VALIDATION_NEW_TARGET_STORE_FAILURE = 'VALIDATION_NEW_TARGET_STORE_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchiValidationNewTargetStore(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/targets/ping?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ VALIDATION_NEW_TARGET_STORE_REQUEST, VALIDATION_NEW_TARGET_STORE_SUCCESS, VALIDATION_NEW_TARGET_STORE_FAILURE ],
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
export function validationNewTargetStore(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchiValidationNewTargetStore(harbor, registry, body, callback))
  }
}

export const VALIDATION_OLD_TARGET_STORE_REQUEST = 'VALIDATION_OLD_TARGET_STORE_REQUEST'
export const VALIDATION_OLD_TARGET_STORE_SUCCESS = 'VALIDATION_OLD_TARGET_STORE_SUCCESS'
export const VALIDATION_OLD_TARGET_STORE_FAILURE = 'VALIDATION_OLD_TARGET_STORE_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchiValidationOldTargetStore(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/targets/${id}/ping?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ VALIDATION_OLD_TARGET_STORE_REQUEST, VALIDATION_OLD_TARGET_STORE_SUCCESS, VALIDATION_OLD_TARGET_STORE_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
      }
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function validationOldTargetStore(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchiValidationOldTargetStore(harbor, registry, id, callback))
  }
}

export const GET_IMAGE_UPDATE_TASK_LOG_REQUEST = 'GET_IMAGE_UPDATE_TASK_LOG_REQUEST'
export const GET_IMAGE_UPDATE_TASK_LOG_SUCCESS = 'GET_IMAGE_UPDATE_TASK_LOG_SUCCESS'
export const GET_IMAGE_UPDATE_TASK_LOG_FAILURE = 'GET_IMAGE_UPDATE_TASK_LOG_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetImageUpdateTaskLog(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/jobs/replication/${id}/log?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ GET_IMAGE_UPDATE_TASK_LOG_REQUEST, GET_IMAGE_UPDATE_TASK_LOG_SUCCESS, GET_IMAGE_UPDATE_TASK_LOG_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function getTasklogs(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetImageUpdateTaskLog(harbor, registry, id, callback))
  }
}

export const GET_CURRENT_RULE_TASK_REQUEST = 'GET_CURRENT_RULE_TASK_REQUEST'
export const GET_CURRENT_RULE_TASK_SUCCESS = 'GET_CURRENT_RULE_TASK_SUCCESS'
export const GET_CURRENT_RULE_TASK_FAILURE = 'GET_CURRENT_RULE_TASK_FAILURE'

function fetchGetCurrentRuleTask(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/jobs/replication?harbor=${harbor}&policy_id=${id}`
  return {
    registry,
    [FETCH_API]: {
      types: [ GET_CURRENT_RULE_TASK_REQUEST, GET_CURRENT_RULE_TASK_SUCCESS, GET_CURRENT_RULE_TASK_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// 获取当前选中的规则的任务list
export function getCurrentRuleTask(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetCurrentRuleTask(harbor, registry, id, callback))
  }
}

const STOP_CURRENT_TASK_REQUEST = 'STOP_CURRENT_TASK_REQUEST'
const STOP_CURRENT_TASK_SUCCESS = 'STOP_CURRENT_TASK_SUCCESS'
const STOP_CURRENT_TASK_FAILURE = 'STOP_CURRENT_TASK_FAILURE'

function fetchUpdateCurrentTask(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/jobs/replication?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ STOP_CURRENT_TASK_REQUEST, STOP_CURRENT_TASK_SUCCESS, STOP_CURRENT_TASK_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body,
      }
    },
    callback
  }
}

// 停止任务
export function updateCurrentTask(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateCurrentTask(harbor, registry, body, callback))
  }
}

export const GET_TARGETS_REQUEST = 'GET_TARGETS_REQUEST'
export const GET_TARGETS_SUCCESS = 'GET_TARGETS_SUCCESS'
export const GET_TARGETS_FAILURE = 'GET_TARGETS_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetTargets(registry, query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/targets`
  if (query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [ GET_TARGETS_REQUEST, GET_TARGETS_SUCCESS, GET_TARGETS_FAILURE ],
      endpoint,
      schema: {},
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function getTargets(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetTargets(registry, query, callback))
  }
}

export const DELETE_TARGET_BY_ID_REQUEST = 'DELETE_TARGET_BY_ID_REQUEST'
export const DELETE_TARGET_BY_ID_SUCCESS = 'DELETE_TARGET_BY_ID_SUCCESS'
export const DELETE_TARGET_BY_ID_FAILURE = 'DELETE_TARGET_BY_ID_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteTargetById(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/targets/${id}?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ DELETE_TARGET_BY_ID_REQUEST, DELETE_TARGET_BY_ID_SUCCESS, DELETE_TARGET_BY_ID_FAILURE ],
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
export function deleteTargetById(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteTargetById(harbor, registry, id, callback))
  }
}

export const UPDATE_TARGET_BY_ID_REQUEST = 'UPDATE_TARGET_BY_ID_REQUEST'
export const UPDATE_TARGET_BY_ID_SUCCESS = 'UPDATE_TARGET_BY_ID_SUCCESS'
export const UPDATE_TARGET_BY_ID_FAILURE = 'UPDATE_TARGET_BY_ID_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateTargetById(harbor, registry, id, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/targets/${id}?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ UPDATE_TARGET_BY_ID_REQUEST, UPDATE_TARGET_BY_ID_SUCCESS, UPDATE_TARGET_BY_ID_FAILURE ],
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
export function updateTargetById(harbor, registry, id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateTargetById(harbor, registry, id, body, callback))
  }
}

export const GET_TARGET_POLICIES_REQUEST = 'GET_TARGET_POLICIES_REQUEST'
export const GET_TARGET_POLICIES_SUCCESS = 'GET_TARGET_POLICIES_SUCCESS'
export const GET_TARGET_POLICIES_FAILURE = 'GET_TARGET_POLICIES_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchGetTargetPolicies(harbor, registry, id, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/targets/${id}/policies?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [ GET_TARGET_POLICIES_REQUEST, GET_TARGET_POLICIES_SUCCESS, GET_TARGET_POLICIES_FAILURE ],
      endpoint,
      schema: {},
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function getTargetPolicies(harbor, registry, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetTargetPolicies(harbor, registry, id, callback))
  }
}

export const GET_REPLICATION_POLICIES_REQUEST = 'GET_REPLICATION_POLICIES_REQUEST'
export const GET_REPLICATION_POLICIES_SUCCESS = 'GET_REPLICATION_POLICIES_SUCCESS'
export const GET_REPLICATION_POLICIES_FAILURE = 'GET_REPLICATION_POLICIES_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetReplicationPolicies(harbor, registry, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/policies/replication?harbor=${harbor}`
  return {
    [FETCH_API]: {
      types: [GET_REPLICATION_POLICIES_REQUEST,GET_REPLICATION_POLICIES_SUCCESS,GET_REPLICATION_POLICIES_FAILURE],
      endpoint,
      schema: {},
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function getReplicationPolicies(harbor, registry, callback) {
  return dispatch => dispatch(fetReplicationPolicies(harbor, registry, callback))
}

//this is get the image info(docker and attribute)
export const GET_HARBOR_IMAGEINFO_REQUEST = 'GET_HARBOR_IMAGEINFO_REQUEST'
export const GET_HARBOR_IMAGEINFO_SUCCESS = 'GET_HARBOR_IMAGEINFO_SUCCESS'
export const GET_HARBOR_IMAGEINFO_FAILURE = 'GET_HARBOR_IMAGEINFO_FAILURE'

export function getImageDetailInfo(harbor, query, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${query.registry}/repositories?harbor=${harbor}`
  if (query) {
    endpoint = `${endpoint}&${toQuerystring(query)}`
  }
  return {
    registry: query.registry,
    [FETCH_API]: {
      types: [GET_HARBOR_IMAGEINFO_REQUEST, GET_HARBOR_IMAGEINFO_SUCCESS, GET_HARBOR_IMAGEINFO_FAILURE],
      endpoint,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export const PUT_HARBOR_EDIT_IMAGEINfO_REQUEST = 'PUT_HARBOR_EDIT_IMAGEINfO_REQUEST'
export const PUT_HARBOR_EDIT_IMAGEINfO_SUCCESS = 'PUT_HARBOR_EDIT_IMAGEINfO_SUCCESS'
export const PUT_HARBOR_EDIT_IMAGEINfO_FAILURE = 'PUT_HARBOR_EDIT_IMAGEINfO_FAILURE'

export function putEditImageDetailInfo(harbor, obj, callback) {
  return {
    [FETCH_API]: {
      types: [PUT_HARBOR_EDIT_IMAGEINfO_REQUEST, PUT_HARBOR_EDIT_IMAGEINfO_SUCCESS, PUT_HARBOR_EDIT_IMAGEINfO_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/repositories/${obj.name}?harbor=${harbor}`,
      options: {
        method: 'PUT',
        body: obj.body,
      },
      schema: {},
    },
    callback
  }
}

export const COPY_CURRENT_RULE_REQUEST = 'COPY_CURRENT_RULE_REQUEST'
export const COPY_CURRENT_RULE_SUCCESS = 'COPY_CURRENT_RULE_SUCCESS'
export const COPY_CURRENT_RULE_FAILURE = 'COPY_CURRENT_RULE_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCopyCurrentRule(harbor, registry, body, callback) {
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/replications?harbor=${harbor}`
  return {
    registry,
    [FETCH_API]: {
      types: [ COPY_CURRENT_RULE_REQUEST, COPY_CURRENT_RULE_SUCCESS, COPY_CURRENT_RULE_FAILURE ],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback
  }
}

// 复制当前规则
export function copyCurrentRule(harbor, registry, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCopyCurrentRule(harbor, registry, body, callback))
  }
}

export const GET_HARBOR_VOLUMES_REQUEST = 'GET_HARBOR_VOLUMES_REQUEST'
export const GET_HARBOR_VOLUMES_SUCCESS = 'GET_HARBOR_VOLUMES_SUCCESS'
export const GET_HARBOR_VOLUMES_FAILURE = 'GET_HARBOR_VOLUMES_FAILURE'

export function getSysteminfoVolumes(registry, callback) {
  const endpoint = `${API_URL_PREFIX}/registries/${registry}/systeminfo/volumes?`
  return {
    registry,
    [FETCH_API]: {
      types: [GET_HARBOR_VOLUMES_REQUEST, GET_HARBOR_VOLUMES_SUCCESS, GET_HARBOR_VOLUMES_FAILURE],
      endpoint,
      schema: {},
    },
    callback
  }
}

export const GET_IMAGE_APPSTACKN_REQUEST = 'GET_IMAGE_APPSTACKN_REQUEST'
export const GET_IMAGE_APPSTACKN_SUCCESS = 'GET_IMAGE_APPSTACKN_SUCCESS'
export const GET_IMAGE_APPSTACKN_FAILURE = 'GET_IMAGE_APPSTACKN_FAILURE'

/**
 * query {
 * server: string
 * group: string
 * image: string
 * }
 */
function fetchImageAppStackN(query, callback) {

  const endpoint = `${API_URL_PREFIX}/registries/images/loads?${toQuerystring(query)}`
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_APPSTACKN_REQUEST, GET_IMAGE_APPSTACKN_SUCCESS, GET_IMAGE_APPSTACKN_FAILURE],
      endpoint,
      schema: {},
    },
    callback
  }
}

export function getImageAppStackN(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchImageAppStackN(query, callback))
  }
}