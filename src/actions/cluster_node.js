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
import { toQuerystring } from '../common/tools'

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

export const GET_CLUSTER_NODES_METRICS_REQUEST = 'GET_CLUSTER_NODES_METRICS_REQUEST'
export const GET_CLUSTER_NODES_METRICS_SUCCESS = 'GET_CLUSTER_NODES_METRICS_SUCCESS'
export const GET_CLUSTER_NODES_METRICS_FAILURE = 'GET_CLUSTER_NODES_METRICS_FAILURE'

function fetchClusterNodesMetrics(cluster, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${cluster}/metrics`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_CLUSTER_NODES_METRICS_REQUEST, GET_CLUSTER_NODES_METRICS_SUCCESS, GET_CLUSTER_NODES_METRICS_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}

export function getClusterNodesMetrics(cluster, query, callback) {
  return (dispatch) => {
    return dispatch(fetchClusterNodesMetrics(cluster, query, callback))
  }
}

export const GET_CLUSTER_RESOURCE_CONSUMPTION_REQUEST = 'GET_CLUSTER_RESOURCE_CONSUMPTION_REQUEST'
export const GET_CLUSTER_RESOURCE_CONSUMPTION_SUCCESS = 'GET_CLUSTER_RESOURCE_CONSUMPTION_SUCCESS'
export const GET_CLUSTER_RESOURCE_CONSUMPTION_FAILURE = 'GET_CLUSTER_RESOURCE_CONSUMPTION_FAILURE'

function fetchClusterResourceConsumption(cluster, query, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${cluster}/nodes/resource-consumption`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    [FETCH_API]: {
      types: [
        GET_CLUSTER_RESOURCE_CONSUMPTION_REQUEST,
        GET_CLUSTER_RESOURCE_CONSUMPTION_SUCCESS,
        GET_CLUSTER_RESOURCE_CONSUMPTION_FAILURE
      ],
      endpoint,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}

export function getClusterResourceConsumption(cluster, query, callback) {
  return (dispatch) => {
    return dispatch(fetchClusterResourceConsumption(cluster, query, callback))
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

export const GET_NODES_INGRESSES_REQUEST = 'GET_NODES_INGRESSES_REQUEST'
export const GET_NODES_INGRESSES_SUCCESS = 'GET_NODES_INGRESSES_SUCCESS'
export const GET_NODES_INGRESSES_FAILURE = 'GET_NODES_INGRESSES_FAILURE'

function fetchNodesIngresses(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_NODES_INGRESSES_REQUEST, GET_NODES_INGRESSES_SUCCESS, GET_NODES_INGRESSES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/nodes/ingresses`,
      schema: {},
    },
    callback
  }
}

export function getNodesIngresses(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchNodesIngresses(cluster, callback))
  }
}

export const GET_CLOUSTER_LABEL_REQUEST = 'GET_CLOUSTER_LABEL_REQUEST'
export const GET_CLOUSTER_LABEL_SUCCESS = 'GET_CLOUSTER_LABEL_SUCCESS'
export const GET_CLOUSTER_LABEL_FAILURE = 'GET_CLOUSTER_LABEL_FAILURE'

function fetchClusterLabel(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLOUSTER_LABEL_REQUEST, GET_CLOUSTER_LABEL_SUCCESS, GET_CLOUSTER_LABEL_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${cluster}/label-summary`,
      schema: {},
    },
    cluster,
    callback
  }
}

export function getClusterLabel(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchClusterLabel(cluster, callback))
  }
}

export const ADD_LABELS_REQUEST = 'ADD_LABELS_REQUEST'
export const ADD_LABELS_SUCCESS = 'ADD_LABELS_SUCCESS'
export const ADD_LABELS_FAILURE = 'ADD_LABELS_FAILURE'

