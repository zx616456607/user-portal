/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for cluster overview
 *
 * v0.1 - 2016-12-07
 * @author mengyuan
 */

import * as ActionTypes from '../actions/consumption'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function detail(state = {
  detail: {},
  trend: {},
  spaceSummaryInDay: {},
  spaceSummary: {},
 }, action) {
  return {
    detail: reducerFactory({
      REQUEST: ActionTypes.CONSUMPTION_DETAIL_REQUEST,
      SUCCESS: ActionTypes.CONSUMPTION_DETAIL_SUCCESS,
      FAILURE: ActionTypes.CONSUMPTION_DETAIL_FAILURE,
    }, state.detail, action, option),
    trend: reducerFactory({
      REQUEST: ActionTypes.CONSUMPTION_TREND_REQUEST,
      SUCCESS: ActionTypes.CONSUMPTION_TREND_SUCCESS,
      FAILURE: ActionTypes.CONSUMPTION_TREND_FAILURE,
    }, state.trend, action, option),
    spaceSummaryInDay: reducerFactory({
      REQUEST: ActionTypes.CONSUMPTION_SPACE_SUMMARY_DAY_REQUEST,
      SUCCESS: ActionTypes.CONSUMPTION_SPACE_SUMMARY_DAY_SUCCESS,
      FAILURE: ActionTypes.CONSUMPTION_SPACE_SUMMARY_DAY_FAILURE,
    }, state.spaceSummaryInDay, action, option),
    spaceSummary: reducerFactory({
      REQUEST: ActionTypes.CONSUMPTION_SPACE_SUMMARY_REQUEST,
      SUCCESS: ActionTypes.CONSUMPTION_SPACE_SUMMARY_SUCCESS,
      FAILURE: ActionTypes.CONSUMPTION_SPACE_SUMMARY_FAILURE,
    }, state.spaceSummary, action, option),
  }
}