/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for openstack calculation service
 *
 * v0.1 - 2017-07-14
 * @author YangYuBiao
 */

import { FETCH_API, Schemas } from '../../middleware/api'
import { API_URL_PREFIX } from '../../constants'
import { toQuerystring as toQueryString } from '../../common/tools'

export const OPENSTACK_GET_VM_LIST_REQUEST = 'OPENSTACK_GET_VM_LIST_REQUEST'
export const OPENSTACK_GET_VM_LIST_SUCCESS = 'OPENSTACK_GET_VM_LIST_SUCCESS'
export const OPENSTACK_GET_VM_LIST_FAILURE = 'OPENSTACK_GET_VM_LIST_FAILURE'
function fetchVMList(query, needLoading, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/servers`
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_VM_LIST_REQUEST, OPENSTACK_GET_VM_LIST_SUCCESS, OPENSTACK_GET_VM_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback,
    needLoading
  }
}

export function getVMList(query, needLoading, callback) {
  if(typeof needLoading != 'boolean') {
    callback = needLoading,
    needLoading = true
  }
  return (dispath, getState) => {
    return dispath(fetchVMList(query, needLoading, callback))
  }
}

export const OPENSTACK_GET_VM_DETAIL_REQUEST = 'OPENSTACK_GET_VM_DETAIL_REQUEST'
export const OPENSTACK_GET_VM_DETAIL_SUCCESS = 'OPENSTACK_GET_VM_DETAIL_SUCCESS'
export const OPENSTACK_GET_VM_DETAIL_FAILURE = 'OPENSTACK_GET_VM_DETAIL_FAILURE'
function fetchVMDetail(id, query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/servers/${id}`
  if(query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_VM_DETAIL_REQUEST, OPENSTACK_GET_VM_DETAIL_SUCCESS, OPENSTACK_GET_VM_DETAIL_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getVMDetail(id, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchVMDetail(id, query, callback))
  }
}