function fetchAddLabel(label, cluster, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_LABELS_REQUEST, ADD_LABELS_SUCCESS, ADD_LABELS_FAILURE],
      endpoint: `${API_URL_PREFIX}/labels`,
      options: {
        method:'POST',
        body:label
      },
      schema: {},
    },
    cluster,
    callback
  }
}

export function addLabels(label, cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchAddLabel(label, cluster, callback))
  }
}

export const EDIT_LABELS_REQUEST = 'EDIT_LABELS_REQUEST'
export const EDIT_LABELS_SUCCESS = 'EDIT_LABELS_SUCCESS'
export const EDIT_LABELS_FAILURE = 'EDIT_LABELS_FAILURE'

function fetchEditLabel(body, type, callback) {
  if (typeof type !== 'string') {
    return
  }
  return {
    [FETCH_API]: {
      types: [EDIT_LABELS_REQUEST, EDIT_LABELS_SUCCESS, EDIT_LABELS_FAILURE],
      endpoint: `${API_URL_PREFIX}/labels/${body.id}`,
      options: {
        method: type,
        body: body.labels || null
      },
      schema: {},
    },
    cluster:body.cluster,
    methodType:type,
    id: body.id,
    callback
  }
}
// include delete and update labels
// * type is action method
export function editLabels(body, type, callback) {
  return (dispatch) => {
    return dispatch(fetchEditLabel(body, type, callback))
  }
}

export const SEARCH_CLUSTER_LABLELS = 'SEARCH_CLUSTER_LABLELS'
export function searchLabels(search,cluster) {
  return {
    type: SEARCH_CLUSTER_LABLELS,
    search: search,
    cluster
  }
}

export const EDIT_NODE_LABEL_REQUEST = 'EDIT_NODE_LABEL_REQUEST'
export const EDIT_NODE_LABEL_SUCCESS = 'EDIT_NODE_LABEL_SUCCESS'
export const EDIT_NODE_LABEL_FAILURE = 'EDIT_NODE_LABEL_FAILURE'

