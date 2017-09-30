/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for clean tool
 *
 * v0.1 - 2017-09-28
 * @author zhangxuan
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const FETCH_CLEAN_REQUEST = 'FETCH_CLEAN_REQUEST'
export const FETCH_CLEAN_SUCCESS = 'FETCH_CLEAN_SUCCESS'
export const FETCH_CLEAN_FAILURE = 'FETCH_CLEAN_FAILURE'

function fetchClean(target, type, body, callback) {
  return {
    [FETCH_API]: {
      types: [FETCH_CLEAN_REQUEST,FETCH_CLEAN_SUCCESS,FETCH_CLEAN_FAILURE],
      endpoint: `${API_URL_PREFIX}/cleaner/${target}/${type}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function startClean(target, type, body, callback) {
  return dispatch => {
    return dispatch(fetchClean(target, type, body, callback))
  }
}

export const FETCH_CLEAN_SETTINGS_REQUEST = 'FETCH_CLEAN_SETTINGS_REQUEST'
export const FETCH_CLEAN_SETTINGS_SUCCESS = 'FETCH_CLEAN_SETTINGS_SUCCESS'
export const FETCH_CLEAN_SETTINGS_FAILURE = 'FETCH_CLEAN_SETTINGS_FAILURE'

function fetchCleanSettings(callback) {
  return {
    [FETCH_API]: {
      types: [FETCH_CLEAN_SETTINGS_REQUEST,FETCH_CLEAN_SETTINGS_SUCCESS,FETCH_CLEAN_SETTINGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/cleaner/settings`,
      schema: {}
    },
    callback
  }
}

export function getCleanSettings(callback) {
  return dispatch => {
    return dispatch(fetchCleanSettings(callback))
  }
}

export const FETCH_CLEAN_LOGS_REQUEST = 'FETCH_CLEAN_LOGS_REQUEST'
export const FETCH_CLEAN_LOGS_SUCCESS = 'FETCH_CLEAN_LOGS_SUCCESS'
export const FETCH_CLEAN_LOGS_FAILURE = 'FETCH_CLEAN_LOGS_FAILURE'

function fetchCleanLogs(query, callback) {
  let endpoint = `${API_URL_PREFIX}/cleaner/logs`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [FETCH_CLEAN_LOGS_REQUEST,FETCH_CLEAN_LOGS_SUCCESS,FETCH_CLEAN_LOGS_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getCleanLogs(query, callback) {
  return dispatch => {
    return dispatch(fetchCleanLogs(query, callback))
  }
}

export const START_CLEAN_SYSTEM_LOGS_REQUEST = 'START_CLEAN_SYSTEM_LOGS_REQUEST'
export const START_CLEAN_SYSTEM_LOGS_SUCCESS = 'START_CLEAN_SYSTEM_LOGS_SUCCESS'
export const START_CLEAN_SYSTEM_LOGS_FAILURE = 'START_CLEAN_SYSTEM_LOGS_FAILURE'

function startCleanSystemLogs(body, callback) {
  return {
    [FETCH_API]: {
      types: [START_CLEAN_SYSTEM_LOGS_REQUEST,START_CLEAN_SYSTEM_LOGS_SUCCESS,START_CLEAN_SYSTEM_LOGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/cleaner/logs`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }  
}

export function cleanSystemLogs(body, callback) {
  return dispatch => {
    return dispatch(startCleanSystemLogs(body, callback))
  }
}

export const  START_CLEAN_MONITOR_REQUEST = 'START_CLEAN_MONITOR_REQUEST'
export const  START_CLEAN_MONITOR_SUCCESS = 'START_CLEAN_MONITOR_SUCCESS'
export const  START_CLEAN_MONITOR_FAILURE = 'START_CLEAN_MONITOR_FAILURE'

function startCleanMonitor(query, callback) {
  let endpoint = `${API_URL_PREFIX}/cleaner/monitor`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [START_CLEAN_MONITOR_REQUEST,START_CLEAN_MONITOR_SUCCESS,START_CLEAN_MONITOR_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'PUT'
      }
    },
    callback
  }
}

export function cleanMonitor(query, callback) {
  return dispatch => {
    return dispatch(startCleanMonitor(query, callback))
  }
}

export const FETCH_CLEAN_SYSTEM_RECORDS_REQUEST = 'FETCH_CLEAN_SYSTEM_RECORDS_REQUEST'
export const FETCH_CLEAN_SYSTEM_RECORDS_SUCCESS = 'FETCH_CLEAN_SYSTEM_RECORDS_SUCCESS'
export const FETCH_CLEAN_SYSTEM_RECORDS_FAILURE = 'FETCH_CLEAN_SYSTEM_RECORDS_FAILURE'

function fetchSystemCleanLogs(query, body, callback) {
  let endpoint = `${API_URL_PREFIX}/cleaner/records`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [FETCH_CLEAN_SYSTEM_RECORDS_REQUEST,FETCH_CLEAN_SYSTEM_RECORDS_SUCCESS,FETCH_CLEAN_SYSTEM_RECORDS_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function getSystemCleanLogs(query, body, callback) {
  return dispatch => {
    return dispatch(fetchSystemCleanLogs(query, body, callback))
  }
}