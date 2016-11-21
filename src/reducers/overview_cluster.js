/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/overview_cluster'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function overviewCluster(state = {
  clusterOperations: {}
 }, action) {
  return {
    clusterOperations: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_OPERATIONS_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_OPERATIONS_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_OPERATIONS_FAILURE
    }, state.clusterOperations, action, option)
  }
}