export const OPENSTACK_GET_VM_METERS_REQUEST = 'OPENSTACK_GET_VM_METERS_REQUEST'
export const OPENSTACK_GET_VM_METERS_SUCCESS = 'OPENSTACK_GET_VM_METERS_SUCCESS'
export const OPENSTACK_GET_VM_METERS_FAILURE = 'OPENSTACK_GET_VM_METERS_FAILURE'
function fetchVMMeters(id, type, query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/meter/${type}/${id}`
  if(query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_VM_METERS_REQUEST, OPENSTACK_GET_VM_METERS_SUCCESS, OPENSTACK_GET_VM_METERS_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getVMMeters(id, type, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchVMMeters(id, type, query, callback))
  }
}



export const OPENSTACK_GET_FLAVOR_LIST_REQUEST = 'OPENSTACK_GET_FLAVOR_LIST_REQUEST'
export const OPENSTACK_GET_FLAVOR_LIST_SUCCESS = 'OPENSTACK_GET_FLAVOR_LIST_SUCCESS'
export const OPENSTACK_GET_FLAVOR_LIST_FAILURE = 'OPENSTACK_GET_FLAVOR_LIST_FAILURE'
function fetchFlavorList(query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/flavors`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_FLAVOR_LIST_REQUEST, OPENSTACK_GET_FLAVOR_LIST_SUCCESS, OPENSTACK_GET_FLAVOR_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getFlavorList(query, callback) {
  return (dispath, getState) => {
    return dispath(fetchFlavorList(query, callback))
  }
}


export const OPENSTACK_GET_AZ_LIST_REQUEST = 'OPENSTACK_GET_AZ_LIST_REQUEST'
export const OPENSTACK_GET_AZ_LIST_SUCCESS = 'OPENSTACK_GET_AZ_LIST_SUCCESS'
export const OPENSTACK_GET_AZ_LIST_FAILURE = 'OPENSTACK_GET_AZ_LIST_FAILURE'
function fetchAZList(query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/az`
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_AZ_LIST_REQUEST, OPENSTACK_GET_AZ_LIST_SUCCESS, OPENSTACK_GET_AZ_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getAZList(query, callback) {
  return (dispath, getState) => {
    return dispath(fetchAZList(query, callback))
  }
}


export const OPENSTACK_UPDATE_VM_REQUEST = 'OPENSTACK_UPDATE_VM_REQUEST'
export const OPENSTACK_UPDATE_VM_SUCCESS = 'OPENSTACK_UPDATE_VM_SUCCESS'
export const OPENSTACK_UPDATE_VM_FAILURE = 'OPENSTACK_UPDATE_VM_FAILURE'
function fetchUpdateVM(id, action, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/servers/${id}/actions/${action}`
  return {
    [FETCH_API]: {
      types: [OPENSTACK_UPDATE_VM_REQUEST, OPENSTACK_UPDATE_VM_SUCCESS, OPENSTACK_UPDATE_VM_FAILURE],
      endpoint: endpointUrl,
      options: {
        method: 'PUT',
      },
      schema: {}
    },
    callback
  }
}

export function updateVM(id, action, callback) {
  return (dispath, getState) => {
    return dispath(fetchUpdateVM(id, action,callback))
  }
}


export const OPENSTACK_UPDATE_NAME_VM_REQUEST = 'OPENSTACK_UPDATE_NAME_VM_REQUEST'
export const OPENSTACK_UPDATE_NAME_VM_SUCCESS = 'OPENSTACK_UPDATE_NAME_VM_SUCCESS'
export const OPENSTACK_UPDATE_NAME_VM_FAILURE = 'OPENSTACK_UPDATE_NAME_VM_FAILURE'

export function editVM(id, newName, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/servers/${id}/rename/${newName}`
  return {
    [FETCH_API]: {
      types: [OPENSTACK_UPDATE_NAME_VM_REQUEST, OPENSTACK_UPDATE_NAME_VM_SUCCESS, OPENSTACK_UPDATE_NAME_VM_FAILURE],
      endpoint: endpointUrl,
      options: {
        method: 'PUT'
      },
      schema: {}
    },
    callback
  }
}

export const OPENSTACK_GET_NETWORK_LIST_REQUEST = 'OPENSTACK_GET_NETWORK_LIST_REQUEST'
export const OPENSTACK_GET_NETWORK_LIST_SUCCESS = 'OPENSTACK_GET_NETWORK_LIST_SUCCESS'
export const OPENSTACK_GET_NETWORK_LIST_FAILURE = 'OPENSTACK_GET_NETWORK_LIST_FAILURE'
function fetchNetworkList(query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/servers/networks`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_NETWORK_LIST_REQUEST, OPENSTACK_GET_NETWORK_LIST_SUCCESS, OPENSTACK_GET_NETWORK_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getNetworkList(query, callback) {
  return (dispath, getState) => {
    return dispath(fetchNetworkList(query, callback))
  }
}




export const OPENSTACK_POST_VM_REQUEST = 'OPENSTACK_POST_VM_REQUEST'
export const OPENSTACK_POST_VM_SUCCESS = 'OPENSTACK_POST_VM_SUCCESS'
export const OPENSTACK_POST_VM_FAILURE = 'OPENSTACK_POST_VM_FAILURE'
function fetchPostVM(body, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/servers`
  return {
    [FETCH_API]: {
      types: [OPENSTACK_POST_VM_REQUEST, OPENSTACK_POST_VM_SUCCESS, OPENSTACK_POST_VM_FAILURE],
      endpoint: endpointUrl,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function postVM(body, callback) {
  return (dispath, getState) => {
    return dispath(fetchPostVM(body, callback))
  }
}
export const OPENSTACK_DELETE_VM_REQUEST = 'OPENSTACK_DELETE_VM_REQUEST'
export const OPENSTACK_DELETE_VM_SUCCESS = 'OPENSTACK_DELETE_VM_SUCCESS'
export const OPENSTACK_DELETE_VM_FAILURE = 'OPENSTACK_DELETE_VM_FAILURE'
function fetchDeleteVM(id, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/servers/${id}`
  return {
    [FETCH_API]: {
      types: [OPENSTACK_DELETE_VM_REQUEST, OPENSTACK_DELETE_VM_SUCCESS, OPENSTACK_DELETE_VM_FAILURE],
      endpoint: endpointUrl,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}

export function deleteVM(id, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteVM(id, callback))
  }
}


export const OPENSTACK_GET_IMAGE_LIST_REQUEST = 'OPENSTACK_GET_IMAGE_LIST_REQUEST'
export const OPENSTACK_GET_IMAGE_LIST_SUCCESS = 'OPENSTACK_GET_IMAGE_LIST_SUCCESS'
export const OPENSTACK_GET_IMAGE_LIST_FAILURE = 'OPENSTACK_GET_IMAGE_LIST_FAILURE'
function fetchImageList(query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/images`
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_IMAGE_LIST_REQUEST, OPENSTACK_GET_IMAGE_LIST_SUCCESS, OPENSTACK_GET_IMAGE_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getImageList(query, callback) {
  return (dispath, getState) => {
    return dispath(fetchImageList(query, callback))
  }
}
export const OPENSTACK_POST_IMAGE_REQUEST = 'OPENSTACK_POST_IMAGE_REQUEST'
export const OPENSTACK_POST_IMAGE_SUCCESS = 'OPENSTACK_POST_IMAGE_SUCCESS'
export const OPENSTACK_POST_IMAGE_FAILURE = 'OPENSTACK_POST_IMAGE_FAILURE'
function fetchPostImage(project, body, callback) {
  let endpointUrl = `${API_URL_PREFIX}/api/v2/openstack/image`
  if (typeof body == 'function') {
    callback = body
    body = null
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_POST_IMAGE_REQUEST, OPENSTACK_POST_IMAGE_SUCCESS, OPENSTACK_POST_IMAGE_FAILURE],
      endpoint: endpointUrl,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function postImage(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchPostImage(project, query, callback))
  }
}
export const OPENSTACK_DELETE_IMAGE_REQUEST = 'OPENSTACK_DELETE_IMAGE_REQUEST'
export const OPENSTACK_DELETE_IMAGE_SUCCESS = 'OPENSTACK_DELETE_IMAGE_SUCCESS'
export const OPENSTACK_DELETE_IMAGE_FAILURE = 'OPENSTACK_DELETE_IMAGE_FAILURE'
function fetchDeleteImage(project, query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/api/v2/openstack/image`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_DELETE_IMAGE_REQUEST, OPENSTACK_DELETE_IMAGE_SUCCESS, OPENSTACK_DELETE_IMAGE_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function deleteImage(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteImage(project, query, callback))
  }
}
export const OPENSTACK_GET_VOLUME_LIST_REQUEST = 'OPENSTACK_GET_VOLUME_LIST_REQUEST'
export const OPENSTACK_GET_VOLUME_LIST_SUCCESS = 'OPENSTACK_GET_VOLUME_LIST_SUCCESS'
export const OPENSTACK_GET_VOLUME_LIST_FAILURE = 'OPENSTACK_GET_VOLUME_LIST_FAILURE'
function fetchVolumeList(project, query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/volume`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_VOLUME_LIST_REQUEST, OPENSTACK_GET_VOLUME_LIST_SUCCESS, OPENSTACK_GET_VOLUME_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getVolumeList(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchVolumeList(project, query, callback))
  }
}
export const OPENSTACK_POST_VOLUME_REQUEST = 'OPENSTACK_POST_VOLUME_REQUEST'
export const OPENSTACK_POST_VOLUME_SUCCESS = 'OPENSTACK_POST_VOLUME_SUCCESS'
export const OPENSTACK_POST_VOLUME_FAILURE = 'OPENSTACK_POST_VOLUME_FAILURE'
function fetchPostVolume(project, body, callback) {
  let endpointUrl = `${API_URL_PREFIX}/api/v2/openstack/volume`
  if (typeof body == 'function') {
    callback = body
    body = null
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_POST_VOLUME_REQUEST, OPENSTACK_POST_VOLUME_SUCCESS, OPENSTACK_POST_VOLUME_FAILURE],
      endpoint: endpointUrl,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function postVolume(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchPostVolume(project, query, callback))
  }
}
export const OPENSTACK_DELETE_VOLUME_REQUEST = 'OPENSTACK_DELETE_VOLUME_REQUEST'
export const OPENSTACK_DELETE_VOLUME_SUCCESS = 'OPENSTACK_DELETE_VOLUME_SUCCESS'
export const OPENSTACK_DELETE_VOLUME_FAILURE = 'OPENSTACK_DELETE_VOLUME_FAILURE'
function fetchDeleteVolume(project, query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/api/v2/openstack/volume`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_DELETE_VOLUME_REQUEST, OPENSTACK_DELETE_VOLUME_SUCCESS, OPENSTACK_DELETE_VOLUME_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function deleteVolume(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteVolume(project, query, callback))
  }
}
export const OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_REQUEST = 'OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_REQUEST'
export const OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_SUCCESS = 'OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_SUCCESS'
export const OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_FAILURE = 'OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_FAILURE'
function fetchVolume_snapshotsList(project, query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/volume_snapshots`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_REQUEST, OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_SUCCESS, OPENSTACK_GET_VOLUME_SNAPSHOTS_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getVolume_snapshotsList(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchVolume_snapshotsList(project, query, callback))
  }
}
export const OPENSTACK_POST_VOLUME_SNAPSHOTS_REQUEST = 'OPENSTACK_POST_VOLUME_SNAPSHOTS_REQUEST'
export const OPENSTACK_POST_VOLUME_SNAPSHOTS_SUCCESS = 'OPENSTACK_POST_VOLUME_SNAPSHOTS_SUCCESS'
export const OPENSTACK_POST_VOLUME_SNAPSHOTS_FAILURE = 'OPENSTACK_POST_VOLUME_SNAPSHOTS_FAILURE'
function fetchPostVolume_snapshots(project, body, callback) {
  let endpointUrl = `${API_URL_PREFIX}/api/v2/openstack/volume_snapshots`
  if (typeof body == 'function') {
    callback = body
    body = null
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_POST_VOLUME_SNAPSHOTS_REQUEST, OPENSTACK_POST_VOLUME_SNAPSHOTS_SUCCESS, OPENSTACK_POST_VOLUME_SNAPSHOTS_FAILURE],
      endpoint: endpointUrl,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function postVolume_snapshots(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchPostVolume_snapshots(project, query, callback))
  }
}
export const OPENSTACK_DELETE_VOLUME_SNAPSHOTS_REQUEST = 'OPENSTACK_DELETE_VOLUME_SNAPSHOTS_REQUEST'
export const OPENSTACK_DELETE_VOLUME_SNAPSHOTS_SUCCESS = 'OPENSTACK_DELETE_VOLUME_SNAPSHOTS_SUCCESS'
export const OPENSTACK_DELETE_VOLUME_SNAPSHOTS_FAILURE = 'OPENSTACK_DELETE_VOLUME_SNAPSHOTS_FAILURE'
function fetchDeleteVolume_snapshots(project, query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/api/v2/openstack/volume_snapshots`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQueryString(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_DELETE_VOLUME_SNAPSHOTS_REQUEST, OPENSTACK_DELETE_VOLUME_SNAPSHOTS_SUCCESS, OPENSTACK_DELETE_VOLUME_SNAPSHOTS_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function deleteVolume_snapshots(project, query, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteVolume_snapshots(project, query, callback))
  }
}

export const OPENSTACK_CLEAR_VM_LIST = 'OPENSTACK_CLEAR_VM_LIST'
export function clrearVMList() {
  return {
    type: OPENSTACK_CLEAR_VM_LIST
  }
}


export const OPENSTACK_CLEAR_IMAGE_LIST = 'OPENSTACK_CLEAR_IMAGE_LIST'
export function clrearImageList() {
  return {
    type: OPENSTACK_CLEAR_IMAGE_LIST
  }
}

