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

export const GET_REPO_USER_INFO_REQUEST = 'GET_REPO_USER_INFO_REQUEST'
export const GET_REPO_USER_INFO_SUCCESS = 'GET_REPO_USER_INFO_SUCCESS'
export const GET_REPO_USER_INFO_FAILURE = 'GET_REPO_USER_INFO_FAILURE'

function fetchGetUserInfo(types) {
  return {
    [FETCH_API]: {
      types: [GET_REPO_USER_INFO_REQUEST, GET_REPO_USER_INFO_SUCCESS, GET_REPO_USER_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${types}/user`,
      schema: {}
    }
  }
}
// get user info in repo
export function getUserInfo(types) {
  return (dispatch, getState) => {
    return dispatch(fetchGetUserInfo(types))
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
// search code project list
export const SEARCH_CODE_STORE_LIST = 'SEARCH_CODE_STORE_LIST'

export function searchProject(names){
  return {
    type: SEARCH_CODE_STORE_LIST,
    codeName:names
  }
}

// filter code project list
export const FILTER_CODE_STORE_LIST = 'FILTER_CODE_STORE_LIST'
export function filterProject(types) {
  return {
    type: FILTER_CODE_STORE_LIST,
    types: types
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

export const SEARCH_CODE_REPO_LIST = 'SEARCH_CODE_REPO_LIST'
// search code repo list
export function searchCodeRepo(codeName) {
  return {
    type: SEARCH_CODE_REPO_LIST,
    codeName
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
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}`,
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
    return dispatch(postDelTenxFlow(flowId, callback))
  }
}

export const CREATE_SINGLE_TENX_FLOW_REQUEST = 'CREATE_SINGLE_TENX_FLOW_REQUEST'
export const CREATE_SINGLE_TENX_FLOW_SUCCESS = 'CREATE_SINGLE_TENX_FLOW_SUCCESS'
export const CREATE_SINGLE_TENX_FLOW_FAILURE = 'CREATE_SINGLE_TENX_FLOW_FAILURE'

function postCreateTenxFlow(flowInfo, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_SINGLE_TENX_FLOW_REQUEST, CREATE_SINGLE_TENX_FLOW_SUCCESS, CREATE_SINGLE_TENX_FLOW_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows`,
      schema: {},
      options: {
        method: 'POST',
        body: flowInfo
      }
    },
    callback: callback
  }
}

export function createTenxFlowSingle(flowInfo, callback) {
  return (dispatch, getState) => {
    return dispatch(postCreateTenxFlow(flowInfo, callback))
  }
}

export const GET_SINGLE_TENX_FLOW_REQUEST = 'GET_SINGLE_TENX_FLOW_REQUEST'
export const GET_SINGLE_TENX_FLOW_SUCCESS = 'GET_SINGLE_TENX_FLOW_SUCCESS'
export const GET_SINGLE_TENX_FLOW_FAILURE = 'GET_SINGLE_TENX_FLOW_FAILURE'

function fethcTenxFlowDetail(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_SINGLE_TENX_FLOW_REQUEST, GET_SINGLE_TENX_FLOW_SUCCESS, GET_SINGLE_TENX_FLOW_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}`,
      schema: {},
    },
    callback: callback
  }
}

export function getTenxFlowDetail(flowId, callback) {
  return (dispatch, getState) => {
    return dispatch(fethcTenxFlowDetail(flowId, callback))
  }
}

export const UPDATE_TENX_FLOW_ALERT_REQUEST = 'UPDATE_TENX_FLOW_ALERT_REQUEST'
export const UPDATE_TENX_FLOW_ALERT_SUCCESS = 'UPDATE_TENX_FLOW_ALERT_SUCCESS'
export const UPDATE_TENX_FLOW_ALERT_FAILURE = 'UPDATE_TENX_FLOW_ALERT_FAILURE'

function updateTenxFlowAlert(flowId, newAlert, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_TENX_FLOW_ALERT_REQUEST, UPDATE_TENX_FLOW_ALERT_SUCCESS, UPDATE_TENX_FLOW_ALERT_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}`,
      schema: {},
      options: {
        method: 'PUT',
        body: newAlert
      }
    },
    callback: callback
  }
}

export function putEditTenxFlowAlert(flowId, newAlert, callback) {
  return (dispatch, getState) => {
    return dispatch(updateTenxFlowAlert(flowId, newAlert, callback))
  }
}