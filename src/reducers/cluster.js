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
import remove from 'lodash/remove'

const option = {
  overwrite: true
}

export default function cluster(state = {
  clusters: [],
  podeList: {},
  hostCpuMetrics: {},
  hostMemoryMetrics: {},
  networkReceived: {},
  networkTransmitted: {},
}, action) {
  return {
    clusters: reducerFactory({
      REQUEST: ActionTypes.CLUSTER_LIST_REQUEST,
      SUCCESS: ActionTypes.CLUSTER_LIST_SUCCESS,
      FAILURE: ActionTypes.CLUSTER_LIST_FAILURE,
    }, state.clusters, action, option),
    hostInfo: reducerFactory({
      REQUEST: ActionTypes.GET_HOST_INFO_REQUEST,
      SUCCESS: ActionTypes.GET_HOST_INFO_SUCCESS,
      FAILURE: ActionTypes.GET_HOST_INFO_FAILURE,
    }, state.hostInfo, action, option),
    podeList: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_DETAIL_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_DETAIL_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_DETAIL_FAILURE,
    }, state.podeList, action, option),
    staticInfo: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_STATIC_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_STATIC_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_STATIC_FAILURE,
    }, state.staticInfo, action, option),
    dynamicInfo: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_DYNAMIC_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_DYNAMIC_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_DYNAMIC_FAILURE,
    }, state.dynamicInfo, action, option),
    hostCpuMetrics: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_CPU_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_CPU_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_CPU_FAILURE,
    }, state.hostCpuMetrics, action, option),
    hostMemoryMetrics: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_MEMORY_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_MEMORY_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_MEMORY_FAILURE,
    }, state.hostMemoryMetrics, action, option),
  }
}
