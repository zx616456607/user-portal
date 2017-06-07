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
      endpoint: `${API_URL_PREFIX}/cluster/${clusterID}/alerts/record-filters`,
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

function fetchRecords(query, clusterID) {
  const queryStr = toQuerystring(query)
  return {
    [FETCH_API]: {
      types: [ALERT_GET_RECORDS_REQUEST, ALERT_GET_RECORDS_SUCCESS, ALERT_GET_RECORDS_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${clusterID}/alerts/records?${queryStr}`,
      schema: {}
    }
  }
}

export function loadRecords(query, clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchRecords(query, clusterID))
  }
}

export const ALERT_DELETE_RECORDS_REQUEST = 'ALERT_DELETE_RECORDS_REQUEST'
export const ALERT_DELETE_RECORDS_SUCCESS = 'ALERT_DELETE_RECORDS_SUCCESS'
export const ALERT_DELETE_RECORDS_FAILURE = 'ALERT_DELETE_RECORDS_FAILURE'

function fetchDeleteRecords(strategyID, clusterID, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${clusterID}/alerts/records`
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

export function deleteRecords(strategyID,clusterID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteRecords(strategyID, clusterID, callback))
  }
}

export const ALERT_GET_NOTIFY_GROUPS_REQUEST = 'ALERT_GET_NOTIFY_GROUPS_REQUEST'
export const ALERT_GET_NOTIFY_GROUPS_SUCCESS = 'ALERT_GET_NOTIFY_GROUPS_SUCCESS'
export const ALERT_GET_NOTIFY_GROUPS_FAILURE = 'ALERT_GET_NOTIFY_GROUPS_FAILURE'

function fetchNotifyGroups(name, clusterID, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${clusterID}/alerts/groups`
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

export function loadNotifyGroups(name, clusterID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchNotifyGroups(name, clusterID, callback))
  }
}


export const ALERT_BATCH_DELETE_GROUPS_REQUEST = 'ALERT_BATCH_DELETE_GROUPS_REQUEST'
export const ALERT_BATCH_DELETE_GROUPS_SUCCESS = 'ALERT_BATCH_DELETE_GROUPS_SUCCESS'
export const ALERT_BATCH_DELETE_GROUPS_FAILURE = 'ALERT_BATCH_DELETE_GROUPS_FAILURE'

function fetchdeleteNotifyGroups(groupIDs, clusterID, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${clusterID}/alerts/groups/batch-delete`
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

export function deleteNotifyGroups(groupIDs, clusterID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchdeleteNotifyGroups(groupIDs, clusterID, callback))
  }
}

export const ALERT_SEND_ALERTNOTIFY_INVITATION_REQUEST = 'ALERT_SEND_ALERTNOTIFY_INVITATION_REQUEST'
export const ALERT_SEND_ALERTNOTIFY_INVITATION_SUCCESS = 'ALERT_SEND_ALERTNOTIFY_INVITATION_SUCCESS'
export const ALERT_SEND_ALERTNOTIFY_INVITATION_FAILURE = 'ALERT_SEND_ALERTNOTIFY_INVITATION_FAILURE'

function fetchSendAlertNotifyInvitation(email, callback) {
  let endpoint = `${API_URL_PREFIX}/email/invitations`
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
  let endpoint = `${API_URL_PREFIX}/email/invitations/status?emails=${email}`
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

function fetchCreateNotifyGroup(clusterID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${clusterID}/alerts/groups`
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

export function createNotifyGroup(clusterID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateNotifyGroup(clusterID, body, callback))
  }
}


export const ALERT_MODIFY_NOTIFY_GROUP_REQUEST = 'ALERT_MODIFY_NOTIFY_GROUP_REQUEST'
export const ALERT_MODIFY_NOTIFY_GROUP_SUCCESS = 'ALERT_MODIFY_NOTIFY_GROUP_SUCCESS'
export const ALERT_MODIFY_NOTIFY_GROUP_FAILURE = 'ALERT_MODIFY_NOTIFY_GROUP_FAILURE'

function fetchModifyNotifyGroup(groupID, clusterID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${clusterID}/alerts/groups/${groupID}`
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

export function modifyNotifyGroup(groupID, clusterID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchModifyNotifyGroup(groupID, clusterID, body, callback))
  }
}



/*----------------alert setting-------------------*/

export const ALERT_SETTING_REQUEST = 'ALERT_SETTING_REQUEST'
export const ALERT_SETTING_SUCCESS = 'ALERT_SETTING_SUCCESS'
export const ALERT_SETTING_FAILURE =  'ALERT_SETTING_FAILURE'


function fetchAlertSetting(cluster, body, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting`
  if(body) {
    endpoint += `?${toQuerystring(body)}`
  }
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_REQUEST, ALERT_SETTING_SUCCESS, ALERT_SETTING_FAILURE],
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
export const ALERT_SETTING_ADD_FAILURE = 'ALERT_SETTING_ADD_FAILURE'


function fetchAddAlertSetting(cluster, body, callback){
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_ADD_REQUEST, ALERT_SETTING_ADD_SUCCESS, ALERT_SETTING_ADD_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting`,
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

function fetchUpdateAlertSetting(cluster, strategyID, body, callback){
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_ADD_REQUEST, ALERT_SETTING_ADD_SUCCESS, ALERT_SETTING_ADD_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting/${strategyID}`,
      schema: {},
      options: {
        body: body,
        method: 'PUT'
      },
    },
    callback
  }
}

export function updateAlertSetting(cluster, strategyID, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchUpdateAlertSetting(cluster, strategyID, body, callback))
  }
}

export const ALERT_SETTING_LIST_QUERY_REQUEST = 'ALERT_SETTING_LIST_QUERY_REQUEST'
export const ALERT_SETTING_LIST_QUERY_SUCCESS= 'ALERT_SETTING_LIST_QUERY_SUCCESS'
export const ALERT_SETTING_LIST_QUERY_FAILURE = 'ALERT_SETTING_LIST_QUERY_FAILURE'


function fetchGetAlertList(cluster, body, needFetching, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting/list`
  if(typeof body == 'function') {
    callback = body
    body = null
  }
  if(body) {
    endpoint += `?${toQuerystring(body)}`
  }
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_LIST_QUERY_REQUEST, ALERT_SETTING_LIST_QUERY_SUCCESS, ALERT_SETTING_LIST_QUERY_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
    needFetching
  }
}

export function getSettingList(cluster, body, needFetching, callback) {
  if(typeof needFetching == 'object') {
    callback = needFetching
    needFetching = true
  }
  return (dispath, getState) => {
    return dispath(fetchGetAlertList(cluster, body, needFetching, callback))
  }
}


export const ALERT_DELETE_SETTING_REQUEST = 'ALERT_DELETE_SETTING_REQUEST'
export const ALERT_DELETE_SETTING_SUCCESS = 'ALERT_DELETE_SETTING_SUCCESS'
export const ALERT_DELETE_SETTING_FAILURE = 'ALERT_DELETE_SETTING_FAILURE'


function fetchDeleteSetting(cluster, id, callback) {
  if (!id || id == "") {
    return
  }
  return {
    [FETCH_API]: {
      types: [ALERT_DELETE_SETTING_REQUEST, ALERT_DELETE_SETTING_SUCCESS, ALERT_DELETE_SETTING_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting?strategyID=${id.join(',')}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}

export function deleteSetting(cluster, id, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteSetting(cluster, id, callback))
  }
}


export const ALERT_UPDATE_SETTING_ENABLE_REQUEST = 'ALERT_UPDATE_SETTING_ENABLE_REQUEST'
export const ALERT_UPDATE_SETTING_ENABLE_SUCCESS = 'ALERT_UPDATE_SETTING_ENABLE_SUCCESS'
export const ALERT_UPDATE_SETTING_ENABLE_FAILURE = 'ALERT_UPDATE_SETTING_ENABLE_FAILURE'


function fetchBatchEnable(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [ALERT_UPDATE_SETTING_ENABLE_REQUEST, ALERT_UPDATE_SETTING_ENABLE_SUCCESS, ALERT_UPDATE_SETTING_ENABLE_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting/batch-enable`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function batchEnable(cluster, body, callback) {
  return (dispath, getState)  => {
    dispath(fetchBatchEnable(cluster, body, callback))
  }
}

function fetchBatchDisable(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [ALERT_UPDATE_SETTING_ENABLE_REQUEST, ALERT_UPDATE_SETTING_ENABLE_SUCCESS, ALERT_UPDATE_SETTING_ENABLE_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting/batch-disable`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function batchDisable(cluster, body, callback) {
  return (dispath, getState)  => {
    dispath(fetchBatchDisable(cluster, body, callback))
  }
}

export const ALERT_UPDATE_SETTING_SENDMAIL_REQUEST = 'ALERT_UPDATE_SETTING_SENDMAIL_REQUEST'
export const ALERT_UPDATE_SETTING_SENDMAIL_SUCCESS = 'ALERT_UPDATE_SETTING_SENDMAIL_SUCCESS'
export const ALERT_UPDATE_SETTING_SENDMAIL_FAILURE = 'ALERT_UPDATE_SETTING_SENDMAIL_FAILURE'


function fetchBatchEnableEmail(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [ALERT_UPDATE_SETTING_SENDMAIL_REQUEST, ALERT_UPDATE_SETTING_SENDMAIL_SUCCESS, ALERT_UPDATE_SETTING_SENDMAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting/batch-enable-email`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function batchEnableEmail(cluster, body, callback) {
  return (dispath, getState)  => {
    dispath(fetchBatchEnableEmail(cluster, body, callback))
  }
}


function fetchBatchDisableEmail(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [ALERT_UPDATE_SETTING_SENDMAIL_REQUEST, ALERT_UPDATE_SETTING_SENDMAIL_SUCCESS, ALERT_UPDATE_SETTING_SENDMAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting/batch-disable-email`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function batchDisableEmail(cluster, body, callback) {
  return (dispath, getState)  => {
    dispath(fetchBatchDisableEmail(cluster, body, callback))
  }
}


export const ALERT_IGNORE_SETTING_REQUEST = 'ALERT_IGNORE_SETTING_REQUEST'
export const ALERT_IGNORE_SETTING_SUCCESS = 'ALERT_IGNORE_SETTING_SUCCESS'
export const ALERT_IGNORE_SETTING_FAILURE = 'ALERT_IGNORE_SETTING_FAILURE'


function fetchIngoreSetting(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [ALERT_IGNORE_SETTING_REQUEST, ALERT_IGNORE_SETTING_SUCCESS, ALERT_IGNORE_SETTING_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/setting/batch-ignore`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}


export function ignoreSetting(cluster, body, callback) {
  return (dispath, getState) =>{
    return dispath(fetchIngoreSetting(cluster, body, callback))
  }
}


export const ALERT_SETTING_INSTANT_REQUEST = 'ALERT_SETTING_INSTANT_REQUEST'
export const ALERT_SETTING_INSTANT_SUCCESS = 'ALERT_SETTING_INSTANT_SUCCESS'
export const ALERT_SETTING_INSTANT_FAILURE = 'ALERT_SETTING_INSTANT_FAILURET'



function fetchSettingInstant(cluster, type, name, body, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${cluster}/alerts/type/${type}/setting/${name}/instant`
  if(body) {
    endpoint += `?${toQuerystring(body)}`
  }
  return {
    [FETCH_API]: {
      types: [ALERT_SETTING_INSTANT_REQUEST, ALERT_SETTING_INSTANT_SUCCESS, ALERT_SETTING_INSTANT_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}


export function getSettingInstant(cluster, type, body, name, callback) {
  return (dispath, getState) => {
    return dispath(fetchSettingInstant(cluster, type, body, name, callback))
  }
}


export const ALERT_DELETE_RULE_REQUEST = 'ALERT_DELETE_RULE_REQUEST'
export const ALERT_DELETE_RULE_SUCCESS = 'ALERT_DELETE_RULE_SUCCESS'
export const ALERT_DELETE_RULE_FAILURE = 'ALERT_DELETE_RULE_FAILURE'

function fetchDeleteRule(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [ALERT_DELETE_RULE_REQUEST, ALERT_DELETE_RULE_SUCCESS, ALERT_DELETE_RULE_FAILURE],
      schema: {},
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/alerts/rule?${toQuerystring(body)}`,
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}


export function deleteRule(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteRule(cluster, body, callback))
  }
}


export const SEND_INVITATIONS_REQUEST = 'SEND_INVITATIONS_REQUEST'
export const SEND_INVITATIONS_SUCCESS = 'SEND_INVITATIONS_SUCCESS'
export const SEND_INVITATIONS_FAILURE = 'SEND_INVITATIONS_FAILURE'

function fetchInvitations(body, callback) {
   return {
    [FETCH_API]: {
      types: [SEND_INVITATIONS_REQUEST, SEND_INVITATIONS_SUCCESS, SEND_INVITATIONS_FAILURE],
      schema: {},
      endpoint: `/email/invitations/join-code?${body}`,
    },
    callback
  }
}

export function invitations(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchInvitations(body, callback))
  }
}

export const GET_SETTINGLLIST_FROM_SERVICE_APP_REQUEST = 'GET_SETTINGLLIST_FROM_SERVICE_APP_REQUEST'
export const GET_SETTINGLLIST_FROM_SERVICE_APP_SUCCESS = 'GET_SETTINGLLIST_FROM_SERVICE_APP_SUCCESS'
export const GET_SETTINGLLIST_FROM_SERVICE_APP_FAILURE = 'GET_SETTINGLLIST_FROM_SERVICE_APP_FAILURE'

function fetchSettingListfromserviceorapp(query, cluster, callback) {
  let endpoint = `${API_URL_PREFIX}/cluster/${cluster}/alerts/group-strategies`
  endpoint += `?${toQuerystring(query)}`
  return {
    [FETCH_API]: {
      types: [GET_SETTINGLLIST_FROM_SERVICE_APP_REQUEST, GET_SETTINGLLIST_FROM_SERVICE_APP_SUCCESS, GET_SETTINGLLIST_FROM_SERVICE_APP_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'GET',
      }
    },
    callback
  }
}

export function getSettingListfromserviceorapp(query, cluster, callback) {
  return (dispath, getState)  => {
    dispath(fetchSettingListfromserviceorapp(query, cluster, callback))
  }
}