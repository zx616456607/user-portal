/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * container_security_policy.js page
 *
 * @author zhangtao
 * @date Wednesday November 7th 2018
 */
import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

// k8s PodSecurityPolicy 创建
export const POST_PODSECURITYPOLICY_REQUEST = 'POST_PODSECURITYPOLICY_REQUEST'
export const POST_PODSECURITYPOLICY_SUCCESS = 'POST_PODSECURITYPOLICY_SUCCESS'
export const POST_PODSECURITYPOLICY_FAILURE = 'POST_PODSECURITYPOLICY_FAILURE'

function postPodSecurityPolicy(cluster, body, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [POST_PODSECURITYPOLICY_REQUEST, POST_PODSECURITYPOLICY_SUCCESS, POST_PODSECURITYPOLICY_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback
  }
}

export function createPodSecurityPolicy(cluster,body,callback) {
  return (dispatch) => {
    return dispatch(postPodSecurityPolicy(cluster,body, callback))
  }
}

// k8s PodSecurityPolicy 更新
export const PUT_PODSECURITYPOLICY_REQUEST = 'PUT_PODSECURITYPOLICY_REQUEST'
export const PUT_PODSECURITYPOLICY_SUCCESS = 'PUT_PODSECURITYPOLICY_SUCCESS'
export const PUT_PODSECURITYPOLICY_FAILURE = 'PUT_PODSECURITYPOLICY_FAILURE'

function putPodSecurityPolicy(cluster, body, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [PUT_PODSECURITYPOLICY_REQUEST, PUT_PODSECURITYPOLICY_SUCCESS, PUT_PODSECURITYPOLICY_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback
  }
}

export function updatePodSecurityPolicy(cluster,body,callback) {
  return (dispatch) => {
    return dispatch(putPodSecurityPolicy(cluster,body, callback))
  }
}

// 删除 k8s 原生资源
export const DELETE_K8SNATIVERESOURCE_REQUEST = 'DELETE_K8SNATIVERESOURCE_REQUEST'
export const DELETE_K8SNATIVERESOURCE_SUCCESS = 'DELETE_K8SNATIVERESOURCE_SUCCESS'
export const DELETE_K8SNATIVERESOURCE_FAILURE = 'DELETE_K8SNATIVERESOURCE_FAILURE'

function deleteK8sNativeResourceInner(cluster, type, name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_K8SNATIVERESOURCE_REQUEST, DELETE_K8SNATIVERESOURCE_SUCCESS, DELETE_K8SNATIVERESOURCE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/native/${type}/${name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback
  }
}

export function deleteK8sNativeResource(cluster, type, name, callback) {
  return (dispatch) => {
    return dispatch(deleteK8sNativeResourceInner(cluster, type, name, callback))
  }
}

// 获取 k8s 原生资源列表
export const GET_K8SNATIVERESOURCE_REQUEST = 'GET_K8SNATIVERESOURCE_REQUEST'
export const GET_K8SNATIVERESOURCE_SUCCESS = 'GET_K8SNATIVERESOURCE_SUCCESS'
export const GET_K8SNATIVERESOURCE_FAILURE = 'GET_K8SNATIVERESOURCE_FAILURE'

function getK8sNativeResourceInner(cluster, type, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_K8SNATIVERESOURCE_REQUEST, GET_K8SNATIVERESOURCE_SUCCESS, GET_K8SNATIVERESOURCE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/native/${type}`,
      schema: {},
    },
    callback
  }
}

export function listK8sNativeResource(cluster, type,callback) {
  return (dispatch) => {
    return dispatch(getK8sNativeResourceInner(cluster, type, callback))
  }
}


// k8s PodSecurityPolicy 删除
export const DELETE_PSP_REQUEST = 'DELETE_PSP_REQUEST'
export const DELETE_PSP_SUCCESS = 'DELETE_PSP_SUCCESS'
export const DELETE_PSP_FAILURE = 'DELETE_PSP_FAILURE'

function deletePSPInner(cluster, name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [DELETE_PSP_REQUEST, DELETE_PSP_SUCCESS, DELETE_PSP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy/${name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback
  }
}

export function deletePSP(cluster, name, callback) {
  return (dispatch) => {
    return dispatch(deletePSPInner(cluster, name, callback))
  }
}

// k8s PodSecurityPolicy 列表
export const GET_PSP_REQUEST = 'GET_PSP_REQUEST'
export const GET_PSP_SUCCESS = 'GET_PSP_SUCCESS'
export const GET_PSP_FAILURE = 'GET_PSP_FAILURE'

function getPSPInner(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_PSP_REQUEST, GET_PSP_SUCCESS, GET_PSP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy`,
      schema: {},
    },
    callback
  }
}

