/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux actions for app manage
 * 
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const IMAGE_TOP_LIST_REQUEST = 'IMAGE_TOP_LIST_REQUEST'
export const IMAGE_TOP_LIST_SUCCESS = 'IMAGE_TOP_LIST_SUCCESS'
export const IMAGE_TOP_LIST_FAILURE = 'IMAGE_TOP_LIST_FAILURE'

// Fetches app list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppList(registry) {
  return {
    registry,
    [FETCH_API]: {
      types: [ IMAGE_TOP_LIST_REQUEST, IMAGE_TOP_LIST_SUCCESS, IMAGE_TOP_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/apps`,
      schema: Schemas.APPS
    }
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAppList(registry, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchAppList(registry))
  }
}