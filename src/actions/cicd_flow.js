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

function fetchCodeStormList(types, callback) {
  return {
    [FETCH_API]: {
      types: [GET_REPOS_LIST_REQUEST, GET_REPOS_LIST_SUCCESS, GET_REPOS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${types}`,
      schema: {}
    },
    callback
  }
}

export function getRepoList(types, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCodeStormList(types, callback))
  }
}

export const GET_GITHUB_LIST_REQUEST = 'GET_GITHUB_LIST_REQUEST'
export const GET_GITHUB_LIST_SUCCESS = 'GET_GITHUB_LIST_SUCCESS'
export const GET_GITHUB_LIST_FAILURE = 'GET_GITHUB_LIST_FAILURE'

function fetchGithubCode(types, callback) {
  return {
    [FETCH_API]: {
      types: [GET_GITHUB_LIST_REQUEST, GET_GITHUB_LIST_SUCCESS, GET_GITHUB_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${types}`,
      schema: {}
    },
    callback
  }
}

export function getGithubList(types, callback) {
  return (dispatch, getState) => {
    dispatch(fetchGithubCode(types, callback))
  }
}

export const GET_GITHUB_URL_REQUEST = 'GET_GITHUB_URL_REQUEST'
export const GET_GITHUB_URL_SUCCESS = 'GET_GITHUB_URL_SUCCESS'
export const GET_GITHUB_URL_FAILURE = 'GET_GITHUB_URL_FAILURE'

function fetchGithub(types, callback) {
  return {
    [FETCH_API]: {
      types: [GET_GITHUB_URL_REQUEST, GET_REPOS_LIST_SUCCESS, GET_GITHUB_URL_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${types}/auth`,
      schema: {}
    },
    callback
  }
}

export function registryGithub(types, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGithub(types, callback))
  }
}

export const SEARCH_GITHUB_LIST = 'SEARCH_GITHUB_LIST'

export function searchGithubList(users, image) {
  return {
    type: 　SEARCH_GITHUB_LIST,
    users,
    image
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

export const DELETE_GITLAB_REPO_REQUEST = 'DELETE_GITLAB_REPO_REQUEST'
export const DELETE_GITLAB_REPO_SUCCESS = 'DELETE_GITLAB_REPO_SUCCESS'
export const DELETE_GITLAB_REPO_FAILURE = 'DELETE_GITLAB_REPO_FAILURE'

export const DELETE_GITHUB_REPO_REQUEST = 'DELETE_GITHUB_REPO_REQUEST'
export const DELETE_GITHUB_REPO_SUCCESS = 'DELETE_GITHUB_REPO_SUCCESS'
export const DELETE_GITHUB_REPO_FAILURE = 'DELETE_GITHUB_REPO_FAILURE'

function fetchDeleteRepoList(types) {
  let actionKey = [DELETE_GITLAB_REPO_REQUEST,DELETE_GITLAB_REPO_SUCCESS,DELETE_GITLAB_REPO_FAILURE]
  if (types === 'github') {
    actionKey = [DELETE_GITHUB_REPO_REQUEST,DELETE_GITHUB_REPO_SUCCESS,DELETE_GITHUB_REPO_FAILURE]
  }
  return {
    [FETCH_API]: {
      types: actionKey,
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
  const body = {
    name: obj.name,
    source_full_name: obj.name,
    repo_type: type,
    address: obj.private ? obj.sshUrl : obj.cloneUrl,
    gitlab_project_id: obj.projectId,
    is_private: obj.private ? 1 : 0
  }
  return {
    [FETCH_API]: {
      types: [ADD_CODE_STORE_REQUEST, ADD_CODE_STORE_SUCCESS, ADD_CODE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects`,
      schema: {},
      options: {
        method: 'POST',
        body: body
      }
    },
    names: obj.name.toLowerCase(),
    callback: callback
  }
}

// add project code
export function addCodeRepo(repo_type, obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddCodeRepo(repo_type, obj, callback))
  }
}

export const ADD_GITHUB_PROJECT_REQUEST = 'ADD_GITHUB_PROJECT_REQUEST'
export const ADD_GITHUB_PROJECT_SUCCESS = 'ADD_GITHUB_PROJECT_SUCCESS'
export const ADD_GITHUB_PROJECT_FAILRUE = 'ADD_GITHUB_PROJECT_FAILRUE'