export function listPSP(cluster,callback) {
  return (dispatch) => {
    return dispatch(getPSPInner(cluster, callback))
  }
}

// k8s PodSecurityPolicy 获取
export const GET_PSP_DETAIL_REQUEST = 'GET_PSP_DETAIL_REQUEST'
export const GET_PSP_DETAIL_SUCCESS = 'GET_PSP_DETAIL_SUCCESS'
export const GET_PSP_DETAIL_FAILURE = 'GET_PSP_DETAIL_FAILURE'

function getPSPDetailInner(cluster, name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_PSP_DETAIL_REQUEST, GET_PSP_DETAIL_SUCCESS, GET_PSP_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy/${name}`,
      schema: {},
    },
    callback
  }
}

export function listPSPDetail(cluster, name, callback) {
  return (dispatch) => {
    return dispatch(getPSPDetailInner(cluster, name, callback))
  }
}

//获取项目容器安全策略详情
export const GET_PSP_PROJECT_DETAIL_REQUEST = 'GET_PSP_PROJECT_DETAIL_REQUEST'
export const GET_PSP_PROJECT_DETAIL_SUCCESS = 'GET_PSP_PROJECT_DETAIL_SUCCESS'
export const GET_PSP_PROJECT_DETAIL_FAILURE = 'GET_PSP_PROJECT_DETAIL_FAILURE'

function getPSPProjectDetailInner(cluster, project, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_PSP_PROJECT_DETAIL_REQUEST, GET_PSP_PROJECT_DETAIL_SUCCESS, GET_PSP_PROJECT_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy/project`,
      schema: {},
      options: {
        headers:{ teamspace: project }
      },
    },
    callback
  }
}

export function listProjectPSPDetail(cluster, project, callback) {
  return (dispatch) => {
    return dispatch(getPSPProjectDetailInner(cluster, project, callback))
  }
}

//启用项目容器安全策略
export const POST_PSP_PROJECT_REQUEST = 'POST_PSP_PROJECT_REQUEST'
export const POST_PSP_PROJECT_SUCCESS = 'POST_PSP_PROJECT_SUCCESS'
export const POST_PSP_PROJECT_FAILURE = 'POST_PSP_PROJECT_FAILURE'

function postPSPProject(cluster,resources, project, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [POST_PSP_PROJECT_REQUEST, POST_PSP_PROJECT_SUCCESS, POST_PSP_PROJECT_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy/project/${resources}`,
      schema: {},
      options: {
        method: 'POST',
        headers:{ teamspace: project }
      },
    },
    callback
  }
}

export function startPodProject(cluster,resources, project, callback) {
  return (dispatch) => {
    return dispatch(postPSPProject(cluster,resources, project, callback))
  }
}

// 停用项目容器安全策略
export const DELETE_PSPProject_REQUEST = 'DELETE_PSPProject_REQUEST'
export const DELETE_PSPProject_SUCCESS = 'DELETE_PSPProject_SUCCESS'
export const DELETE_PSPProject_FAILURE = 'DELETE_PSPProject_FAILURE'

function deletePSPProject(cluster,resources, project, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_PSPProject_REQUEST, DELETE_PSPProject_SUCCESS, DELETE_PSPProject_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/podsecuritypolicy/project/${resources}`,
      schema: {},
      options: {
        method: 'DELETE',
        headers:{ teamspace: project }
      },
    },
    callback
  }
}

export function stopPSPProject(cluster, resources, project, callback) {
  return (dispatch) => {
    return dispatch(deletePSPProject(cluster, resources, project, callback))
  }
}
