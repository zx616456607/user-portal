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
    cluster,
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
          end_time: body.end_time
        }
      },
      schema: {}
    },
    callback
  }
}

export function getOperationLogList(cluster, callback) {
  return (dispatch) => {
    return dispatch(fetchOperationLogList(cluster, callback))
  }
}