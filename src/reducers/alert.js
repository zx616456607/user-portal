/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author mengyuan
 */
'use strict'

import * as ActionTypes from '../actions/alert'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function alert(state = {
  recordFilters: {},
  records: {},
  groups: {},
}, action) {
  return {
    recordFilters: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_RECORDS_FILTERS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_RECORDS_FILTERS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_RECORDS_FILTERS_FAILURE,
    }, state.recordFilters, action, option),
    records: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_RECORDS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_RECORDS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_RECORDS_FAILURE,
    }, state.records, action, option),
    groups: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_NOTIFY_GROUPS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_NOTIFY_GROUPS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_NOTIFY_GROUPS_FAILURE,
    }, state.groups, action, option),
    getSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_SUCCESS,
      FAILURE: ActionTypes.ALERT_SETTING_FAILURE
    }, state.getSetting, action, option),
    addSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_ADD_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_ADD_REQUEST,
      FAILURE: ActionTypes.ALERT_SETTING_ADD_REQUEST
    }, state.addSetting, action, option)
  }
}
