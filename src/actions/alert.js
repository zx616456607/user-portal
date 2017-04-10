/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2017-03-23
 * @author mengyuan
 */
'use strict'
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'


export const ALERT_GET_RECORDS_FILTERS_REQUEST = 'ALERT_GET_RECORDS_FILTERS_REQUEST'
export const ALERT_GET_RECORDS_FILTERS_SUCCESS = 'ALERT_GET_RECORDS_FILTERS_SUCCESS'
export const ALERT_GET_RECORDS_FILTERS_FAILURE = 'ALERT_GET_RECORDS_FILTERS_FAILURE'

function fetchRecordsFilters(clusterID) {
  clusterID = clusterID || ''
  return {
    [FETCH_API]: {
      types: [ALERT_GET_RECORDS_FILTERS_REQUEST, ALERT_GET_RECORDS_FILTERS_SUCCESS, ALERT_GET_RECORDS_FILTERS_FAILURE],
      endpoint: `${API_URL_PREFIX}/alerts/record-filters?cluster=${clusterID}`,
      schema: {}
    },
  }
}

export function loadRecordsFilters(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchRecordsFilters(clusterID))
  }
}

export const ALERT_GET_RECORDS_REQUEST = 'ALERT_GET_RECORDS_REQUEST'
export const ALERT_GET_RECORDS_SUCCESS = 'ALERT_GET_RECORDS_SUCCESS'
export const ALERT_GET_RECORDS_FAILURE = 'ALERT_GET_RECORDS_FAILURE'

function fetchRecords(query) {
  const queryStr = toQuerystring(query)
  return {
    [FETCH_API]: {
      types: [ALERT_GET_RECORDS_REQUEST, ALERT_GET_RECORDS_SUCCESS, ALERT_GET_RECORDS_FAILURE],
      endpoint: `${API_URL_PREFIX}/alerts/records?${queryStr}`,
      schema: {}
    }
  }
}

export function loadRecords(query) {
  return (dispatch, getState) => {
    return dispatch(fetchRecords(query))
  }
}

export const ALERT_DELETE_RECORDS_REQUEST = 'ALERT_DELETE_RECORDS_REQUEST'
export const ALERT_DELETE_RECORDS_SUCCESS = 'ALERT_DELETE_RECORDS_SUCCESS'
export const ALERT_DELETE_RECORDS_FAILURE = 'ALERT_DELETE_RECORDS_FAILURE'

function fetchDeleteRecords(strategyID, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/records`
  if (strategyID) {
    endpoint += `?strategyID=${strategyID}`
  }
  return {
    [FETCH_API]: {
      types: [ALERT_DELETE_RECORDS_REQUEST, ALERT_DELETE_RECORDS_SUCCESS, ALERT_DELETE_RECORDS_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  }
}

export function deleteRecords(strategyID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteRecords(strategyID, callback))
  }
}

export const ALERT_GET_NOTIFY_GROUPS_REQUEST = 'ALERT_GET_NOTIFY_GROUPS_REQUEST'
export const ALERT_GET_NOTIFY_GROUPS_SUCCESS = 'ALERT_GET_NOTIFY_GROUPS_SUCCESS'
export const ALERT_GET_NOTIFY_GROUPS_FAILURE = 'ALERT_GET_NOTIFY_GROUPS_FAILURE'

function fetchNotifyGroups(name, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/groups`
  if (name) {
    endpoint += `?name=${name}`
  }
  return {
    [FETCH_API]: {
      types: [ALERT_GET_NOTIFY_GROUPS_REQUEST, ALERT_GET_NOTIFY_GROUPS_SUCCESS, ALERT_GET_NOTIFY_GROUPS_FAILURE],
      endpoint: endpoint,
      schema: {},
    },
    callback,
  }
}

export function loadNotifyGroups(name, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchNotifyGroups(name, callback))
  }
}


export const ALERT_BATCH_DELETE_GROUPS_REQUEST = 'ALERT_BATCH_DELETE_GROUPS_REQUEST'
export const ALERT_BATCH_DELETE_GROUPS_SUCCESS = 'ALERT_BATCH_DELETE_GROUPS_SUCCESS'
export const ALERT_BATCH_DELETE_GROUPS_FAILURE = 'ALERT_BATCH_DELETE_GROUPS_FAILURE'

function fetchdeleteNotifyGroups(groupIDs, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/groups/batch-delete`
  return {
    [FETCH_API]: {
      types: [ALERT_BATCH_DELETE_GROUPS_REQUEST, ALERT_BATCH_DELETE_GROUPS_SUCCESS, ALERT_BATCH_DELETE_GROUPS_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: {
          ids: groupIDs,
        }
      },
    },
    callback,
  }
}

export function deleteNotifyGroups(groupIDs, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchdeleteNotifyGroups(groupIDs, callback))
  }
}

export const ALERT_SEND_ALERTNOTIFY_INVITATION_REQUEST = 'ALERT_SEND_ALERTNOTIFY_INVITATION_REQUEST'
export const ALERT_SEND_ALERTNOTIFY_INVITATION_SUCCESS = 'ALERT_SEND_ALERTNOTIFY_INVITATION_SUCCESS'
export const ALERT_SEND_ALERTNOTIFY_INVITATION_FAILURE = 'ALERT_SEND_ALERTNOTIFY_INVITATION_FAILURE'

function fetchSendAlertNotifyInvitation(email, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/invitations`
  return {
    [FETCH_API]: {
      types: [ALERT_SEND_ALERTNOTIFY_INVITATION_REQUEST, ALERT_SEND_ALERTNOTIFY_INVITATION_SUCCESS, ALERT_SEND_ALERTNOTIFY_INVITATION_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: {
          email: email,
        }
      },
    },
    callback,
  }
}

