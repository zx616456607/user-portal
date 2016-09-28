/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Storage action
 * 
 * v0.1 - 2016-09-21
 * @author YangYuBiao
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const STORAGE_LIST_REQUEST = 'STORAGE_LIST_REQUEST' 
export const STORAGE_LIST_SUCCESS = 'STORAGE_LIST_SUCCESS' 
export const STORAGE_LIST_FAILURE = 'STORAGE_LIST_FAILURE' 

export function fetchStorageList(pool, callback) {
  return {
    pool,
    [FETCH_API]: {
      types: [STORAGE_LIST_REQUEST, STORAGE_LIST_SUCCESS, STORAGE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/volumes`,
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}

export function loadStorageList(pool) {
  return (dispath, getState) => {
    const state = getState().storage.storageList
    dispath(fetchStorageList(pool))
  }
}

export const STORAGE_CREATE_REQUEST = 'STORAGE_CREATE_REQUEST'
export const STORAGE_CREATE_SUCCESS = 'STORAGE_CREATE_SUCCESS'
export const STORAGE_CREATE_FAILURE = 'STORAGE_CREATE_FAILURE'

export function createStorage(obj, callback) {
  return {
    pool: obj.pool,
    [FETCH_API]: {
      types: [STORAGE_CREATE_REQUEST, STORAGE_CREATE_SUCCESS, STORAGE_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${obj.pool}/volumes`,
      options: {
        method: 'POST',
        body: obj
      },
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}


export const STORAGE_DETAIL_REQUEST = 'STORAGE_DETAIL_REQUEST'
export const STORAGE_DETAIL_SUCCESS = 'STORAGE_DETAIL_SUCCESS'
export const STORAGE_DETAIL_FAILURE = 'STORAGE_DETAIL_FAILURE'

export function loadStorageInfo(pool,name) {
  return {
    pool,
    [FETCH_API]: {
      types: [STORAGE_DETAIL_REQUEST, STORAGE_DETAIL_SUCCESS, STORAGE_DETAIL_FAILURE],
      // /storage-pools/:pool/volumes/:name
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/volumes/${name}`,
      options: {
        method: 'GET'
      },
      schema: {}//Schemas.STORAGE
    }
  }
}

export const STORAGE_DELETE_REQUEST = 'STORAGE_DELETE_REQUEST'
export const STORAGE_DELETE_SUCCESS = 'STORAGE_DELETE_SUCCESS'
export const STORAGE_DELETE_FAILURE = 'STORAGE_DELETE_FAILURE'

export function deleteStorage(pool, storageIdArray, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_DELETE_REQUEST, STORAGE_DELETE_SUCCESS, STORAGE_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/volumes/batch-delete`,
      options: {
        method: 'POST',
        body: storageIdArray
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const STORAGE_FORMATE_REQUEST = 'STORAGE_FORMATE_REQUEST'
export const STORAGE_FORMATE_SUCCESS = 'STORAGE_FROMATE_SUCCESS'
export const STORAGE_FORMATE_FAILURE = 'STORAGE_FROMATE_FAILURE'

export function formateStorage(pool, storage, callback) {
    return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_FORMATE_REQUEST, STORAGE_FORMATE_SUCCESS, STORAGE_FORMATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/volumes/format`,
      options: {
        method: 'PUT',
        body: storage
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const STORAGE_RESIZE_REQUEST = 'STORAGE_RESIZE_REQUEST'
export const STORAGE_RESIZE_SUCCESS = 'STORAGE_RESIZE_SUCCESS'
export const STORAGE_RESIZE_FAILURE = 'STORAGE_RESIZE_FAILURE'

export function resizeStorage(pool, storage, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_RESIZE_REQUEST, STORAGE_RESIZE_SUCCESS, STORAGE_RESIZE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/volumes/size`,
      options: {
        method: 'PUT',
        body: storage
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}