function fetchAddGithupRepo(obj, callback) {
    const body = {
      name: obj.name,
      is_private: obj.private ? 1 : 0,
      repo_type: "github",
      address: obj.private ? obj.sshUrl : obj.cloneUrl,
      description: obj.description,
      projectId: obj.projectId
    }
  
  return {
    [FETCH_API]: {
      types: [ADD_GITHUB_PROJECT_REQUEST, ADD_GITHUB_PROJECT_SUCCESS, ADD_GITHUB_PROJECT_FAILRUE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects`,
      schema: {},
      options: {
        method: 'POST',
        body: body
      }
    },
    names: obj.name,
    users: obj.owner.username.toLowerCase(),
    callback: callback
  }
}

export function addGithubRepo(repo_type, obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddGithupRepo(repo_type, obj, callback))
  }
}

export const ADD_SVN_CODE_STORE_REQUEST = 'ADD_SVN_CODE_STORE_REQUEST'
export const ADD_SVN_CODE_STORE_SUCCESS = 'ADD_SVN_CODE_STORE_SUCCESS'
export const ADD_SVN_CODE_STORE_FAILURE = 'ADD_SVN_CODE_STORE_FAILURE'

function fetchAddSvnmanageed(obj, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_SVN_CODE_STORE_REQUEST, ADD_SVN_CODE_STORE_SUCCESS, ADD_SVN_CODE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects`,
      schema: {},
      options: {
        method: 'POST',
        body: obj
      }
    },
    callback: callback
  }
}
// add svn managed project
export function addSvnManaged(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddSvnmanageed(obj, callback))
  }
}

export const GET_CODE_STORE_REQUEST = 'GET_CODE_STORE_REQUEST'
export const GET_CODE_STORE_SUCCESS = 'GET_CODE_STORE_SUCCESS'
export const GET_CODE_STORE_FAILURE = 'GET_CODE_STORE_FAILURE'

function fetchProject(callback) {
  return {
    [FETCH_API]: {
      types: [GET_CODE_STORE_REQUEST, GET_CODE_STORE_SUCCESS, GET_CODE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects`,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback: callback
  }
}

export function getProjectList(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProject(callback))
  }
}

export const DELETE_CODE_STORE_REQUEST = 'DELETE_CODE_STORE_REQUEST'
export const DELETE_CODE_STORE_SUCCESS = 'DELETE_CODE_STORE_SUCCESS'
export const DELETE_CODE_STORE_FAILURE = 'DELETE_CODE_STORE_FAILURE'

function fetchRemoveProject(projectId, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_CODE_STORE_REQUEST, DELETE_CODE_STORE_SUCCESS, DELETE_CODE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects/${projectId}`,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    id: projectId,
    callback
  }
}

export function removeProject(projectId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRemoveProject(projectId, callback))
  }
}

export const NOT_ACTIVE_PROJECT_REQUEST = 'NOT_ACTIVE_PROJECT_REQUEST'
export const NOT_ACTIVE_PROJECT_SUCCESS = 'NOT_ACTIVE_PROJECT_SUCCESS'
export const NOT_ACTIVE_PROJECT_FAILURE = 'NOT_ACTIVE_PROJECT_FAILURE'

// remove code repo project active
function fetchNotActiveProject(projectId, callback) {
  return {
    [FETCH_API]: {
      types: [NOT_ACTIVE_PROJECT_REQUEST, NOT_ACTIVE_PROJECT_SUCCESS, NOT_ACTIVE_PROJECT_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects/${projectId}`,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    id: projectId,
    callback
  }
}
// remove gitlab repo project active
export function notActiveProject(id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchNotActiveProject(id, callback))
  }
}

export const NOT_Github_ACTIVE_PROJECT_REQUEST = 'NOT_Github_ACTIVE_PROJECT_REQUEST'
export const NOT_Github_ACTIVE_PROJECT_SUCCESS = 'NOT_Github_ACTIVE_PROJECT_SUCCESS'
export const NOT_Github_ACTIVE_PROJECT_FAILURE = 'NOT_Github_ACTIVE_PROJECT_FAILURE'

function fetchNotGithubProject(users, projectId, callback) {
  return {
    [FETCH_API]: {
      types: [NOT_Github_ACTIVE_PROJECT_REQUEST, NOT_Github_ACTIVE_PROJECT_SUCCESS, NOT_Github_ACTIVE_PROJECT_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects/${projectId}`,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    users,
    id: projectId,
    callback
  }
}

export function notGithubProject(users, id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchNotGithubProject(users, id, callback))
  }
}

