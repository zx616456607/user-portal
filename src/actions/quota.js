/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Quota
 *
 * v0.1 - 2017-09-25
 * @author Zhaoyb
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const FETCH_QUOTA_REQUEST = 'FETCH_QUOTA_REQUEST'
export const FETCH_QUOTA_SUCCESS = 'FETCH_QUOTA_SUCCESS'
export const FETCH_QUOTA_FAILURE = 'FETCH_QUOTA_FAILURE'

// Fetches get quota from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${query.id}/resourcequota`
  return {
    [FETCH_API]: {
      types: [FETCH_QUOTA_REQUEST, FETCH_QUOTA_SUCCESS, FETCH_QUOTA_FAILURE],
      endpoint,
      options: {
        method: 'GET',
      },
      schema: {},
    },
    callback
  }
}

// Fetches get quota from API
// Relies on Redux Thunk middleware.
export function getQuota(query, callback) {
  return (dispatch) => {
    return dispatch(fetchQuota(query, callback))
  }
}

export const UPDATE_QUOTA_REQUEST = 'UPDATE_QUOTA_REQUEST'
export const UPDATE_QUOTA_SUCCESS = 'UPDATE_QUOTA_SUCCESS'
export const UPDATE_QUOTA_FAILURE = 'UPDATE_QUOTA_FAILURE'

function updateQuota(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${query.id}/resourcequota`
  let body = query.body
  return {
    [FETCH_API]: {
      types: [UPDATE_QUOTA_REQUEST, UPDATE_QUOTA_SUCCESS, UPDATE_QUOTA_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        body,
      },
      schema: {},
    },
    callback
  }
}

export function putQuota(query, callback) {
  return (dispatch) => {
    return dispatch(updateQuota(query, callback))
  }
}