function fetchAddNodeLabels(body,callback) {
  return {
    [FETCH_API]: {
      types: [EDIT_NODE_LABEL_REQUEST, EDIT_NODE_LABEL_SUCCESS, EDIT_NODE_LABEL_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${body.cluster}/${body.node}/labels`,
      options: {
        method: 'PUT',
        body: body.labels
      },
      schema: {},
    },
    callback
  }
}

export function editNodeLabels(body,callback) {
  return (dispatch) => {
    return dispatch(fetchAddNodeLabels(body,callback))
  }
}

export const GET_NODE_LABEL_REQUEST = 'GET_NODE_LABEL_REQUEST'
export const GET_NODE_LABEL_SUCCESS = 'GET_NODE_LABEL_SUCCESS'
export const GET_NODE_LABEL_FAILURE = 'GET_NODE_LABEL_FAILURE'

function fetchNodeLabels(cluster,node,callback) {
   return {
    [FETCH_API]: {
      types: [GET_NODE_LABEL_REQUEST, GET_NODE_LABEL_SUCCESS, GET_NODE_LABEL_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${cluster}/${node}/labels?raw=true`,
      schema: {},
    },
    callback
  }
}

export function getNodeLabels(cluster,node,callback) {
  return (dispatch) => {
    return dispatch(fetchNodeLabels(cluster,node,callback))
  }
}

export const GET_NETWORK_SOLUTIONS_REQUEST = 'GET_NETWORK_SOLUTIONS_REQUEST'
export const GET_NETWORK_SOLUTIONS_SUCCESS = 'GET_NETWORK_SOLUTIONS_SUCCESS'
export const GET_NETWORK_SOLUTIONS_FAILURE = 'GET_NETWORK_SOLUTIONS_FAILURE'

function fetchNetworkSolutions(clusterID,callback) {
  return {
    [FETCH_API]: {
      types: [GET_NETWORK_SOLUTIONS_REQUEST, GET_NETWORK_SOLUTIONS_SUCCESS, GET_NETWORK_SOLUTIONS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/network`,
      schema: {},
    },
    clusterID: clusterID,
    callback
  }
}

export function getNetworkSolutions(clusterID,callback) {
  return (dispatch) => {
    return dispatch(fetchNetworkSolutions(clusterID,callback))
  }
}

export const CHECK_LABELS_TO_SERVICE_REQUEST = 'CHECK_LABELS_TO_SERVICE_REQUEST'
export const CHECK_LABELS_TO_SERVICE_SUCCESS = 'CHECK_LABELS_TO_SERVICE_SUCCESS'
export const CHECK_LABELS_TO_SERVICE_FAILURE = 'CHECK_LABELS_TO_SERVICE_FAILURE'

export function checkLablesToService(body,callback) {
  return {
    [FETCH_API]: {
      types: [CHECK_LABELS_TO_SERVICE_REQUEST, CHECK_LABELS_TO_SERVICE_SUCCESS, CHECK_LABELS_TO_SERVICE_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${body.cluster}/${body.node}/affectedpods`,
      options:{
        method:'POST',
        body:body.labels
      },
      schema: {},
    },
    callback
  }
}

export const GET_NODE_DETAIL_REQUEST = 'GET_NODE_DETAIL_REQUEST'
export const GET_NODE_DETAIL_SUCCESS = 'GET_NODE_DETAIL_SUCCESS'
export const GET_NODE_DETAIL_FAILURE = 'GET_NODE_DETAIL_FAILURE'

const fetchNodeDetail = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_NODE_DETAIL_REQUEST,
        GET_NODE_DETAIL_SUCCESS,
        GET_NODE_DETAIL_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/nodes/${name}/drain/preliminary`,
      schema: {}
    },
    callback
  }
}

export const getNodeDetail = (cluster, name, callback) =>
  dispatch => dispatch(fetchNodeDetail(cluster, name, callback))

export const NODE_MAINTAIN_REQUEST = 'NODE_MAINTAIN_REQUEST'
export const NODE_MAINTAIN_SUCCESS = 'NODE_MAINTAIN_SUCCESS'
export const NODE_MAINTAIN_FAILURE = 'NODE_MAINTAIN_FAILURE'

const fetchNodeMaintain = (cluster, name, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        NODE_MAINTAIN_REQUEST,
        NODE_MAINTAIN_SUCCESS,
        NODE_MAINTAIN_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/nodes/${name}/drain`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export const maintainNode = (cluster, name, body, callback) =>
  dispatch => dispatch(fetchNodeMaintain(cluster, name, body, callback))

export const NODE_EXIT_MAINTAIN_REQUEST = 'NODE_EXIT_MAINTAIN_REQUEST'
export const NODE_EXIT_MAINTAIN_SUCCESS = 'NODE_EXIT_MAINTAIN_SUCCESS'
export const NODE_EXIT_MAINTAIN_FAILURE = 'NODE_EXIT_MAINTAIN_FAILURE'

const fetchExitNodeMaintain = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        NODE_EXIT_MAINTAIN_REQUEST,
        NODE_EXIT_MAINTAIN_SUCCESS,
        NODE_EXIT_MAINTAIN_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/nodes/${name}/uncordon`,
      schema: {},
      options: {
        method: 'PUT'
      }
    },
    callback
  }
}

export const exitMaintainNode = (cluster, name, callback) =>
  dispatch => dispatch(fetchExitNodeMaintain(cluster, name, callback))

export const FETCH_NOT_MIGRATED_POD_COUNT_REQUEST = 'FETCH_NOT_MIGRATED_POD_COUNT_REQUEST'
export const FETCH_NOT_MIGRATED_POD_COUNT_SUCCESS = 'FETCH_NOT_MIGRATED_POD_COUNT_SUCCESS'
export const FETCH_NOT_MIGRATED_POD_COUNT_FAILURE = 'FETCH_NOT_MIGRATED_POD_COUNT_FAILURE'

const fetchNotMigratedPodCount = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        FETCH_NOT_MIGRATED_POD_COUNT_REQUEST,
        FETCH_NOT_MIGRATED_POD_COUNT_SUCCESS,
        FETCH_NOT_MIGRATED_POD_COUNT_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/nodes/${name}/drain/podmetric`,
      schema: {},
    },
    callback
  }
}

