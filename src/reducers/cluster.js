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

const option = {
  overwrite: true
}

export default function cluster(state = {
  clusters: [],
}, action) {
  return {
    clusters: reducerFactory({
      REQUEST: ActionTypes.CLUSTER_LIST_REQUEST,
      SUCCESS: ActionTypes.CLUSTER_LIST_SUCCESS,
      FAILURE: ActionTypes.CLUSTER_LIST_FAILURE
    }, state.clusters, action, option),
  }
}