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
    [cluster]: [],
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

function addNodeCMD(state = {}, action) {
  const { cluster, type } = action
  const defaultState = {
    isFetching: false,
    [cluster]: {},
  }
  switch (type) {
    case ActionTypes.GET_ADD_NODE_CMD_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_ADD_NODE_CMD_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [cluster]: action.response.result || {}
      })
    case ActionTypes.GET_ADD_NODE_CMD_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function clusterLabel(state = {}, action) {
  const cluster = action.cluster
  switch (action.type) {
    case ActionTypes.GET_CLOUSTER_LABEL_REQUEST: {
      return merge({}, state, {
        [cluster]: {isFetching: true}
      })
    }
    case ActionTypes.GET_CLOUSTER_LABEL_SUCCESS: {
      return Object.assign({}, state, {
        [cluster]:{
          isFetching: false,
          result: action.response.result,
          back: cloneDeep(action.response.result)
        }
      })
    }
    case ActionTypes.GET_CLOUSTER_LABEL_FAILURE: {
      return Object.assign({}, state, {
         [cluster]:{
          isFetching: false,
          back: {summary:[]},
          result: {summary:[]}
         }
      })
    }
    // add labels
    case ActionTypes.ADD_LABELS_SUCCESS: {
      const oldState = cloneDeep(state)
      const mergeMap = action.response.result.data
      mergeMap.map((item)=>{
        oldState[cluster].back.summary.unshift(item)
      })
      const newState = oldState[cluster].back.summary
      oldState[cluster].result.summary = oldState[cluster].back.summary = newState
      return oldState
    }

    // delete labels or edit labels
    case ActionTypes.EDIT_LABELS_SUCCESS: {
      if (action.methodType == 'DELETE') {
        const newState = cloneDeep(state)
        const data = newState[cluster].result.summary
        data.forEach((list, index) => {
          if (list.id == action.id) {
            data.splice(index, 1)
            newState[cluster].back.summary.splice(index, 1)
          }
        })
        return newState
      }
      return state
    }
    // search labels
    case ActionTypes.SEARCH_CLUSTER_LABLELS: {
      const oldState = cloneDeep(state)
      const searchKey = action.search
      if (searchKey == '') {
        oldState[cluster].result.summary = state[cluster].back.summary
        return oldState
      }
      const newState = state[cluster].back.summary.filter((item) => {
        if (item.key.indexOf(searchKey) > -1 || item.value.indexOf(searchKey) > -1) {
          return item
        }
        return false
      })
      oldState[cluster].result.summary = newState
      return oldState
    }
    default:
      return state
  }
}

export function cluster_nodes(state = { cluster_nodes: {}, clusterLabel: {} }, action) {
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
    }, state.kubectlsPods, action, { overwrite: true }),
    addNodeCMD: addNodeCMD(state.addNodeCMD, action),
    clusterLabel: clusterLabel(state.clusterLabel, action)
  }
}