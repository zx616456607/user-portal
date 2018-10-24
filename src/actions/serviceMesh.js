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
function checkServiceListServiceMeshStatus(clusterId, serviceList, query={}, callback) {
  const newQuery = toQuerystring({
    name: serviceList,
    ...query
  })
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/paas/services`
  endpoint += `?${newQuery}`
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

export function getServiceListServiceMeshStatus(clusterId, serviceList, query, callback) {
  return (dispatch) => {
    return dispatch(checkServiceListServiceMeshStatus(clusterId, serviceList, query, callback))
  }
}

// 列取服务网格出口
export const GET_SERVICE_MESH_PORT_LIST_REQUEST = 'GET_SERVICE_MESH_PORT_LIST_REQUEST'
export const GET_SERVICE_MESH_PORT_LIST_SUCCESS = 'GET_SERVICE_MESH_PORT_LIST_SUCCESS'
export const GET_SERVICE_MESH_PORT_LIST_FAILURE = 'GET_SERVICE_MESH_PORT_LIST_FAILURE'
function checkServiceMeshPortList(clusterId ,callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/ingressgateway`
  return {
    [FETCH_API]: {
      types: [GET_SERVICE_MESH_PORT_LIST_REQUEST, GET_SERVICE_MESH_PORT_LIST_SUCCESS, GET_SERVICE_MESH_PORT_LIST_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback,
  }
}

export function getServiceMeshPortList(clusterId, callback) {
  return (dispatch) => {
    return dispatch(checkServiceMeshPortList(clusterId, callback))
  }
}

// 获取服务网格出口
export const GET_SERVICE_MESH_PORT_REQUEST = 'GET_SERVICE_MESH_PORT_REQUEST'
export const GET_SERVICE_MESH_PORT_SUCCESS = 'GET_SERVICE_MESH_PORT_SUCCESS'
export const GET_SERVICE_MESH_PORT_FAILURE = 'GET_SERVICE_MESH_PORT_FAILURE'
function checkServiceMeshPort(clusterId, hashedName, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/ingressgateway/:${hashedName}`
  return {
    [FETCH_API]: {
      types: [GET_SERVICE_MESH_PORT_REQUEST, GET_SERVICE_MESH_PORT_SUCCESS, GET_SERVICE_MESH_PORT_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback,
  }
}

export function getServiceMeshPort(clusterId, hashedName, callback) {
  return (dispatch) => {
    return dispatch(checkServiceMeshPort(clusterId,hashedName, callback))
  }
}


//  创建服务网格出口
export const CREATE_SERVICE_MESH_PORT_REQUEST = 'CREATE_SERVICE_MESH_PORT_REQUEST'
export const CREATE_SERVICE_MESH_PORT_SUCCESS = 'CREATE_SERVICE_MESH_PORT_SUCCESS'
export const CREATE_SERVICE_MESH_PORT_FAILURE = 'CREATE_SERVICE_MESH_PORT_FAILURE'

function postServiceMeshPort(clusterId, body, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/ingressgateway`
  return {
    [FETCH_API]: {
      types: [CREATE_SERVICE_MESH_PORT_REQUEST, CREATE_SERVICE_MESH_PORT_SUCCESS, CREATE_SERVICE_MESH_PORT_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback,
  }
}

export function createServiceMeshPort(clusterId, body, callback) {
  return (dispatch) => {
    return dispatch(postServiceMeshPort(clusterId, body, callback))
  }
}

//  更新服务网格出口
export const UPDATE_SERVICE_MESH_PORT_REQUEST = 'UPDATE_SERVICE_MESH_PORT_REQUEST'
export const UPDATE_SERVICE_MESH_PORT_SUCCESS = 'UPDATE_SERVICE_MESH_PORT_SUCCESS'
export const UPDATE_SERVICE_MESH_PORT_FAILURE = 'UPDATE_SERVICE_MESH_PORT_FAILURE'

function putServiceMeshPort(clusterId, hashedName, body, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/ingressgateway/${hashedName}`
  return {
    [FETCH_API]: {
      types: [UPDATE_SERVICE_MESH_PORT_REQUEST, UPDATE_SERVICE_MESH_PORT_SUCCESS, UPDATE_SERVICE_MESH_PORT_FAILURE],
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

export function updateServiceMeshPort(clusterId, hashedName,  body, callback) {
  return (dispatch) => {
    return dispatch(putServiceMeshPort(clusterId, hashedName,  body, callback))
  }
}

// 删除服务网格出口
export const DELETE_SERVICE_MESH_PORT_REQUEST = 'DELETE_SERVICE_MESH_PORT_REQUEST'
export const DELETE_SERVICE_MESH_PORT_SUCCESS = 'DELETE_SERVICE_MESH_PORT_SUCCESS'
export const DELETE_SERVICE_MESH_PORT_FAILURE = 'DELETE_SERVICE_MESH_PORT_FAILURE'
function DELETEServiceMeshPort(clusterId, hashedName, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/ingressgateway/${hashedName}`
  return {
    [FETCH_API]: {
      types: [DELETE_SERVICE_MESH_PORT_REQUEST, DELETE_SERVICE_MESH_PORT_SUCCESS, DELETE_SERVICE_MESH_PORT_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      }
    },
    callback,
  }
}

export function deleteServiceMeshPort(clusterId, hashedName, callback) {
  return (dispatch) => {
    return dispatch(DELETEServiceMeshPort(clusterId, hashedName, callback))
  }
}

// 获取集群节点及可用信息
export const GET_SERVICE_MESH_CLUSTER_NODE_REQUEST = 'GET_SERVICE_MESH_CLUSTER_NODE_REQUEST'
export const GET_SERVICE_MESH_CLUSTER_NODE_SUCCESS = 'GET_SERVICE_MESH_CLUSTER_NODE_SUCCESS'
export const GET_SERVICE_MESH_CLUSTER_NODE_FAILURE = 'GET_SERVICE_MESH_CLUSTER_NODE_FAILURE'
function checkServiceMeshClusterNode(clusterId, callback) {
  let endpoint = `${API_URL_PREFIX}/servicemesh/clusters/${clusterId}/nodes`
  return {
    [FETCH_API]: {
      types: [GET_SERVICE_MESH_CLUSTER_NODE_REQUEST, GET_SERVICE_MESH_CLUSTER_NODE_SUCCESS, GET_SERVICE_MESH_CLUSTER_NODE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback,
  }
}

export function getServiceMeshClusterNode(clusterId, callback) {
  return (dispatch) => {
    return dispatch(checkServiceMeshClusterNode(clusterId, callback))
  }
}

// 当创建应用的时候, 如果开启了服务网格, 创建应用处的访问方式应该不显示当前组件, 而是显示一段话
export const CREATE_APP_MESH_VISITOR_PORT_DISABLE = "CREATE_APP_MESH_VISITOR_PORT_DISABLE"
export function toggleCreateAppMeshFlag(flag) {
  return {
    type: CREATE_APP_MESH_VISITOR_PORT_DISABLE,
    flag
  }
}