/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster reducer
 *
 * v0.1 - 2016-11-12
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/cluster'
import reducerFactory from './factory'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import { CHECK_HOSTINFO_REQUEST } from '../actions/cluster'
import { CLUSTER_IS_CREATING } from '../actions/cluster'

const option = {
  overwrite: true
}

function clusters(state = {}, action) {
  const defaultState = {
    isFetching: false,
    clusterList: []
  }
  switch (action.type) {
    case ActionTypes.CLUSTER_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: (
          state && state.clusterList
          ? false
          : true
        )
      })
    case ActionTypes.CLUSTER_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        license: action.response.result.license || {},
        clusterList: action.response.result.data || [],
      })
    case ActionTypes.CLUSTER_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function clusterSummary(state = {}, action) {
  const { cluster } = action
  const defaultState = {
    [cluster]: {
      isFetching: false,
      summary: {}
    }
  }
  switch (action.type) {
    case ActionTypes.GET_CLUSTER_SUMMARY_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true,
        }
      })
    case ActionTypes.GET_CLUSTER_SUMMARY_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          summary: action.response.result
        }
      })
    case ActionTypes.GET_CLUSTER_SUMMARY_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false,
        }
      })
    default:
      return state
  }
}

function podeList(state={}, action) {
  const defaultState = {
    result:{ pods:[] }
  }
  switch(action.type) {
    case ActionTypes.GET_CLUSTER_DETAIL_REQUEST:{
      return merge({}, defaultState, state, {
        isFetching: true
      })
    }
    case ActionTypes.GET_CLUSTER_DETAIL_SUCCESS: {
      const bakList = cloneDeep(action.response.result)
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result,
        bakList
      })
    }
    case ActionTypes.GET_CLUSTER_DETAIL_FAILURE: {
      return merge({}, defaultState, state, {
        isFetching: false
      })
    }
    case ActionTypes.SEARCH_NODE_PODLIST: {// search pods list
      const podName = action.podName
      const newState = cloneDeep(state)
      if (podName == '') {
        newState.result = state.bakList
        return newState
      }
      const temp = state.bakList.pods.filter(list => {
        const search = new RegExp(podName)
        if (search.test(list.objectMeta.name)) {
          return true
        }
        return false
      })
      newState.result.pods = temp
      return newState
    }
    default:
      return state
  }
}

function getProxy(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch (action.type) {
  case ActionTypes.PROXY_GET_REQUEST:
    return merge({}, defaultState, state, {
      isFetching: action.needFetching
    })
  case ActionTypes.PROXY_GET_SUCCESS:
    return Object.assign({}, state, { result: Object.assign(state.result || {}, action.response.result)}, {
      isFetching: false
    })
  case ActionTypes.PROXY_GET_FAILURE:
    return merge({}, defaultState, state, {
      isFetching: false
    })
  default:
    return state
  }
}

function clusterStorage(state = {}, action){
  const cluster = action.cluster
  switch(action.type){
    case ActionTypes.GET_CLUSTER_STORAGE_LIST_REQUEST:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: state[cluster] && state[cluster] ? false : true,
          cephList: state[cluster] && state[cluster].cephList ? state[cluster].cephList : [],
          nfsList: state[cluster] && state[cluster].nfsList ? state[cluster].nfsList : [],
          glusterfsList: state[cluster] && state[cluster].glusterfsList ? state[cluster].glusterfsList : [],
        }
      })
    case ActionTypes.GET_CLUSTER_STORAGE_LIST_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cephList: action.response.result.data.cephList || [],
          nfsList: action.response.result.data.nfsList || [],
          glusterfsList: action.response.result.data.glusterfsList || [],
        }
      })
    case ActionTypes.GET_CLUSTER_STORAGE_LIST_FAILURE:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cephList: [],
          nfsList: [],
          glusterfsList: [],
        }
      })
    default:
      return state
  }
}

function kubeproxy(state = {}, action){
  const cluster = action.cluster
  switch(action.type){
    case ActionTypes.GET_KUBEPROXY_REQUEST:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: true,
        }
      })
    case ActionTypes.GET_KUBEPROXY_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          data: action.response.result
        }
      })
    case ActionTypes.GET_KUBEPROXY_FAILURE:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
        }
      })
    default:
      return state
  }
}

function createFailedData(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_CREATE_CLUSTER_FAILED_DATA_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.GET_CREATE_CLUSTER_FAILED_DATA_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.GET_CREATE_CLUSTER_FAILED_DATA_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    case ActionTypes.CLEAR_CREATE_CLUSTER_FAILED_DATA:
      return {
        isFetching: false,
        data: {},
      }
    default:
      return state
  }
}

function clusterDetail(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_CLUSTER_DETAIL_DATA_REQUEST:
      return Object.assign({}, {
        [action.cluster]: {
          ...state[action.cluster],
          isFetching: true,
        }
      })
    case ActionTypes.GET_CLUSTER_DETAIL_DATA_SUCCESS:
      return Object.assign({}, {
        [action.cluster]: {
          ...state[action.cluster],
          isFetching: false,
          data: action.response.result.data,
        }
      })
    case ActionTypes.GET_CLUSTER_DETAIL_DATA_FAILURE:
      return Object.assign({}, {
        [action.cluster]: {
          isFetching: false,
        }
      })
    default:
      return state
  }
}

