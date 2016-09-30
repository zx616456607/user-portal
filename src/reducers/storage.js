/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux reducers for app manage
 * 
 * v0.1 - 2016-09-21
 * @author YangYuBiao
 */
import * as ActionTypes from  '../actions/storage'
import { merge, union } from 'lodash'

function storageList(state = {}, action) {
  const pool = action.pool
  const defaultState = {
    [pool]: {
      isFetching: false,
      pool,
      login: null,
      number: 0,
      storageList: []
    }
  }
  switch (action.type) {
    case ActionTypes.STORAGE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [pool]: { isFetching: true }
      })
    case ActionTypes.STORAGE_LIST_SUCCESS: 
      return Object.assign({}, defaultState, state, {
        [pool]: {
          isFetching: false,
          storageList: action.response.result.body,
          pool: pool
        }
      })
    case ActionTypes.STORAGE_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [pool]: { isFetching: false }
      })
    default: 
      return state
  }
}

function deleteStorage(state = {}, action) {
  switch(action.type) {
    case ActionTypes.STORAGE_DELETE_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.STORAGE_DELETE_SUCCESS: 
      return merge({}, state, {
        isFetching: false
      })
    case ActionTypes.STORAGE_DELETE_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default: 
      return state
  }
}



function createStorage(state = {}, action) {
  switch(action.type) {
    case ActionTypes.STORAGE_CREATE_REQUEST:
      return union({}, state, {
        isFetching: true
      })
    case ActionTypes.STORAGE_CREATE_SUCCESS:
      return union({}, state, {
        isFetching: false
      })
    case ActionTypes.STORAGE_CREATE_FAILURE:
      return union({}, state, {
        isFetching: false
      })
    default: 
      return state
  }
}

function formateStorage(state = {}, action) {
  switch(action.type) {
    case ActionTypes.STORAGE_FORMATE_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.STORAGE_FORMATE_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.STORAGE_FORMATE_SUCCESS:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

function resizeStorage(state = {}, action) {
  switch(action.type) {
    case ActionTypes.STORAGE_RESIZE_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.STORAGE_RESIZE_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.STORAGE_RESIZE_FAILURE:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

function storageDetail(state = {}, action) {
  const defaultState = {
    isFetching: false,
    StorageInfo: {}
  }
  switch (action.type) {
    case ActionTypes.STORAGE_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.STORAGE_DETAIL_SUCCESS:
      return merge({}, state, {
        isFetching: false,
        StorageInfo: action.response.result[0]
      })
    case ActionTypes.STORAGE_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function uploadFile(state = {}, action) {
  switch(action.type) {
    case ActionTypes.STORAGE_UPLOAD_REQUEST: {
      return merge({}, state, {
        isFetching: true
      })
    }
    case ActionTypes.STORAGE_UPLOAD_SUCCESS: {
      return merge({}, state, {
        isFetching: false
      })
    }
    case ActionTypes.STORAGE_UPLOAD_FAILURE: {
      return merge({}, state, {
        isFetching: false
      })
    }
    default: 
      return state
  }
}

export default function storageReducer(state = {}, action) {
  return {
    storageList: storageList(state.storageList, action),
    deleteStorage: deleteStorage(state.deleteStorage, action),
    createStorage: createStorage(state.createStorage, action),
    formateStorage: formateStorage(state.formateStorage, action),
    resizeStorage: resizeStorage(state.deleteStorage, action),
    storageDetail: storageDetail(state.storageDetail, action),
    uploadFile: uploadFile(state.uploadFile, action)
  }
}