// search code project list
export const SEARCH_CODE_STORE_LIST = 'SEARCH_CODE_STORE_LIST'

export function searchProject(names) {
  return {
    type: SEARCH_CODE_STORE_LIST,
    codeName: names
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
  let actionType = [GET_REPOS_LIST_REQUEST, GET_REPOS_LIST_SUCCESS, GET_REPOS_LIST_FAILURE]
  if (type === 'github') {
    actionType = [GET_GITHUB_LIST_REQUEST, GET_GITHUB_LIST_SUCCESS, GET_GITHUB_LIST_FAILURE]
  }
  return {
    [FETCH_API]: {
      types: actionType,
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

//dockerfile list
export const GET_DOCKER_FILES_LIST_REQUEST = 'GET_DOCKER_FILES_LIST_REQUEST'
export const GET_DOCKER_FILES_LIST_SUCCESS = 'GET_DOCKER_FILES_LIST_SUCCESS'
export const GET_DOCKER_FILES_LIST_FAILURE = 'GET_DOCKER_FILES_LIST_FAILURE'
function fetchgetDockerfileList() {
  return {
    [FETCH_API]: {
      types: [GET_DOCKER_FILES_LIST_REQUEST, GET_DOCKER_FILES_LIST_SUCCESS, GET_DOCKER_FILES_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/dockerfiles`,
      schema: {},
      options: {
        method: 'GET'
      }
    }
  }
}
export function getDockerfileList() {
  return (dispatch, getState) => {
    return dispatch(fetchgetDockerfileList())
  }
}
// get detail dockerfile 
export const GET_DOCKER_FILES_REQUEST = 'GET_DOCKER_FILES_REQUEST'
export const GET_DOCKER_FILES_SUCCESS = 'GET_DOCKER_FILES_SUCCESS'
export const GET_DOCKER_FILES_FAILURE = 'GET_DOCKER_FILES_FAILURE'
function fetchDockerfiles(flows, callback) {
  return {
    [FETCH_API]: {
      types: [GET_DOCKER_FILES_REQUEST, GET_DOCKER_FILES_SUCCESS, GET_DOCKER_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flows.flowId}/stages/${flows.stageId}/dockerfile`,
      schema: {},
      options: {
        method: 'GET'
      }
    },
    callback
  }
}

export function getDockerfiles(flowInfo, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDockerfiles(flowInfo, callback))
  }
}
// update detail dockerfile 
export const PUT_DOCKER_FILES_REQUEST = 'PUT_DOCKER_FILES_REQUEST'
export const PUT_DOCKER_FILES_SUCCESS = 'PUT_DOCKER_FILES_SUCCESS'
export const PUT_DOCKER_FILES_FAILURE = 'PUT_DOCKER_FILES_FAILURE'

function fetchPutDockerfile(flows, callback) {
  return {
    [FETCH_API]: {
      types: [PUT_DOCKER_FILES_REQUEST, PUT_DOCKER_FILES_SUCCESS, PUT_DOCKER_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flows.flowId}/stages/${flows.stageId}/dockerfile`,
      schema: {},
      options: {
        method: 'PUT',
        body: { content: flows.content }
      }
    },
    callback
  }
}

export function setDockerfile(flowInfo, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchPutDockerfile(flowInfo, callback))
  }
}

export const CREATE_DOCKER_FILES_REQUEST = 'CREATE_DOCKER_FILES_REQUEST'
export const CREATE_DOCKER_FILES_SUCCESS = 'CREATE_DOCKER_FILES_SUCCESS'
export const CREATE_DOCKER_FILES_FAILURE = 'CREATE_DOCKER_FILES_FAILURE'

function fetchCreateDockerfile(flows, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_DOCKER_FILES_REQUEST, CREATE_DOCKER_FILES_SUCCESS, CREATE_DOCKER_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flows.flowId}/stages/${flows.stageId}/dockerfile`,
      schema: {},
      options: {
        method: 'POST',
        body: { content: flows.content }
      }
    },
    callback
  }
}

export function createDockerfile(flowInfo, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateDockerfile(flowInfo, callback))
  }
}

export const SEARCH_DOCKER_FILES_LIST = 'SEARCH_DOCKER_FILES_LIST'
export function searchDockerfile(names) {
  return {
    type: SEARCH_DOCKER_FILES_LIST,
    names
  }
}

export const GET_DEPLOY_LOG_REQUEST = 'GET_DEPLOY_LOG_REQUEST'
export const GET_DEPLOY_LOG_SUCCESS = 'GET_DEPLOY_LOG_SUCCESS'
export const GET_DEPLOY_LOG_FAILURE = 'GET_DEPLOY_LOG_FAILURE'
// get deployment log list
function fetchdeploymentLog(flowId) {
  return {
    [FETCH_API]: {
      types: [GET_DEPLOY_LOG_REQUEST, GET_DEPLOY_LOG_SUCCESS, GET_DEPLOY_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/deployment-logs`,
      schema: {},
    }
  }
}

export function deploymentLog(flowId) {
  return (dispatch, getState) => {
    dispatch(fetchdeploymentLog(flowId))
  }
}

export const GET_CD_RULES_LIST_REQUEST = 'GET_CD_RULES_LIST_REQUEST'
export const GET_CD_RULES_LIST_SUCCESS = 'GET_CD_RULES_LIST_SUCCESS'
export const GET_CD_RULES_LIST_FAILURE = 'GET_CD_RULES_LIST_FAILURE'
// GET cd rules
function fetchCdRules(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CD_RULES_LIST_REQUEST, GET_CD_RULES_LIST_SUCCESS, GET_CD_RULES_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/cd-rules`,
      schema: {},
    },
    callback
  }
}

export function gitCdRules(flowId, callback) {
  return (dispatch, getState) => {
    dispatch(fetchCdRules(flowId, callback))
  }
}
export const ADD_CD_RULES_LIST_REQUEST = 'ADD_CD_RULES_LIST_REQUEST'
export const ADD_CD_RULES_LIST_SUCCESS = 'ADD_CD_RULES_LIST_SUCCESS'
export const ADD_CD_RULES_LIST_FAILURE = 'ADD_CD_RULES_LIST_FAILURE'

// add cd rules
function fetchAddRules(obj, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_CD_RULES_LIST_REQUEST, ADD_CD_RULES_LIST_SUCCESS, ADD_CD_RULES_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${obj.flowId}/cd-rules`,
      options: {
        method: 'POST',
        body: obj
      },
      schema: {},
    },
    callback
  }
}

export const DELETE_CD_RULES_LIST_REQUEST = 'DELETE_CD_RULES_LIST_REQUEST'
export const DELETE_CD_RULES_LIST_SUCCESS = 'DELETE_CD_RULES_LIST_SUCCESS'
export const DELETE_CD_RULES_LIST_FAILURE = 'DELETE_CD_RULES_LIST_FAILURE'
export function addCdRules(obj, callback) {
  return (dispatch, getState) => {
    dispatch(fetchAddRules(obj, callback))
  }
}

function fetchDeleteRules(flowId, ruleId, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_CD_RULES_LIST_REQUEST, DELETE_CD_RULES_LIST_SUCCESS, DELETE_CD_RULES_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/cd-rules/${ruleId}`,
      options: {
        method: 'DELETE',
      },
      schema: {},
    },
    ruleId,
    callback
  }
}
export function deleteCdRule(flowId, ruleId, callback) {
  return (dispatch, getState) => {
    dispatch(fetchDeleteRules(flowId, ruleId, callback))
  }
}

