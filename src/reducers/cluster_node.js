/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for cluster node
 *
 * v0.1 - 2016-2-8
 * @author GaoJian
 */

import * as ActionTypes from '../actions/cluster_node'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'

function getAllClusterNodes(state = {}, action) {
  const { cluster, type } = action
  const defaultState = {
    [cluster]: {
      isFetching: false,
      nodes: {}
    }
  }
  switch (type) {
    case ActionTypes.GET_ALL_CLUSTER_NODES_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true,
        }
      })
    case ActionTypes.GET_ALL_CLUSTER_NODES_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          nodes: action.response.result.data || {}
        }
      })
    case ActionTypes.GET_ALL_CLUSTER_NODES_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false,
        }
      })
    default:
      return state
  }
}

function clusterNodes(state = {}, action) {
  const { cluster, type } = action
  const defaultState = {
    isFetching: false,
    [cluster]:[],
  }
  switch (type) {
    case ActionTypes.GET_NODES_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_NODES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [cluster]: action.response.result.data || []
      })
    case ActionTypes.GET_NODES_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export function cluster_nodes(state = { cluster_nodes: {} }, action) {
  return {
    getAllClusterNodes: getAllClusterNodes(state.getAllClusterNodes, action),
    clusterNodes: clusterNodes(state.clusterNodes, action),
    changeClusterNodeSchedule: reducerFactory({
      REQUEST: ActionTypes.CHANGE_CLUSTER_NODE_SCHEDULE_REQUEST,
      SUCCESS: ActionTypes.CHANGE_CLUSTER_NODE_SCHEDULE_SUCCESS,
      FAILURE: ActionTypes.CHANGE_CLUSTER_NODE_SCHEDULE_FAILURE
    }, state.changeClusterNodeSchedule, action),
    deleteClusterNode: reducerFactory({
      REQUEST: ActionTypes.DELETE_CLUSTER_NODE_REQUEST,
      SUCCESS: ActionTypes.DELETE_CLUSTER_NODE_SUCCESS,
      FAILURE: ActionTypes.DELETE_CLUSTER_NODE_FAILURE
    }, state.deleteClusterNode, action),
    kubectlsPods: reducerFactory({
      REQUEST: ActionTypes.GET_KUBECTLS_PODS_REQUEST,
      SUCCESS: ActionTypes.GET_KUBECTLS_PODS_SUCCESS,
      FAILURE: ActionTypes.GET_KUBECTLS_PODS_FAILURE
    }, state.kubectlsPods, action, {overwrite: true}),
    addNodeCMD: reducerFactory({
      REQUEST: ActionTypes.GET_ADD_NODE_CMD_REQUEST,
      SUCCESS: ActionTypes.GET_ADD_NODE_CMD_SUCCESS,
      FAILURE: ActionTypes.GET_ADD_NODE_CMD_FAILURE
    }, state.addNodeCMD, action, {overwrite: true}),
  }
}