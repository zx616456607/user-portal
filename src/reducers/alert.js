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


 function getSettingList(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.ALERT_SETTING_LIST_QUERY_REQUEST:
      return Object.assign({}, defaultState, state, { isFetching: action.needFetching})
    case ActionTypes.ALERT_SETTING_LIST_QUERY_SUCCESS:
      return Object.assign({}, defaultState, state, { isFetching: false, result: action.response.result})
    case ActionTypes.ALERT_SETTING_LIST_QUERY_FAILURE:
      return Object.assign({}, defaultState, state, { isFetching: false})
    default:
      return state
  }
}

// 日志告警相关
// 获取所有告警规则
function getSettingRegularList(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.ALERT_SETTING_REGULARLIST_LIST_QUERY_REQUEST:
      return Object.assign({}, defaultState, state, { isFetching: action.needFetching})
    case ActionTypes.ALERT_SETTING_REGULARLIST_LIST_QUERY_SUCCESS:
      return Object.assign({}, defaultState, state, { isFetching: false, result: action.response.result})
    case ActionTypes.ALERT_SETTING_REGULARLIST_LIST_QUERY_FAILURE:
      return Object.assign({}, defaultState, state, { isFetching: false})
    default:
      return state
  }
}


function getSettingListfromserviceorapp(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.GET_SETTINGLLIST_FROM_SERVICE_APP_REQUEST:
      return Object.assign({}, defaultState, state, { isFetching: action.needFetching})
    case ActionTypes.GET_SETTINGLLIST_FROM_SERVICE_APP_SUCCESS:
      return Object.assign({}, defaultState, state, { isFetching: false, result: action.response.result.data})
    case ActionTypes.GET_SETTINGLLIST_FROM_SERVICE_APP_FAILURE:
      return Object.assign({}, defaultState, state, { isFetching: false})
    default:
      return state
  }
}

export default function alert(state = {
  recordFilters: {},
  records: {},
  invitations:{}
}, action) {
  return {
    recordFilters: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_RECORDS_FILTERS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_RECORDS_FILTERS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_RECORDS_FILTERS_FAILURE
    }, state.recordFilters, action, option),
    records: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_RECORDS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_RECORDS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_RECORDS_FAILURE
    }, state.records, action, option),
    groups: reducerFactory({
      REQUEST: ActionTypes.ALERT_GET_NOTIFY_GROUPS_REQUEST,
      SUCCESS: ActionTypes.ALERT_GET_NOTIFY_GROUPS_SUCCESS,
      FAILURE: ActionTypes.ALERT_GET_NOTIFY_GROUPS_FAILURE
    }, state.groups, action, option),
    getSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_SUCCESS,
      FAILURE: ActionTypes.ALERT_SETTING_FAILURE
    }, state.getSetting, action, option),
    addSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_ADD_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_ADD_SUCCESS,
      FAILURE: ActionTypes.ALERT_SETTING_ADD_FAILURE
    }, state.addSetting, action, option),
    settingList: getSettingList(state.settingList, action),
    settingRegularList: getSettingRegularList(state.settingRegularList, action),
    SettingListfromserviceorapp: getSettingListfromserviceorapp(state.SettingListfromserviceorapp, action),
    deleteSetting: reducerFactory({
      REQUEST: ActionTypes.ALERT_DELETE_SETTING_REQUEST,
      SUCCESS: ActionTypes.ALERT_DELETE_SETTING_SUCCESS,
      FAILURE: ActionTypes.ALERT_DELETE_SETTING_FAILURE
    }, state.deleteSetting, action, option),
    settingInstant: reducerFactory({
      REQUEST: ActionTypes.ALERT_SETTING_INSTANT_REQUEST,
      SUCCESS: ActionTypes.ALERT_SETTING_INSTANT_SUCCESS,
      FAILURE: ActionTypes.ALERT_SETTING_INSTANT_FAILURE
    }, state.settingInstant, action, {
      overwrite: false
    }),
    batchEnable: reducerFactory({
      REQUEST: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_REQUEST,
      SUCCESS: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_SUCCESS,
      FAILURE: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_FAILURE
    }, state.batchEnable, action, option),
    batchDisable: reducerFactory({
      REQUEST: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_REQUEST,
      SUCCESS: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_SUCCESS,
      FAILURE: ActionTypes.ALERT_UPDATE_SETTING_ENABLE_FAILURE
    }, state.batchDisable, action, option),
    deleteRule: reducerFactory({
      REQUEST: ActionTypes.ALERT_DELETE_RULE_REQUEST,
      SUCCESS: ActionTypes.ALERT_DELETE_RULE_SUCCESS,
      FAILURE: ActionTypes.ALERT_DELETE_RULE_FAILURE
    }, state.deleteRule, action),
    invitations: reducerFactory({
      REQUEST: ActionTypes.SEND_INVITATIONS_REQUEST,
      SUCCESS: ActionTypes.SEND_INVITATIONS_SUCCESS,
      FAILURE: ActionTypes.SEND_INVITATIONS_FAILURE
    }, state.invitations, action, option)
  }
}
