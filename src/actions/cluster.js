/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster actions
 *
 * v0.1 - 2016-11-12
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const CLUSTER_LIST_REQUEST = 'CLUSTER_LIST_REQUEST'
export const CLUSTER_LIST_SUCCESS = 'CLUSTER_LIST_SUCCESS'
export const CLUSTER_LIST_FAILURE = 'CLUSTER_LIST_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CLUSTER_LIST_REQUEST, CLUSTER_LIST_SUCCESS, CLUSTER_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches clusters list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterList(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterList(query, callback))
  }
}