export const UPDATE_CD_RULES_LIST_REQUEST = 'UPDATE_CD_RULES_LIST_REQUEST'
export const UPDATE_CD_RULES_LIST_SUCCESS = 'UPDATE_CD_RULES_LIST_SUCCESS'
export const UPDATE_CD_RULES_LIST_FAILURE = 'UPDATE_CD_RULES_LIST_FAILURE'

function fetchPutCdRule(obj, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_CD_RULES_LIST_REQUEST, UPDATE_CD_RULES_LIST_SUCCESS, UPDATE_CD_RULES_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${obj.flowId}/cd-rules/${obj.ruleId}`,
      options: {
        method: 'PUT',
        body: obj
      },
      schema: {},
    },
    callback
  }
}

export function putCdRule(obj, callback) {
  return (dispatch, getState) => {
    dispatch(fetchPutCdRule(obj, callback))
  }
}

export const GET_CD_RULES_IMAGE_REQUEST = 'GET_CD_RULES_IMAGE_REQUEST'
export const GET_CD_RULES_IMAGE_SUCCESS = 'GET_CD_RULES_IMAGE_SUCCESS'
export const GET_CD_RULES_IMAGE_FAILURE = 'GET_CD_RULES_IMAGE_FAILURE'

function fetchCdInImage(flowId) {
  return {
    [FETCH_API]: {
      types: [GET_CD_RULES_IMAGE_REQUEST, GET_CD_RULES_IMAGE_SUCCESS, GET_CD_RULES_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/images`,
      schema: {},
    }
  }
}

