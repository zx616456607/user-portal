/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/24
 * @author ZhaoXueYu
 */
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX, METRICS_CPU } from '../constants'
import { toQuerystring } from '../common/tools'

export const METRICS_CPU_REQUEST = 'METRICS_CPU_REQUEST'
export const METRICS_CPU_SUCCESS = 'METRICS_CPU_SUCCESS'
export const METRICS_CPU_FAILURE = 'METRICS_CPU_FAILURE'

function fetchMetricsCPU(cluster, containerName, query = {}) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/containers/${containerName}/metrics`
  query.type = METRICS_CPU
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    containerName,
    [FETCH_API]: {
      types: [METRICS_CPU_REQUEST, METRICS_CPU_SUCCESS, METRICS_CPU_FAILURE],
      endpoint,
      schema: {}
    }
  }
}
// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadMetricsCPU(cluster, containerName, query) {
  return (dispatch) => {
    return dispatch(fetchMetricsCPU(cluster, containerName, query))
  }
}