/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for harbor manage
 *
 * v0.1 - 2017-06-06
 * @author Zhangpc
 */

import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const HARBOR_PROJECT_LIST_REQUEST = 'HARBOR_PROJECT_LIST_REQUEST'
export const HARBOR_PROJECT_LIST_SUCCESS = 'HARBOR_PROJECT_LIST_SUCCESS'
export const HARBOR_PROJECT_LIST_FAILURE = 'HARBOR_PROJECT_LIST_FAILURE'

// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProjectList(registry, query, callback) {
  let { customizeOpts } = query || {}
  let endpoint = `${API_URL_PREFIX}/registries/${registry}/projects`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [ HARBOR_PROJECT_LIST_REQUEST, HARBOR_PROJECT_LIST_SUCCESS, HARBOR_PROJECT_LIST_FAILURE ],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Relies on Redux Thunk middleware.
export function loadProjectList(cluster, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectList(cluster, query, callback))
  }
}