export function getCdInimage(flowId) {
  return (dispatch, getState) => {
    dispatch(fetchCdInImage(flowId))
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

export const CHANGE_SINGLE_TENX_FLOW_STATE = "CHANGE_SINGLE_TENX_FLOW_STATE"

export function changeSingleState(body) {
  return {
    type: CHANGE_SINGLE_TENX_FLOW_STATE,
    body: body
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

export const GET_TENX_FLOW_STATE_LIST_REQUEST = 'GET_TENX_FLOW_STATE_LIST_REQUEST'
export const GET_TENX_FLOW_STATE_LIST_SUCCESS = 'GET_TENX_FLOW_STATE_LIST_SUCCESS'
export const GET_TENX_FLOW_STATE_LIST_FAILURE = 'GET_TENX_FLOW_STATE_LIST_FAILURE'

function fetchTenxFlowStateList(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_TENX_FLOW_STATE_LIST_REQUEST, GET_TENX_FLOW_STATE_LIST_SUCCESS, GET_TENX_FLOW_STATE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/stages`,
      schema: {},
    },
    callback: callback
  }
}

export function getTenxFlowStateList(flowId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxFlowStateList(flowId, callback))
  }
}

export const CREATE_TENX_FLOW_STATE_REQUEST = 'CREATE_TENX_FLOW_STATE_REQUEST'
export const CREATE_TENX_FLOW_STATE_SUCCESS = 'CREATE_TENX_FLOW_STATE_SUCCESS'
export const CREATE_TENX_FLOW_STATE_FAILURE = 'CREATE_TENX_FLOW_STATE_FAILURE'

function postCreateTenxFlowState(flowId, newStage, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_TENX_FLOW_STATE_REQUEST, CREATE_TENX_FLOW_STATE_SUCCESS, CREATE_TENX_FLOW_STATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/stages`,
      schema: {},
      options: {
        method: 'POST',
        body: newStage
      }
    },
    callback: callback
  }
}

export function createTenxFlowState(flowId, newStage, callback) {
  return (dispatch, getState) => {
    return dispatch(postCreateTenxFlowState(flowId, newStage, callback))
  }
}

export const UPDATE_TENX_FLOW_STATE_REQUEST = 'UPDATE_TENX_FLOW_STATE_REQUEST'
export const UPDATE_TENX_FLOW_STATE_SUCCESS = 'UPDATE_TENX_FLOW_STATE_SUCCESS'
export const UPDATE_TENX_FLOW_STATE_FAILURE = 'UPDATE_TENX_FLOW_STATE_FAILURE'

function postUpdateTenxFlowState(flowId, stageId, newStage, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_TENX_FLOW_STATE_REQUEST, UPDATE_TENX_FLOW_STATE_SUCCESS, UPDATE_TENX_FLOW_STATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/stages/${stageId}`,
      schema: {},
      options: {
        method: 'PUT',
        body: newStage
      }
    },
    callback: callback
  }
}

export function updateTenxFlowState(flowId, stageId, newStage, callback) {
  return (dispatch, getState) => {
    return dispatch(postUpdateTenxFlowState(flowId, stageId, newStage, callback))
  }
}

export const DELETE_TENX_FLOW_STATE_REQUEST = 'DELETE_TENX_FLOW_STATE_REQUEST'
export const DELETE_TENX_FLOW_STATE_SUCCESS = 'DELETE_TENX_FLOW_STATE_SUCCESS'
export const DELETE_TENX_FLOW_STATE_FAILURE = 'DELETE_TENX_FLOW_STATE_FAILURE'

function deleteTenxFlowState(flowId, stageId, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_TENX_FLOW_STATE_REQUEST, DELETE_TENX_FLOW_STATE_SUCCESS, DELETE_TENX_FLOW_STATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/stages/${stageId}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback: callback
  }
}

export function deleteTenxFlowStateDetail(flowId, stageId, callback) {
  return (dispatch, getState) => {
    return dispatch(deleteTenxFlowState(flowId, stageId, callback))
  }
}

export const GET_TENX_FLOW_STATE_DETAIL_REQUEST = 'GET_TENX_FLOW_STATE_DETAIL_REQUEST'
export const GET_TENX_FLOW_STATE_DETAIL_SUCCESS = 'GET_TENX_FLOW_STATE_DETAIL_SUCCESS'
export const GET_TENX_FLOW_STATE_DETAIL_FAILURE = 'GET_TENX_FLOW_STATE_DETAIL_FAILURE'

function fetchTenxFlowStateDetail(flowId, stageId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_TENX_FLOW_STATE_DETAIL_REQUEST, GET_TENX_FLOW_STATE_DETAIL_SUCCESS, GET_TENX_FLOW_STATE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/ci-flows/${flowId}/stages/${stageId}`,
      schema: {},
    },
    callback: callback
  }
}

