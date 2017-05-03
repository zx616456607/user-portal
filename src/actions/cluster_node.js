/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for cluster node
 *
 * v0.1 - 2017-2-8
 * @author GaoJian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const GET_ALL_CLUSTER_NODES_REQUEST = 'GET_ALL_CLUSTER_NODES_REQUEST'
export const GET_ALL_CLUSTER_NODES_SUCCESS = 'GET_ALL_CLUSTER_NODES_SUCCESS'
export const GET_ALL_CLUSTER_NODES_FAILURE = 'GET_ALL_CLUSTER_NODES_FAILURE'

function fetchAllClusterNodes(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_ALL_CLUSTER_NODES_REQUEST, GET_ALL_CLUSTER_NODES_SUCCESS, GET_ALL_CLUSTER_NODES_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${cluster}`,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}

export function getAllClusterNodes(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchAllClusterNodes(cluster, callback))
  }
}

export const CHANGE_CLUSTER_NODE_SCHEDULE_REQUEST = 'CHANGE_CLUSTER_NODE_SCHEDULE_REQUEST'
export const CHANGE_CLUSTER_NODE_SCHEDULE_SUCCESS = 'CHANGE_CLUSTER_NODE_SCHEDULE_SUCCESS'
export const CHANGE_CLUSTER_NODE_SCHEDULE_FAILURE = 'CHANGE_CLUSTER_NODE_SCHEDULE_FAILURE'

function postClusterNodeSchedule(cluster, node, schedulable, callback) {
  return {
    [FETCH_API]: {
      types: [CHANGE_CLUSTER_NODE_SCHEDULE_REQUEST, CHANGE_CLUSTER_NODE_SCHEDULE_SUCCESS, CHANGE_CLUSTER_NODE_SCHEDULE_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${cluster}/node/${node}`,
      schema: {},
      options: {
        method: 'POST',
        body: {
          schedulable: schedulable
        }
      },
    },
    callback
  }
}

export function changeClusterNodeSchedule(cluster, node, schedulable, callback) {
  return (dispatch) => {
    return dispatch(postClusterNodeSchedule(cluster, node, schedulable, callback))
  }
}

export const DELETE_CLUSTER_NODE_REQUEST = 'DELETE_CLUSTER_NODE_REQUEST'
export const DELETE_CLUSTER_NODE_SUCCESS = 'DELETE_CLUSTER_NODE_SUCCESS'
export const DELETE_CLUSTER_NODE_FAILURE = 'DELETE_CLUSTER_NODE_FAILURE'

function delClusterNode(cluster, node, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_CLUSTER_NODE_REQUEST, DELETE_CLUSTER_NODE_SUCCESS, DELETE_CLUSTER_NODE_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${cluster}/node/${node}`,
      schema: {},
      options: {
        method: 'DELETE'
      },
    },
    callback
  }
}

export function deleteClusterNode(cluster, node, callback) {
  return (dispatch) => {
    return dispatch(delClusterNode(cluster, node, callback))
  }
}

export const GET_KUBECTLS_PODS_REQUEST = 'GET_KUBECTLS_PODS_REQUEST'
export const GET_KUBECTLS_PODS_SUCCESS = 'GET_KUBECTLS_PODS_SUCCESS'
export const GET_KUBECTLS_PODS_FAILURE = 'GET_KUBECTLS_PODS_FAILURE'

function fetchKubectlsPods(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [GET_KUBECTLS_PODS_REQUEST, GET_KUBECTLS_PODS_SUCCESS, GET_KUBECTLS_PODS_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${cluster}/kubectls`,
      schema: {},
    },
    callback
  }
}

export function getKubectlsPods(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchKubectlsPods(cluster, callback))
  }
}

export const GET_ADD_NODE_CMD_REQUEST = 'GET_ADD_NODE_CMD_REQUEST'
export const GET_ADD_NODE_CMD_SUCCESS = 'GET_ADD_NODE_CMD_SUCCESS'
export const GET_ADD_NODE_CMD_FAILURE = 'GET_ADD_NODE_CMD_FAILURE'

function fetchAddNodeCMD(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_ADD_NODE_CMD_REQUEST, GET_ADD_NODE_CMD_SUCCESS, GET_ADD_NODE_CMD_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${cluster}/add-node-cmd`,
      schema: {},
    },
    callback
  }
}

export function getAddNodeCMD(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchAddNodeCMD(cluster, callback))
  }
}

// For bind node when create service(lite only)
export const GET_NODES_REQUEST = 'GET_NODES_REQUEST'
export const GET_NODES_SUCCESS = 'GET_NODES_SUCCESS'
export const GET_NODES_FAILURE = 'GET_NODES_FAILURE'

function fetchNodes(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_NODES_REQUEST, GET_NODES_SUCCESS, GET_NODES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/nodes`,
      schema: {},
    },
    callback
  }
}

export function getNodes(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchNodes(cluster, callback))
  }
}