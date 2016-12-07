/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-12-07
 * @author mengyuan
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const CONSUMPTION_DETAIL_REQUEST = 'CONSUMPTION_DETAIL_REQUEST'
export const CONSUMPTION_DETAIL_SUCCESS = 'CONSUMPTION_DETAIL_SUCCESS'
export const CONSUMPTION_DETAIL_FAILURE = 'CONSUMPTION_DETAIL_FAILURE'

function fetchDetail(from, size) {
  let query = {}
  if (from) {
    query.from = from
  }
  if (size) {
    query.size = size
  }
  const queryStr = toQuerystring(query)
  const endpoint = `${API_URL_PREFIX}/consumptions/detail` + (queryStr != '' ? `?${queryStr}` : '')
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_DETAIL_REQUEST, CONSUMPTION_DETAIL_SUCCESS, CONSUMPTION_DETAIL_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadConsumptionDetail(from, size) {
  return (dispatch, getState) => {
    return dispatch(fetchDetail(from, size))
  }
}


export const CONSUMPTION_TREND_REQUEST = 'CONSUMPTION_TREND_REQUEST'
export const CONSUMPTION_TREND_SUCCESS = 'CONSUMPTION_TREND_SUCCESS'
export const CONSUMPTION_TREND_FAILURE = 'CONSUMPTION_TREND_FAILURE'

function fetchTrend() {
  const endpoint = `${API_URL_PREFIX}/consumptions/trend`
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_TREND_REQUEST, CONSUMPTION_TREND_SUCCESS, CONSUMPTION_TREND_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadConsumptionTrend() {
  return (dispatch, getState) => {
    return dispatch(fetchTrend())
  }
}