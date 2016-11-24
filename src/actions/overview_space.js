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

export const OVERVIEW_SPACE_CICD_REQUEST = 'OVERVIEW_SPACE_CICD_REQUEST'
export const OVERVIEW_SPACE_CICD_SUCCESS = 'OVERVIEW_SPACE_CICD_SUCCESS'
export const OVERVIEW_SPACE_CICD_FAILURE = 'OVERVIEW_SPACE_CICD_FAILURE'

// Fetches space CICD stats from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceCICDStats() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_CICD_REQUEST, OVERVIEW_SPACE_CICD_SUCCESS, OVERVIEW_SPACE_CICD_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/stats`,
      schema: {}
    }
  }
}

// Fetches space CICD stats from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceCICDStats() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceCICDStats())
  }
}

export const OVERVIEW_SPACE_IMAGE_REQUEST = 'OVERVIEW_SPACE_IMAGE_REQUEST'
export const OVERVIEW_SPACE_IMAGE_SUCCESS = 'OVERVIEW_SPACE_IMAGE_SUCCESS'
export const OVERVIEW_SPACE_IMAGE_FAILURE = 'OVERVIEW_SPACE_IMAGE_FAILURE'

// Fetches space image stats from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceImageStats() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_IMAGE_REQUEST, OVERVIEW_SPACE_IMAGE_SUCCESS, OVERVIEW_SPACE_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/:registry/stats`,
      schema: {}
    }
  }
}

// Fetches space image stats from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceImageStats() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceImageStats())
  }
}

export const OVERVIEW_SPACE_TEMPLATE_REQUEST = 'OVERVIEW_SPACE_TEMPLATE_REQUEST'
export const OVERVIEW_SPACE_TEMPLATE_SUCCESS = 'OVERVIEW_SPACE_TEMPLATE_SUCCESS'
export const OVERVIEW_SPACE_TEMPLATE_FAILURE = 'OVERVIEW_SPACE_TEMPLATE_FAILURE'

// Fetches space template stats from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceTemplateStats() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_TEMPLATE_REQUEST, OVERVIEW_SPACE_TEMPLATE_SUCCESS, OVERVIEW_SPACE_TEMPLATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/templates`,
      schema: {}
    }
  }
}

// Fetches space template stats from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceTemplateStats() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceTemplateStats())
  }
}