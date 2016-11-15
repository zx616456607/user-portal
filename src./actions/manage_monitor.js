/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for manage monitor
 *
 * v0.1 - 2016-11-01
 * @author GaoJian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const GET_MANAGE_MONITOR_LOG_REQUEST = 'GET_MANAGE_MONITOR_LOG_REQUEST'
export const GET_MANAGE_MONITOR_LOG_SUCCESS = 'GET_MANAGE_MONITOR_LOG_SUCCESS'
export const GET_MANAGE_MONITOR_LOG_FAILURE = 'GET_MANAGE_MONITOR_LOG_FAILURE'

function fetchOperationLogList(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_MANAGE_MONITOR_LOG_REQUEST, GET_MANAGE_MONITOR_LOG_SUCCESS, GET_MANAGE_MONITOR_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/manage-monitor/getOperationAuditLog`,
      options: {
        method: 'POST',
        body: {
          from: body.from,
          size: body.size,
          namespace: body.namespace,
          operation: body.operation,
          resource: body.resource,
          start_time: body.start_time,
          end_time: body.end_time,
          status: body.status
        }
      },
      schema: {}
    },
    callback
  }
}

export function getOperationLogList(body, callback) {
  return (dispatch) => {
    return dispatch(fetchOperationLogList(body, callback))
  }
}

export const GET_QUERY_LOG_REQUEST = 'GET_QUERY_LOG_REQUEST'
export const GET_QUERY_LOG_SUCCESS = 'GET_QUERY_LOG_SUCCESS'
export const GET_QUERY_LOG_FAILURE = 'GET_QUERY_LOG_FAILURE'

function fetchQueryLogList(cluster, instances, body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_QUERY_LOG_REQUEST, GET_QUERY_LOG_SUCCESS, GET_QUERY_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/instances/${instances}/getSearchLog`,
      options: {
        method: 'POST',
        body: {
          kind: 'pod',
          from: body.from,
          size: body.size,
          keyword: body.keyword,
          date_start: body.date_start,
          date_end: body.date_end,
        }
      },
      schema: {}
    },
    callback
  }
}

export function getQueryLogList(cluster, instances, body, callback) {
  return (dispatch) => {
    return dispatch(fetchQueryLogList(cluster, instances, body, callback))
  }
}

export const GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST = 'GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST'
export const GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS = 'GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS'
export const GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE = 'GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE'

function fetchClusterOfQueryLog(teamId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST, GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS, GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/manage-monitor/${teamId}/getClusterOfQueryLog`,
      schema: {}
    },
    callback
  }
}

export function getClusterOfQueryLog(teamId, callback) {
  return (dispatch) => {
    return dispatch(fetchClusterOfQueryLog(teamId, callback))
  }
}

export const GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST = 'GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST'
export const GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS = 'GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS'
export const GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE = 'GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE'

function fetchServiceOfQueryLog(clusterId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST, GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS, GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/manage-monitor/${clusterId}/getServiceOfQueryLog`,
      schema: {}
    },
    callback
  }
}

export function getServiceOfQueryLog(clusterId, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceOfQueryLog(clusterId, callback))
  }
}