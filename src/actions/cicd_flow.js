/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for app manage
 *
 * v0.1 - 2016-11-04
 * @author BaiYu
 */



import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const GET_REPOS_LIST_REQUEST = 'GET_REPOS_LIST_REQUEST'
export const GET_REPOS_LIST_SUCCESS = 'GET_REPOS_LIST_SUCCESS'
export const GET_REPOS_LIST_FAILURE = 'GET_REPOS_LIST_FAILURE'

function fetchCodeStormList(types) {
  return {
    [FETCH_API]: {
      types: [GET_REPOS_LIST_REQUEST, GET_REPOS_LIST_SUCCESS, GET_REPOS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${types}`,
      schema: {}
    }
  }
}

export function getRepoList (types) {
  return (dispatch, getState) => {
    return dispatch(fetchCodeStormList(types))
  }
}

export const DELETE_REPOS_LIST_REQUEST = 'DELETE_REPOS_LIST_REQUEST'
export const DELETE_REPOS_LIST_SUCCESS = 'DELETE_REPOS_LIST_SUCCESS'
export const DELETE_REPOS_LIST_FAILURE = 'DELETE_REPOS_LIST_FAILURE'

function fetchDeleteRepoList(types) {
  return {
    [FETCH_API]: {
      types: [DELETE_REPOS_LIST_REQUEST, DELETE_REPOS_LIST_SUCCESS, DELETE_REPOS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${types}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
  }
}

export function deleteRepo(types) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteRepoList(types))
  }
}

export const ADD_CODE_STORE_REQUEST = 'ADD_CODE_STORE_REQUEST'
export const ADD_CODE_STORE_SUCCESS = 'ADD_CODE_STORE_SUCCESS'
export const ADD_CODE_STORE_FAILURE = 'ADD_CODE_STORE_FAILURE'

function fetchAddCodeRepo(type, obj, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_CODE_STORE_REQUEST, ADD_CODE_STORE_SUCCESS, ADD_CODE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects`,
      schema: {},
       options: {
        method: 'POST',
        body: {
          name: obj.name,
          source_full_name: obj.name,
          repo_type:type,
          address: obj.sshUrl,
          gitlab_project_id: obj.projectId,
          is_private:obj.private ? 1 : 0
        }
      }
    },
    callback: callback
  }
}

// add project code
export function addCodeRepo(repo_type, obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddCodeRepo(repo_type, obj, callback))
  }
}


export const GET_CODE_STORE_REQUEST = 'GET_CODE_STORE_REQUEST'
export const GET_CODE_STORE_SUCCESS = 'GET_CODE_STORE_SUCCESS'
export const GET_CODE_STORE_FAILURE = 'GET_CODE_STORE_FAILURE'

function fetchProject() {
  return {
    [FETCH_API]: {
      types: [GET_CODE_STORE_REQUEST, GET_CODE_STORE_SUCCESS, GET_CODE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects`,
      schema: {},
      options: {
        method: 'GET',
        
      }
    }
  }
}

export function getProjectList() {
  return (dispatch, getState) => {
    return dispatch(fetchProject())
  }
}

export const DELETE_CODE_STORE_REQUEST = 'DELETE_CODE_STORE_REQUEST'
export const DELETE_CODE_STORE_SUCCESS = 'DELETE_CODE_STORE_SUCCESS'
export const DELETE_CODE_STORE_FAILURE = 'DELETE_CODE_STORE_FAILURE'

function fetchRemoveProject(projectId) {
  return {
    [FETCH_API]: {
      types: [DELETE_CODE_STORE_REQUEST, DELETE_CODE_STORE_SUCCESS, DELETE_CODE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects/${projectId}`,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    id: projectId
  }
}

export function removeProject(projectId) {
  return(dispatch, getState) => {
    return dispatch(fetchRemoveProject(projectId))
  }
}

export const REGISTRY_CODE_REPO_REQUEST = 'REGISTRY_CODE_REPO_REQUEST'
export const REGISTRY_CODE_REPO_SUCCESS = 'REGISTRY_CODE_REPO_SUCCESS'
export const REGISTRY_CODE_REPO_FAILURE = 'REGISTRY_CODE_REPO_FAILURE'

function fetchRegistryRepo(item, callback) {
  return {
    [FETCH_API]: {
      types: [REGISTRY_CODE_REPO_REQUEST, REGISTRY_CODE_REPO_SUCCESS, REGISTRY_CODE_REPO_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${item.type}`,
      schema: {},
      options: {
        method: 'POST',
        body: {
          url: item.url,
          private_token: item.token
        }
      }
    },
    callback: callback
  }
}

export function registryRepo(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRegistryRepo(obj, callback))
  }
}


function fetchSyncRepo(type) {
  return {
    [FETCH_API]: {
      types: [GET_REPOS_LIST_REQUEST, GET_REPOS_LIST_SUCCESS, GET_REPOS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${type}`,
      schema: {},
      options: {
        method: 'PUT'
      }
    }
  }
}
// sync code 
export function syncRepoList(type) {
  return (dispatch, getState) => {
    return dispatch(fetchSyncRepo(type))
  }
}

export const GET_TENX_FLOW_LIST_REQUEST = 'GET_TENX_FLOW_LIST_REQUEST'
export const GET_TENX_FLOW_LIST_SUCCESS = 'GET_TENX_FLOW_LIST_SUCCESS'
export const GET_TENX_FLOW_LIST_FAILURE = 'GET_TENX_FLOW_LIST_FAILURE'

function fetchTenxFlowList(callback) {
  return {
    [FETCH_API]: {
      types: [GET_TENX_FLOW_LIST_REQUEST, GET_TENX_FLOW_LIST_SUCCESS, GET_TENX_FLOW_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows`,
      schema: {},
    },
    callback: callback
  }
}

export function getTenxFlowList(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxFlowList(callback))
  }
}

export const DELETE_SINGLE_TENX_FLOW_REQUEST = 'DELETE_SINGLE_TENX_FLOW_REQUEST'
export const DELETE_SINGLE_TENX_FLOW_SUCCESS = 'DELETE_SINGLE_TENX_FLOW_SUCCESS'
export const DELETE_SINGLE_TENX_FLOW_FAILURE = 'DELETE_SINGLE_TENX_FLOW_FAILURE'

function postDelTenxFlow(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_SINGLE_TENX_FLOW_REQUEST, DELETE_SINGLE_TENX_FLOW_SUCCESS, DELETE_SINGLE_TENX_FLOW_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/$(flowId)`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback: callback
  }
}

export function deleteTenxFlowSingle(flowId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxFlowList(flowId, callback))
  }
}