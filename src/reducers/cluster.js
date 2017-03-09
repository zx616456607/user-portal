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
  clusters: {},
  podeList: {},
  hostMetrics: {},
  hostInfo: {}
}, action) {
  return {
    clusters: reducerFactory({
      REQUEST: ActionTypes.CLUSTER_LIST_REQUEST,
      SUCCESS: ActionTypes.CLUSTER_LIST_SUCCESS,
      FAILURE: ActionTypes.CLUSTER_LIST_FAILURE,
    }, state.clusters, action, option),
    addClusterCMD: reducerFactory({
      REQUEST: ActionTypes.GET_ADD_CLUSTER_CMD_REQUEST,
      SUCCESS: ActionTypes.GET_ADD_CLUSTER_CMD_SUCCESS,
      FAILURE: ActionTypes.GET_ADD_CLUSTER_CMD_FAILURE,
    }, state.addClusterCMD, action, option),
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
    hostMetrics: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_METRICS_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_METRICS_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_METRICS_FAILURE,
    }, state.hostMetrics, action, option),
  }
}