function checkHostInfo(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CHECK_HOSTINFO_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.CHECK_HOSTINFO_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.CHECK_HOSTINFO_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function creatingClusterInterval(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CREATING_CLUSTER_INTERVAL:
      return Object.assign({}, state, {
        data: action.data,
      })
    default:
      return state
  }
}

function addingHostsInterval(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADDING_HOSTS_INTERVAL:
      return Object.assign({}, state, {
        data: action.data,
      })
    default:
      return state
  }
}

function clusterActive(state = {}, action) {
  const { type, cluster } = action
  switch (type) {
    case ActionTypes.CHANGE_ACTIVE_CLUSTER:
      return Object.assign({}, state, {
        cluster,
      })
    default:
      return state
  }
}

export default function cluster(state = {
  clusters: {},
  hostMetrics: {},
  hostInfo: {},
  kubeproxy: {},
}, action) {
  return {
    clusters: clusters(state.clusters, action),
    proxy: getProxy(state.proxy, action),
    kubeproxy: kubeproxy(state.kubeproxy, action),
    createCluster: reducerFactory({
      REQUEST: ActionTypes.CREATE_CLUSTER_REQUEST,
      SUCCESS: ActionTypes.CREATE_CLUSTER_SUCCESS,
      FAILURE: ActionTypes.CREATE_CLUSTER_FAILURE,
    }, state.createCluster, action, option),
    deleteCluster: reducerFactory({
      REQUEST: ActionTypes.DELETE_CLUSTER_REQUEST,
      SUCCESS: ActionTypes.DELETE_CLUSTER_SUCCESS,
      FAILURE: ActionTypes.DELETE_CLUSTER_FAILURE,
    }, state.deleteCluster, action, option),
    addClusterCMD: reducerFactory({
      REQUEST: ActionTypes.GET_ADD_CLUSTER_CMD_REQUEST,
      SUCCESS: ActionTypes.GET_ADD_CLUSTER_CMD_SUCCESS,
      FAILURE: ActionTypes.GET_ADD_CLUSTER_CMD_FAILURE,
    }, state.addClusterCMD, action, option),
    clusterSummary: clusterSummary(state.clusterSummary, action),
    hostInfo: reducerFactory({
      REQUEST: ActionTypes.GET_HOST_INFO_REQUEST,
      SUCCESS: ActionTypes.GET_HOST_INFO_SUCCESS,
      FAILURE: ActionTypes.GET_HOST_INFO_FAILURE,
    }, state.hostInfo, action, option),
    podeList: podeList(state.podeList, action),
    hostMetrics: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_METRICS_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_METRICS_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_METRICS_FAILURE,
    }, state.hostMetrics, action, option),
    hostInstant: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_INSTANT_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_INSTANT_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_INSTANT_FAILURE,
    }, state.hostInstant, action, option),
    hostCpu: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_CPU_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_CPU_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_CPU_FAILURE
    }, state.hostCpu, action, option),
    hostMemory: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_MEMORY_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_MEMORY_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_MEMORY_FAILURE,
    }, state.hostMemory, action, option),
    hostRxRate: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_RXRATE_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_RXRATE_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_RXRATE_FAILURE
    }, state.hostRxRate, action, option),
    hostTxRate: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_TXRATE_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_TXRATE_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_TXRATE_FAILURE
    }, state.hostTxRate, action, option),
    hostReadIo: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_READIO_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_READIO_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_READIO_FAILURE
    }, state.hostReadIo, action, option),
    hostWriteIo: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_WRITEIO_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_WRITEIO_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_WRITEIO_FAILURE
    }, state.hostWriteIo, action, option),
    updateProxy: reducerFactory({
      REQUEST: ActionTypes.PROXY_UPDATE_REQUEST,
      SUCCESS: ActionTypes.PROXY_UPDATE_SUCCESS,
      FAILURE: ActionTypes.PROXY_UPDATE_FAILURE
    }, state.updateProxy, action, option),
    getClusterNodeAddr: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_NODE_ADDR_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_NODE_ADDR_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_NODE_ADDR_FAILURE
    }, state.getClusterNodeAddr, action, option),
    clusterPlugins: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_PLUGINS_FAILURE
    }, state.clusterPlugins, action),
    updateClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.UPDATE_CLUSTER_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.UPDATE_CLUSTER_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.UPDATE_CLUSTER_PLUGINS_FAILURE
    }, state.updateClusterPlugins, action, option),
    editClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.EDIT_PLUGINS_REQUERT,
      SUCCESS: ActionTypes.EDIT_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.EDIT_PLUGINS_FAILURE
    }, state.editClusterPlugins, action, option),
    deleteClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.DELETE_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.DELETE_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.DELETE_PLUGINS_FAILURE
    }, state.deleteClusterPlugins, action, option),
    createClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.CREATE_CLUSTER_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.CREATE_CLUSTER_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.CREATE_CLUSTER_PLUGINS_FAILURE
    }, state.createClusterPlugins, action, option),
    clusterStorage: clusterStorage(state.clusterStorage, action),
    createFailedData: createFailedData(state.createFailedData, action),
    clusterDetail: clusterDetail(state.clusterDetail, action),
    checkHostInfo: checkHostInfo(state.checkHostInfo, action),
    creatingClusterInterval: creatingClusterInterval(state.creatingClusterInterval, action),
    addingHostsInterval: addingHostsInterval(state.addingHostsInterval, action),
    clusterActive: clusterActive(state.clusterActive, action),
  }
}
