/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for openstack snapshot
 *
 * v0.1 - 2017-07-17
 * @author zhangcz
 */

import { FETCH_API, Schemas } from '../../middleware/api'
import { API_URL_PREFIX } from '../../constants'
import { toQuerystring } from '../../common/tools'

export const OPENSTACK_GET_SNAPSHOT_LIST_REQUEST = 'OPENSTACK_GET_SNAPSHOT_LIST_REQUEST'
export const OPENSTACK_GET_SNAPSHOT_LIST_SUCCESS = 'OPENSTACK_GET_SNAPSHOT_LIST_SUCCESS'
export const OPENSTACK_GET_SNAPSHOT_LIST_FAILURE = 'OPENSTACK_GET_SNAPSHOT_LIST_FAILURE'

function fetchGetSnapshotList(query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/snapshots`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_SNAPSHOT_LIST_REQUEST, OPENSTACK_GET_SNAPSHOT_LIST_SUCCESS, OPENSTACK_GET_SNAPSHOT_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getSnapshotList(query, callback) {
  return (dispath, getState) => {
    return dispath(fetchGetSnapshotList(query, callback))
  }
}


export const OPENSTACK_DELETE_SNAPSHOT_REQUEST = 'OPENSTACK_DELETE_SNAPSHOT_REQUEST'
export const OPENSTACK_DELETE_SNAPSHOT_SUCCESS = 'OPENSTACK_DELETE_SNAPSHOT_SUCCESS'
export const OPENSTACK_DELETE_SNAPSHOT_FAILURE = 'OPENSTACK_DELETE_SNAPSHOT_FAILURE'

function fetchDeleteSnapshot(snapshot, query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/snapshots/${snapshot.id}`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_DELETE_SNAPSHOT_REQUEST, OPENSTACK_DELETE_SNAPSHOT_SUCCESS, OPENSTACK_DELETE_SNAPSHOT_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback
  }
}

export function deleteSnapshot(snapshot, query,  callback) {
  return (dispatch) => {
    return dispatch(fetchDeleteSnapshot(snapshot, query, callback))
  }
}

export const OPENSTACK_CLEAR_SNAPSHOT_LIST = 'OPENSTACK_CLEAR_SNAPSHOT_LIST'
export function clearFloatips() {
  return {
    type: OPENSTACK_CLEAR_SNAPSHOT_LIST
  }
}

