/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * serviceMesh.js page
 *
 * @author zhangtao
 * @date Tuesday July 31st 2018
 */
import { FETCH_API, Schemas } from '../middleware/api';
import { toQuerystring } from '../common/tools'
import { API_URL_PREFIX } from '../constants'

export const TOGGlE_SERVICEMESH_REQUEST = 'TOGGLE_SERVICEMESH_REQUEST'
export const TOGGLE_SERVICEMESH_SUCCESS = 'TOGGLE_SERVICEMESH_SUCCESS'
export const TOGGLE_SERVICEMESH_FAILURE = 'TOGGLE_SERVICEMESH_FAILURE'

// 项目在某个集群下开启serviceMesh
function fetchToggleServiceMesh(body, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/label`
  return {
    [FETCH_API]: {
      types: [TOGGlE_SERVICEMESH_REQUEST, TOGGLE_SERVICEMESH_SUCCESS, TOGGLE_SERVICEMESH_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body,
      }
    },
    callback,
  }
}

export function ToggleServiceMesh(body, callback) {
  return (dispatch) => {
    return dispatch(fetchToggleServiceMesh(body, callback))
  }
}

// 为服务开启服务网格
export const TOGGlE_APP_MESH_REQUEST = 'TOGGlE_APP_MESH_REQUEST'
export const TOGGlE_APP_MESH_SUCCESS = 'TOGGlE_APP_MESH_SUCCESS'
export const TOGGlE_APP_MESH_FAILURE = 'TOGGlE_APP_MESH_FAILURE'

// 项目在某个集群下开启serviceMesh
function fetchToggleAPPMesh(cluster, service, body, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/serverMesh`
  return {
    [FETCH_API]: {
      types: [TOGGlE_APP_MESH_REQUEST, TOGGlE_APP_MESH_SUCCESS, TOGGlE_APP_MESH_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body,
      }
    },
    callback,
  }
}

export function ToggleAPPMesh(cluster, service, body, callback) {
  return (dispatch) => {
    return dispatch(fetchToggleAPPMesh(cluster, service, body, callback))
  }
}

// 查看某个项目在某个集群下是否开启了serviceMesh
export const CHECK_PRO_IN_CLUS_MESH_REQUEST = 'CHECK_PRO_IN_CLUS_MESH_REQUEST'
export const CHECK_PRO_IN_CLUS_MESH_SUCCESS = 'CHECK_PRO_IN_CLUS_MESH_SUCCESS'
export const CHECK_PRO_IN_CLUS_MESH_FAILURE = 'CHECK_PRO_IN_CLUS_MESH_FAILURE'
function fetchCheckProInClusMesh(query, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/serverMesh/status`
  console.log('query', query)
  if (query) {
    endpoint += `?${toQuerystring(query)}`;
  }
  return {
    [FETCH_API]: {
      types: [CHECK_PRO_IN_CLUS_MESH_REQUEST, CHECK_PRO_IN_CLUS_MESH_SUCCESS, CHECK_PRO_IN_CLUS_MESH_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback,
  }
}

export function checkProInClusMesh(query, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckProInClusMesh(query, callback))
  }
}

// 查看某个集群是否安装istio
export const CHECK_CLUSTER_ISTIO_REQUEST = 'CHECK_CLUSTER_ISTIO_REQUEST'
export const CHECK_CLUSTER_ISTIO_SUCCESS = 'CHECK_CLUSTER_ISTIO_SUCCESS'
export const CHECK_CLUSTER_ISTIO_FAILURE = 'CHECK_CLUSTER_ISTIO_FAILURE'
function fetchCheckClusterIstio(query, callback) {
  let endpoint = `${API_URL_PREFIX}/projects/istio/check`
  if (query) {
    endpoint += `?${toQuerystring(query)}`;
  }
  return {
    [FETCH_API]: {
      types: [CHECK_CLUSTER_ISTIO_REQUEST, CHECK_CLUSTER_ISTIO_SUCCESS, CHECK_CLUSTER_ISTIO_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback,
  }
}

export function checkClusterIstio(query, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckClusterIstio(query, callback))
  }
}

// 查询服务是否开启服务网格
export const CHECK_APP_IN_CLUS_MESH_REQUEST = 'CHECK_APP_IN_CLUS_MESH_REQUEST'
export const CHECK_APP_IN_CLUS_MESH_SUCCESS = 'CHECK_APP_IN_CLUS_MESH_SUCCESS'
export const CHECK_APP_IN_CLUS_MESH_FAILURE = 'CHECK_APP_IN_CLUS_MESH_FAILURE'
function fetchCheckAPPInClusMesh(cluster, service ,query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/serverMesh`
  console.log('query', query)
  if (query) {
    endpoint += `?${toQuerystring(query)}`;
  }
  return {
    [FETCH_API]: {
      types: [CHECK_APP_IN_CLUS_MESH_REQUEST, CHECK_APP_IN_CLUS_MESH_SUCCESS, CHECK_APP_IN_CLUS_MESH_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback,
  }
}

export function checkAPPInClusMesh(cluster, service, query, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckAPPInClusMesh(cluster, service, query, callback))
  }
}