export const getNotMigratedPodCount = (cluster, name, callback) =>
  dispatch => dispatch(fetchNotMigratedPodCount(cluster, name, callback))


export const GET_ALL_SERVICE_TAG_REQUEST = 'GET_ALL_SERVICE_TAG_REQUEST'
export const GET_ALL_SERVICE_TAG_SUCCESS = 'GET_ALL_SERVICE_TAG_SUCCESS'
export const GET_ALL_SERVICE_TAG_FAILURE = 'GET_ALL_SERVICE_TAG_FAILURE'

function fetchGetServiceTag( cluster, callback ) {
  return {
    [FETCH_API]: {
      types: [ GET_ALL_SERVICE_TAG_REQUEST, GET_ALL_SERVICE_TAG_SUCCESS, GET_ALL_SERVICE_TAG_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/`,
      schema: {},
    },
    callback
  }
}

export function getAllServiceTag( cluster, callback ) {
  return dispatch => {
    return dispatch(fetchGetServiceTag(cluster, callback))
  }
}

export const ADD_SERVICE_TAG_REQUEST = 'ADD_SERVICE_TAG_REQUEST'
export const ADD_SERVICE_TAG_SUCCESS = 'ADD_SERVICE_TAG_SUCCESS'
export const ADD_SERVICE_TAG_FAILURE = 'ADD_SERVICE_TAG_FAILURE'

function fetchAddServiceTag(body, cluster, service, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_SERVICE_TAG_REQUEST, ADD_SERVICE_TAG_SUCCESS, ADD_SERVICE_TAG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/labels`,
      options: {
        method:'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

export function addServiceTag(body, cluster, service, callback) {
  return (dispatch) => {
    return dispatch(fetchAddServiceTag(body, cluster, service, callback))
  }
}

export const UPDATA_SERVICE_TAG_REQUEST = 'UPDATA_SERVICE_TAG_REQUEST'
export const UPDATA_SERVICE_TAG_SUCCESS = 'UPDATA_SERVICE_TAG_SUCCESS'
export const UPDATA_SERVICE_TAG_FAILURE = 'UPDATA_SERVICE_TAG_FAILURE'

function fetchUpdataServiceTag(body, cluster, service, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATA_SERVICE_TAG_REQUEST, UPDATA_SERVICE_TAG_SUCCESS, UPDATA_SERVICE_TAG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/labels`,
      options: {
        method: 'PUT',
        body
      },
      schema: {},
    },
    callback
  }
}

export function updataServiceTag(body, cluster, service, callback) {
  return (dispatch) => {
    return dispatch(fetchUpdataServiceTag(body, cluster, service, callback))
  }
}

export const DELTE_SERVICE_TAG_REQUEST = 'DELTE_SERVICE_TAG_REQUEST'
export const DELTE_SERVICE_TAG_SUCCESS = 'DELTE_SERVICE_TAG_SUCCESS'
export const DELTE_SERVICE_TAG_FAILURE = 'DELTE_SERVICE_TAG_FAILURE'

function fetchDelteServiceTag(labels, cluster, service, callback) {
  return {
    [FETCH_API]: {
      types: [DELTE_SERVICE_TAG_REQUEST, DELTE_SERVICE_TAG_SUCCESS, DELTE_SERVICE_TAG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/labels/${labels}`,
      options: {
        method: 'DELETE',
      },
      schema: {},
    },
    callback,
  }
}

export function delteServiceTag(labels, cluster, service, callback) {
  return (dispatch) => {
    return dispatch(fetchDelteServiceTag(labels, cluster, service, callback))
  }
}
