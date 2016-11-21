/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'


export const OVERVIEW_SPACE_OPERATIONS_REQUEST = 'OVERVIEW_SPACE_OPERATIONS_REQUEST'
export const OVERVIEW_SPACE_OPERATIONS_SUCCESS = 'OVERVIEW_SPACE_OPERATIONS_SUCCESS'
export const OVERVIEW_SPACE_OPERATIONS_FAILURE = 'OVERVIEW_SPACE_OPERATIONS_FAILURE'

// Fetches space operations from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceOperations() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_OPERATIONS_REQUEST, OVERVIEW_SPACE_OPERATIONS_SUCCESS, OVERVIEW_SPACE_OPERATIONS_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/operations`,
      schema: {}
    }
  }
}

// Fetches space operations from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceOperations() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceOperations())
  }
}