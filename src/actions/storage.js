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


export const STORAGE_LIST_REQUEST = 'STORAGE_LIST_REQUEST' 
export const STORAGE_LIST_SUCCESS = 'STORAGE_LIST_SUCCESS' 
export const STORAGE_LIST_FAILURE = 'STORAGE_LIST_FAILURE' 

export function fetchStorageList(pool) {
  return {
    pool,
    [FETCH_API]: {
      types: [STORAGE_LIST_REQUEST, STORAGE_LIST_SUCCESS, STORAGE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/volumes`,
      schema: {}//Schemas.STORAGE
    }
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

export function createStorage(obj) {
  return {
    pool: obj.pool,
    [FETCH_API]: {
      types: [STORAGE_CREATE_REQUEST, STORAGE_CREATE_SUCCESS, STORAGE_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage`
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
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/storages/batch-delete`,
      options: {
        method: 'POST',
        data: storageIdArray
      },
      schema: Schemas.STORAGE
    },
    callback
  }
}