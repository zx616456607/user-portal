/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux actions
 * 
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'
export const RC_LIST_REQUEST = 'RC_LIST_REQUEST'
export const RC_LIST_SUCCESS = 'RC_LIST_SUCCESS'
export const RC_LIST_FAILURE = 'RC_LIST_FAILURE'

// Fetches repository list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRcList(master) {
  return {
    master,
    [FETCH_API]: {
      types: [ RC_LIST_REQUEST, RC_LIST_SUCCESS, RC_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/containers/${master}/list`,
      schema: Schemas.CONTAINERS
    }
  }
}

// Fetches repositories list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadRcList(master, requiredFields = []) {
  return (dispatch, getState) => {
    const containerList = getState().containerList
    /*if (repos && requiredFields.every(key => repos.hasOwnProperty(key))) {
      return null
    }*/

    return dispatch(fetchRcList(master))
  }
}

export const TRANSH_RC_LIST_REQUEST = 'TRANSH_RC_LIST_REQUEST'
export const TRANSH_RC_LIST_SUCCESS = 'TRANSH_RC_LIST_SUCCESS'
export const TRANSH_RC_LIST_FAILURE = 'TRANSH_RC_LIST_FAILURE'

// Fetches repository list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTranshRcList(master) {
  return {
    master,
    [FETCH_API]: {
      types: [ TRANSH_RC_LIST_REQUEST, TRANSH_RC_LIST_SUCCESS, TRANSH_RC_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/containers/${master}/recycle_bin`,
      schema: Schemas.TRANSH_RCS
    }
  }
}

// Fetches repositories list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTranshRcList(master, requiredFields = []) {
  return (dispatch, getState) => {
    const transhRcs = getState().transhRcs
    /*if (repos && requiredFields.every(key => repos.hasOwnProperty(key))) {
      return null
    }*/

    return dispatch(fetchTranshRcList(master))
  }
}

// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}


export const STORAGE_LIST_REQUEST = 'STORAGE_LIST_REQUEST' 
export const STORAGE_LIST_SUCCESS = 'STORAGE_LIST_SUCCESS' 
export const STORAGE_LIST_FAILURE = 'STORAGE_LIST_FAILURE' 