export function sendAlertNotifyInvitation(email, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSendAlertNotifyInvitation(email, callback))
  }
}

export const ALERT_GET_ALERTNOTIFY_INVITATION_REQUEST = 'ALERT_GET_ALERTNOTIFY_INVITATION_REQUEST'
export const ALERT_GET_ALERTNOTIFY_INVITATION_SUCCESS = 'ALERT_GET_ALERTNOTIFY_INVITATION_SUCCESS'
export const ALERT_GET_ALERTNOTIFY_INVITATION_FAILURE = 'ALERT_GET_ALERTNOTIFY_INVITATION_FAILURE'

function fetchGetAlertNotifyInvitationStatus(email, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/invitations/status?emails=${email}`
  return {
    [FETCH_API]: {
      types: [ALERT_GET_ALERTNOTIFY_INVITATION_REQUEST, ALERT_GET_ALERTNOTIFY_INVITATION_SUCCESS, ALERT_GET_ALERTNOTIFY_INVITATION_FAILURE],
      endpoint: endpoint,
      schema: {},
    },
    callback,
  }
}

export function getAlertNotifyInvitationStatus(email, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGetAlertNotifyInvitationStatus(email, callback))
  }
}


export const ALERT_CREATE_NOTIFY_GROUP_REQUEST = 'ALERT_CREATE_NOTIFY_GROUP_REQUEST'
export const ALERT_CREATE_NOTIFY_GROUP_SUCCESS = 'ALERT_CREATE_NOTIFY_GROUP_SUCCESS'
export const ALERT_CREATE_NOTIFY_GROUP_FAILURE = 'ALERT_CREATE_NOTIFY_GROUP_FAILURE'

function fetchCreateNotifyGroup(body, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/groups`
  return {
    [FETCH_API]: {
      types: [ALERT_CREATE_NOTIFY_GROUP_REQUEST, ALERT_CREATE_NOTIFY_GROUP_SUCCESS, ALERT_CREATE_NOTIFY_GROUP_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body,
      },
    },
    callback,
  }
}

export function createNotifyGroup(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateNotifyGroup(body, callback))
  }
}


export const ALERT_MODIFY_NOTIFY_GROUP_REQUEST = 'ALERT_MODIFY_NOTIFY_GROUP_REQUEST'
export const ALERT_MODIFY_NOTIFY_GROUP_SUCCESS = 'ALERT_MODIFY_NOTIFY_GROUP_SUCCESS'
export const ALERT_MODIFY_NOTIFY_GROUP_FAILURE = 'ALERT_MODIFY_NOTIFY_GROUP_FAILURE'

function fetchModifyNotifyGroup(groupID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/groups/${groupID}`
  return {
    [FETCH_API]: {
      types: [ALERT_MODIFY_NOTIFY_GROUP_REQUEST, ALERT_MODIFY_NOTIFY_GROUP_SUCCESS, ALERT_MODIFY_NOTIFY_GROUP_FAILURE],
      endpoint: endpoint,
      schema: {},
      options: {
        method: 'PUT',
        body: body,
      },
    },
    callback,
  }
}

export function modifyNotifyGroup(groupID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchModifyNotifyGroup(groupID, body, callback))
  }
}



/*----------------alert setting-------------------*/

export const ALERT_SETTING_REQUEST = 'ALERT_SETTING_REQUEST'
export const ALERT_SETTING_SUCCESS = 'ALERT_SETTING_SUCCESS'
export const ALERT_SETTING_FAILED =  'ALERT_SETTING_FAILED'


function fetchAlertSetting(cluster, body, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/cluster/${cluster}/setting`
  if(body) {
    endpoint += `?${toQuerystring(body)}`
  }
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_REQUEST, ALERT_SETTING_SUCCESS, ALERT_SETTING_FAILED],
      schema: {},
      endpoint
    },
    callback
  }
}

export function getAlertSetting(cluster, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchAlertSetting(cluster, body, callback))
  }
}
export const ALERT_SETTING_ADD_REQUEST = 'ALERT_SETTING_ADD_REQUEST'
export const ALERT_SETTING_ADD_SUCCESS = 'ALERT_SETTING_ADD_SUCCESS'
export const ALERT_SETTING_ADD_FAILED = 'ALERT_SETTING_ADD_FAILED'


function fetchAddAlertSetting(cluster, body, callback){
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_ADD_REQUEST, ALERT_SETTING_ADD_SUCCESS, ALERT_SETTING_ADD_FAILED],
      endpoint: `${API_URL_PREFIX}/alerts/cluster/${cluster}/setting`,
      schema: {},
      options: {
        body: body,
        method: 'POST'
      },
    },
    callback
  }
}

export function addAlertSetting(cluster, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchAddAlertSetting(cluster, body, callback))
  }
}

export const ALERT_SETTING_LIST_QUERY_REQUEST = 'ALERT_SETTING_LIST_QUERY_REQUEST'
export const ALERT_SETTING_LIST_QUERY_SUCCESS= 'ALERT_SETTING_LIST_QUERY_SUCCESS'
export const ALERT_SETTING_LIST_QUERY_FAILED = 'ALERT_SETTING_LIST_QUERY_FAILED'


function fetchGetAlertList(cluster, body, callback) {
  let endpoint = `${API_URL_PREFIX}/alerts/cluster/${cluster}/setting/list`
  if(typeof body == 'function') {
    callback = body
    body = null
  }
  if(body) {
    endpoint += `?${toQuerystring(body)}`
  }
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_LIST_QUERY_REQUEST, ALERT_SETTING_LIST_QUERY_SUCCESS, ALERT_SETTING_LIST_QUERY_FAILED],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getSettingList(cluster, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchGetAlertList(cluster, body, callback))
  }
}

