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

function fetchStorageList(master) {
  return {
    master,
    [FETCH_API]: {
      types: [RC_LIST_REQUEST, RC_LIST_SUCCESS, RC_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage/${master}/list`,
      schema: Schemas.CONTAINERS
    }
  }
}

function loadStorageList(master) {
  return ({dispath, getState}) => {
    const state = getState().storage.storage
  }
}

export const STORAGE_CREATE_REQUEST = 'STORAGE_CREATE_REQUEST'
export const STORAGE_CREATE_SUCCESS = 'STORAGE_CREATE_SUCCESS'
export const STORAGE_CREATE_FAILURE = 'STORAGE_CREATE_FAILURE'

function createStorage(obj) {
  return {
    master: obj.master,
    [FETCH_API]: {
      types: [STORAGE_CREATE_REQUEST, STORAGE_CREATE_SUCCESS, STORAGE_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage`
    }
  }
}