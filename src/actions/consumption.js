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

function fetchDetail(from, size, timeBegin, timeEnd) {
  let query = {}
  if (from) {
    query.from = from
  }
  if (size) {
    query.size = size
  }
  if (timeBegin) {
    query.timeBegin = timeBegin
  }
  if (timeEnd) {
    query.timeEnd = timeEnd
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

export function loadConsumptionDetail(from, size, timeBegin, timeEnd) {
  return (dispatch, getState) => {
    return dispatch(fetchDetail(from, size, timeBegin, timeEnd))
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

export const CONSUMPTION_SPACE_SUMMARY_DAY_REQUEST = 'CONSUMPTION_SPACE_SUMMARY_DAY_REQUEST'
export const CONSUMPTION_SPACE_SUMMARY_DAY_SUCCESS = 'CONSUMPTION_SPACE_SUMMARY_DAY_SUCCESS'
export const CONSUMPTION_SPACE_SUMMARY_DAY_FAILURE = 'CONSUMPTION_SPACE_SUMMARY_DAY_FAILURE'

function fetchSpaceSummaryInDay(month) {
  let endpoint = `${API_URL_PREFIX}/consumptions/summary`
  if (month) {
    endpoint += `?month=${month}`
  }
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_SPACE_SUMMARY_DAY_REQUEST, CONSUMPTION_SPACE_SUMMARY_DAY_SUCCESS, CONSUMPTION_SPACE_SUMMARY_DAY_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadSpaceSummaryInDay(month) {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceSummaryInDay(month))
  }
}

export const CONSUMPTION_SPACE_SUMMARY_REQUEST = 'CONSUMPTION_SPACE_SUMMARY_REQUEST'
export const CONSUMPTION_SPACE_SUMMARY_SUCCESS = 'CONSUMPTION_SPACE_SUMMARY_SUCCESS'
export const CONSUMPTION_SPACE_SUMMARY_FAILURE = 'CONSUMPTION_SPACE_SUMMARY_FAILURE'

function fetchSpaceSummary(month) {
  let endpoint = `${API_URL_PREFIX}/consumptions/summary`
  if (month) {
    endpoint += `?month=${month}`
  }
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_SPACE_SUMMARY_REQUEST, CONSUMPTION_SPACE_SUMMARY_SUCCESS, CONSUMPTION_SPACE_SUMMARY_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadSpaceSummary(month) {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceSummary(month))
  }
}


export const CONSUMPTION_TEAM_SUMMARY_REQUEST = 'CONSUMPTION_TEAM_SUMMARY_REQUEST'
export const CONSUMPTION_TEAM_SUMMARY_SUCCESS = 'CONSUMPTION_TEAM_SUMMARY_SUCCESS'
export const CONSUMPTION_TEAM_SUMMARY_FAILURE = 'CONSUMPTION_TEAM_SUMMARY_FAILURE'

function fetchTeamSummary(teamspace, month) {
  let endpoint = `${API_URL_PREFIX}/consumptions/summary?source=team`
  if (month) {
    endpoint += `&month=${month}`
  }
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_TEAM_SUMMARY_REQUEST, CONSUMPTION_TEAM_SUMMARY_SUCCESS, CONSUMPTION_TEAM_SUMMARY_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        headers: {
          teamspace
        }
      }
    }
  }
}

export function loadTeamSummary(teamspace, month) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamSummary(teamspace, month))
  }
}
export const CONSUMPTION_GET_CHARGE_RECORD_REQUEST = 'CONSUMPTION_GET_CHARGE_RECORD_REQUEST'
export const CONSUMPTION_GET_CHARGE_RECORD_SUCCESS = 'CONSUMPTION_GET_CHARGE_RECORD_SUCCESS'
export const CONSUMPTION_GET_CHARGE_RECORD_FAILURE = 'CONSUMPTION_GET_CHARGE_RECORD_FAILURE'

function fetchChargeRecord() {
  const endpoint = `${API_URL_PREFIX}/consumptions/charge-history?size=100`
  return {
    [FETCH_API]: {
      types: [CONSUMPTION_GET_CHARGE_RECORD_REQUEST, CONSUMPTION_GET_CHARGE_RECORD_SUCCESS, CONSUMPTION_GET_CHARGE_RECORD_FAILURE],
      endpoint: endpoint,
      schema: {},
    }
  }
}

export function loadChargeRecord() {
  return (dispatch, getState) => {
    return dispatch(fetchChargeRecord())
  }
}