export function getTenxFlowStateDetail(flowId, stageId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxFlowStateDetail(flowId, stageId, callback))
  }
}

export const GET_TENX_FLOW_YAML_REQUEST = 'GET_TENX_FLOW_YAML_REQUEST'
export const GET_TENX_FLOW_YAML_SUCCESS = 'GET_TENX_FLOW_YAML_SUCCESS'
export const GET_TENX_FLOW_YAML_FAILURE = 'GET_TENX_FLOW_YAML_FAILURE'

function fetchTenxFlowYAML(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_TENX_FLOW_YAML_REQUEST, GET_TENX_FLOW_YAML_SUCCESS, GET_TENX_FLOW_YAML_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/yaml`,
      schema: {}
    },
    callback: callback
  }
}

export function getTenxFlowYAML(flowId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxFlowYAML(flowId, callback))
  }
}

export const GET_REPOS_BRANCH_REQUEST = 'GET_REPOS_BRANCH_REQUEST'
export const GET_REPOS_BRANCH_SUCCESS = 'GET_REPOS_BRANCH_SUCCESS'
export const GET_REPOS_BRANCH_FAILURE = 'GET_REPOS_BRANCH_FAILURE'

function fetchCodeStoreBranchDetail(storeType, reponame, project_id, callback) {
  if (storeType == "svn") {
    // No branch to fetch for svn
    return
  }
  return {
    [FETCH_API]: {
      types: [GET_REPOS_BRANCH_REQUEST, GET_REPOS_BRANCH_SUCCESS, GET_REPOS_BRANCH_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/repos/${storeType}/branches?reponame=${reponame}&&project_id=${project_id}`,
      schema: {},
    },
    callback: callback
  }
}

export function getCodeStoreBranchDetail(storeType, reponame, project_id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCodeStoreBranchDetail(storeType, reponame, project_id, callback))
  }
}

export const BUILD_TENX_FLOW_REQUEST = 'BUILD_TENX_FLOW_REQUEST'
export const BUILD_TENX_FLOW_SUCCESS = 'BUILD_TENX_FLOW_SUCCESS'
export const BUILD_TENX_FLOW_FAILURE = 'BUILD_TENX_FLOW_FAILURE'

