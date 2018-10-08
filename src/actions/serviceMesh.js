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
import { API_URL_PREFIX, } from '../constants'

export const TOGGlE_SERVICEMESH_REQUEST = 'TOGGLE_SERVICEMESH_REQUEST'
export const TOGGLE_SERVICEMESH_SUCCESS = 'TOGGLE_SERVICEMESH_SUCCESS'
export const TOGGLE_SERVICEMESH_FAILURE = 'TOGGLE_SERVICEMESH_FAILURE'

// 项目在某个集群下开启serviceMesh
// 设置项目 Istio 状态（开/关）
function fetchToggleServiceMesh(project, clusterId, body, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/paas/status`
  return {
    [FETCH_API]: {
      types: [TOGGlE_SERVICEMESH_REQUEST, TOGGLE_SERVICEMESH_SUCCESS, TOGGLE_SERVICEMESH_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body,
        headers: {
          teamspace: project,
        }
      }
    },
    callback,
  }
}

export function ToggleServiceMesh(project, clusterId, body, callback) {
  return (dispatch) => {
    return dispatch(fetchToggleServiceMesh(project, clusterId, body, callback))
  }
}

// 为服务开启服务网格
export const TOGGlE_APP_MESH_REQUEST = 'TOGGlE_APP_MESH_REQUEST'
export const TOGGlE_APP_MESH_SUCCESS = 'TOGGlE_APP_MESH_SUCCESS'
export const TOGGlE_APP_MESH_FAILURE = 'TOGGlE_APP_MESH_FAILURE'

// 项目在某个集群下开启serviceMesh
// 设置服务 Istio 状态（开/关）
function fetchToggleAPPMesh(cluster, service, body, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${cluster}/paas/services/${service}/status`
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
// 获取项目 Istio 状态
export const CHECK_PRO_IN_CLUS_MESH_REQUEST = 'CHECK_PRO_IN_CLUS_MESH_REQUEST'
export const CHECK_PRO_IN_CLUS_MESH_SUCCESS = 'CHECK_PRO_IN_CLUS_MESH_SUCCESS'
export const CHECK_PRO_IN_CLUS_MESH_FAILURE = 'CHECK_PRO_IN_CLUS_MESH_FAILURE'
function fetchCheckProInClusMesh(project, clusterId, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/paas/status`
  return {
    [FETCH_API]: {
      types: [CHECK_PRO_IN_CLUS_MESH_REQUEST, CHECK_PRO_IN_CLUS_MESH_SUCCESS, CHECK_PRO_IN_CLUS_MESH_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
        headers: {
          teamspace: project,
        }
      }
    },
    callback,
  }
}

export function checkProInClusMesh(project, clusterId, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckProInClusMesh(project, clusterId, callback))
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
// 获取服务 Istio 状态
export const CHECK_APP_IN_CLUS_MESH_REQUEST = 'CHECK_APP_IN_CLUS_MESH_REQUEST'
export const CHECK_APP_IN_CLUS_MESH_SUCCESS = 'CHECK_APP_IN_CLUS_MESH_SUCCESS'
export const CHECK_APP_IN_CLUS_MESH_FAILURE = 'CHECK_APP_IN_CLUS_MESH_FAILURE'
function fetchCheckAPPInClusMesh(clusterId, application, service , callback) {
  const query = toQuerystring({
    application,service
  })
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/paas/pods?${query}`
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

export function checkAPPInClusMesh(clusterId, application, service , callback) {
  return (dispatch) => {
    return dispatch(fetchCheckAPPInClusMesh(clusterId, application, service , callback))
  }
}

// 当服务网格页面重新配置了服务网格,需要让重新
export const SERVICEMESH_REBOOT_SHINING = "SERVICEMESH_REBOOT_SHINING"
export function rebootShining(shiningFlag) {
  return {
    type: SERVICEMESH_REBOOT_SHINING,
    shiningFlag
  }
}

// 获取服务列表的istio状态
export const GET_SERVICE_LIST_SERVICE_MESH_REQUEST = 'GET_SERVICE_LIST_SERVICE_MESH_REQUEST'
export const GET_SERVICE_LIST_SERVICE_MESH_SUCCESS = 'GET_SERVICE_LIST_SERVICE_MESH_SUCCESS'
export const GET_SERVICE_LIST_SERVICE_MESH_FAILURE = 'GET_SERVICE_LIST_SERVICE_MESH_FAILURE'
function checkServiceListServiceMeshStatus(clusterId, serviceList ,callback) {
  const query = toQuerystring({
    name: serviceList
  })
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/paas/services`
  endpoint += `?${query}`
  return {
    [FETCH_API]: {
      types: [GET_SERVICE_LIST_SERVICE_MESH_REQUEST, GET_SERVICE_LIST_SERVICE_MESH_SUCCESS, GET_SERVICE_LIST_SERVICE_MESH_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback,
  }
}

export function getServiceListServiceMeshStatus(clusterId, serviceList, callback) {
  return (dispatch) => {
    return dispatch(checkServiceListServiceMeshStatus(clusterId, serviceList, callback))
  }
}
