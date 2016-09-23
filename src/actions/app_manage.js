/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux actions for app manage
 * 
 * v0.1 - 2016-09-123
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const APP_LIST_REQUEST = 'APP_LIST_REQUEST'
export const APP_LIST_SUCCESS = 'APP_LIST_SUCCESS'
export const APP_LIST_FAILURE = 'APP_LIST_FAILURE'

// Fetches repository list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAppList(master) {
  return {
    master,
    [FETCH_API]: {
      types: [ APP_LIST_REQUEST, APP_LIST_SUCCESS, APP_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${master}/apps`,
      schema: Schemas.APPS
    }
  }
}

// Fetches repositories list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAppList(master, requiredFields = []) {
  return (dispatch, getState) => {
    const containerList = getState().appsList
    return dispatch(fetchAppList(master))
  }
}

export const CONTAINER_LIST_REQUEST = 'CONTAINER_LIST_REQUEST'
export const CONTAINER_LIST_SUCCESS = 'CONTAINER_LIST_SUCCESS'
export const CONTAINER_LIST_FAILURE = 'CONTAINER_LIST_FAILURE'

// Fetches repository list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchContainerList(master, appName) {
  return {
    master,
    appName,
    [FETCH_API]: {
      types: [ CONTAINER_LIST_REQUEST, CONTAINER_LIST_SUCCESS, CONTAINER_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${master}/apps/${appName}/containers`,
      schema: Schemas.CONTAINERS
    }
  }
}

// Fetches repositories list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadContainerList(master, appName, requiredFields = []) {
  return (dispatch, getState) => {
    const containerList = getState().appsList
    return dispatch(fetchContainerList(master, appName))
  }
}