function postCreateTenxflowBuild(flowId, body, callback) {
  return {
    [FETCH_API]: {
      types: [BUILD_TENX_FLOW_REQUEST, BUILD_TENX_FLOW_SUCCESS, BUILD_TENX_FLOW_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/builds`,
      schema: {},
      options: {
        method: 'POST',
        body: body
      }
    },
    callback: callback
  }
}

export function CreateTenxflowBuild(flowId, body, callback) {
  return (dispatch, getState) => {
    return dispatch(postCreateTenxflowBuild(flowId, body, callback))
  }
}

export const STOP_BUILD_TENX_FLOW_REQUEST = 'STOP_BUILD_TENX_FLOW_REQUEST'
export const STOP_BUILD_TENX_FLOW_SUCCESS = 'STOP_BUILD_TENX_FLOW_SUCCESS'
export const STOP_BUILD_TENX_FLOW_FAILURE = 'STOP_BUILD_TENX_FLOW_FAILURE'

function putStopTenxflowBuild(flowId, stageId, buildId, callback) {
  return {
    [FETCH_API]: {
      types: [STOP_BUILD_TENX_FLOW_REQUEST, STOP_BUILD_TENX_FLOW_SUCCESS, STOP_BUILD_TENX_FLOW_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/stages/${stageId}/builds/${buildId}/stop`,
      schema: {},
      options: {
        method: 'PUT',
      }
    },
    callback: callback
  }
}

export function StopTenxflowBuild(flowId, stageId, buildId, callback) {
  return (dispatch, getState) => {
    return dispatch(putStopTenxflowBuild(flowId, stageId, buildId, callback))
  }
}

export const GET_FLOW_CI_RULES_REQUEST = 'GET_FLOW_CI_RULES_REQUEST'
export const GET_FLOW_CI_RULES_SUCCESS = 'GET_FLOW_CI_RULES_SUCCESS'
export const GET_FLOW_CI_RULES_FAILURE = 'GET_FLOW_CI_RULES_FAILURE'

function fetchTenxflowCIRules(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_FLOW_CI_RULES_REQUEST, GET_FLOW_CI_RULES_SUCCESS, GET_FLOW_CI_RULES_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/ci-rules`,
      schema: {}
    },
    callback: callback
  }
}

export function getTenxflowCIRules(flowId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxflowCIRules(flowId, callback))
  }
}

export const UPDATE_FLOW_CI_RULES_REQUEST = 'UPDATE_FLOW_CI_RULES_REQUEST'
export const UPDATE_FLOW_CI_RULES_SUCCESS = 'UPDATE_FLOW_CI_RULES_SUCCESS'
export const UPDATE_FLOW_CI_RULES_FAILURE = 'UPDATE_FLOW_CI_RULES_FAILURE'

function putUpdateTenxflowCIRules(flowId, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_FLOW_CI_RULES_REQUEST, UPDATE_FLOW_CI_RULES_SUCCESS, UPDATE_FLOW_CI_RULES_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/ci-rules`,
      schema: {},
      options: {
        method: 'PUT',
        body: body
      }
    },
    callback: callback
  }
}

export function UpdateTenxflowCIRules(flowId, body, callback) {
  return (dispatch, getState) => {
    return dispatch(putUpdateTenxflowCIRules(flowId, body, callback))
  }
}

export const GET_FLOW_BUILD_LOG_REQUEST = 'GET_FLOW_BUILD_LOG_REQUEST'
export const GET_FLOW_BUILD_LOG_SUCCESS = 'GET_FLOW_BUILD_LOG_SUCCESS'
export const GET_FLOW_BUILD_LOG_FAILURE = 'GET_FLOW_BUILD_LOG_FAILURE'

function fetchTenxflowBuildLogs(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_FLOW_BUILD_LOG_REQUEST, GET_FLOW_BUILD_LOG_SUCCESS, GET_FLOW_BUILD_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/getBuildLogs`,
      schema: {}
    },
    callback: callback
  }
}

export function getTenxflowBuildLogs(flowId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxflowBuildLogs(flowId, callback))
  }
}

export const GET_FLOW_BUILD_DETAIL_LOG_REQUEST = 'GET_FLOW_BUILD_DETAIL_LOG_REQUEST'
export const GET_FLOW_BUILD_DETAIL_LOG_SUCCESS = 'GET_FLOW_BUILD_DETAIL_LOG_SUCCESS'
export const GET_FLOW_BUILD_DETAIL_LOG_FAILURE = 'GET_FLOW_BUILD_DETAIL_LOG_FAILURE'

function fetchTenxflowBuildDetailLogs(flowId, flowBuildId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_FLOW_BUILD_DETAIL_LOG_REQUEST, GET_FLOW_BUILD_DETAIL_LOG_SUCCESS, GET_FLOW_BUILD_DETAIL_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/builds/${flowBuildId}`,
      schema: {}
    },
    callback: callback
  }
}

export function getTenxflowBuildDetailLogs(flowId, flowBuildId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxflowBuildDetailLogs(flowId, flowBuildId, callback))
  }
}

export const GET_FLOW_BUILD_LAST_LOG_REQUEST = 'GET_FLOW_BUILD_LAST_LOG_REQUEST'
export const GET_FLOW_BUILD_LAST_LOG_SUCCESS = 'GET_FLOW_BUILD_LAST_LOG_SUCCESS'
export const GET_FLOW_BUILD_LAST_LOG_FAILURE = 'GET_FLOW_BUILD_LAST_LOG_FAILURE'

function fetchTenxflowLastBuildLogs(flowId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_FLOW_BUILD_LAST_LOG_REQUEST, GET_FLOW_BUILD_LAST_LOG_SUCCESS, GET_FLOW_BUILD_LAST_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/getLastBuildLogs`,
      schema: {}
    },
    callback: callback
  }
}

export function getTenxflowBuildLastLogs(flowId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTenxflowLastBuildLogs(flowId, callback))
  }
}

export const GET_FLOW_BUILD_STAGE_LOG_REQUEST = 'GET_FLOW_BUILD_STAGE_LOG_REQUEST'
export const GET_FLOW_BUILD_STAGE_LOG_SUCCESS = 'GET_FLOW_BUILD_STAGE_LOG_SUCCESS'
export const GET_FLOW_BUILD_STAGE_LOG_FAILURE = 'GET_FLOW_BUILD_STAGE_LOG_FAILURE'

function fetchFlowBuildStageLogs(flowId, stageId, stageBuildId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_FLOW_BUILD_STAGE_LOG_REQUEST, GET_FLOW_BUILD_STAGE_LOG_SUCCESS, GET_FLOW_BUILD_STAGE_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/stages/${stageId}/builds/${stageBuildId}`,
      schema: {}
    },
    callback: callback
  }
}

export function getFlowBuildStageLogs(flowId, stageId, stageBuildId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchFlowBuildStageLogs(flowId, stageId, stageBuildId, callback))
  }
}

export const GET_STAGE_BUILD_LOG_LIST_REQUEST = 'GET_STAGE_BUILD_LOG_LIST_REQUEST'
export const GET_STAGE_BUILD_LOG_LIST_SUCCESS = 'GET_STAGE_BUILD_LOG_LIST_SUCCESS'
export const GET_STAGE_BUILD_LOG_LIST_FAILURE = 'GET_STAGE_BUILD_LOG_LIST_FAILURE'

function fetchStageBuildLogList(flowId, stageId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_STAGE_BUILD_LOG_LIST_REQUEST, GET_STAGE_BUILD_LOG_LIST_SUCCESS, GET_STAGE_BUILD_LOG_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci-flows/${flowId}/stages/${stageId}/getStageBuildLogs`,
      schema: {}
    },
    callback: callback
  }
}

export function getStageBuildLogList(flowId, stageId, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStageBuildLogList(flowId, stageId, callback))
  }
}

export const GET_AVAILABLE_IMAGE_REQUEST = 'GET_AVAILABLE_IMAGE_REQUEST'
export const GET_AVAILABLE_IMAGE_SUCCESS = 'GET_AVAILABLE_IMAGE_SUCCESS'
export const GET_AVAILABLE_IMAGE_FAILURE = 'GET_AVAILABLE_IMAGE_FAILURE'

function fetchAvailableImage(callback) {
  return {
    [FETCH_API]: {
      types: [GET_AVAILABLE_IMAGE_REQUEST, GET_AVAILABLE_IMAGE_SUCCESS, GET_AVAILABLE_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/ci/images`,
      schema: {}
    },
    callback
  }
}

export function getAvailableImage(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAvailableImage(callback))
  }
}


export const CHANGE_CI_FLOW_STATUS = "CHANGE_CI_FLOW_STATUS"

export function changeCiFlowStatus(index, status, log) {
  return {
    type: CHANGE_CI_FLOW_STATUS,
    body: {
      index,
      status,
      log
    }
  }
}
