/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for openstack storage
 *
 * v0.1 - 2017-7-17
 * @author zhangcz
 */

import * as ActionTypes from '../../actions/openstack/openstack_storage'
import reducerFactory from '../factory'
import merge from 'lodash/merge'

function objectStorageList(state = {}, action) {
  switch(action.type) {
    case ActionTypes.OPENSTACK_GET_OBJECT_STORAGE_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.OPENSTACK_GET_OBJECT_STORAGE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.list
      })
    case ActionTypes.OPENSTACK_GET_OBJECT_STORAGE_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: [],
      })
    case ActionTypes.OPENSTACK_CLEAR_VOLUME_LIST:
      return {
        isFetching: false
      }
    case ActionTypes.OPENSTACK_CLEAR_OBJECT_STORAGE_LIST:
      return {
        isFetching: false
      }
    default:
      return state
  }
}

function objectStorageDetailList(state = {}, action){
  let name = action.name
  let defaultDetail = {
    isFetching: true
  }
  switch(action.type){
    case ActionTypes.OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_REQUEST:
      return merge({}, state, {
        isFetching: true,
        [action.name]: {
          isFetching: true,
        }
      })
    case ActionTypes.OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        [action.name]: {
          isFetching: false,
          result:action.response.result.detail
        }
      })
    case ActionTypes.OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_FAILURE:
      return merge({}, state, {
        isFetching: false,
         [action.name]: {
           isFetching: false,
           result: []
        }
      })
    default:
      return state
  }
}

function blockStorageList(state = {}, action) {
  switch(action.type) {
    case ActionTypes.OPENSTACK_GET_BLOCK_STORAGE_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.OPENSTACK_GET_BLOCK_STORAGE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.volumes
      })
    case ActionTypes.OPENSTACK_GET_BLOCK_STORAGE_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: [],
      })
    default:
      return state
  }
}

function fileStoragAndDirectory(state = {}, action) {
  switch(action.type) {
    case ActionTypes.GET_OPENSTACK_FILE_STORAGE_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.GET_OPENSTACK_FILE_STORAGE_SUCCESS:
      if (action.path =='/') {
        return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result.data
        })
      }
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.data
      })

    case ActionTypes.GET_OPENSTACK_FILE_STORAGE_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: []
      })
    default:
      return state
  }
}

function fileStorage(state = {}, action) {
  switch(action.type) {
    case ActionTypes.GET_OPENSTACK_FILE_DIRECTORY_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.GET_OPENSTACK_FILE_DIRECTORY_SUCCESS:
      if (action.path =='/') {
        return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result.data
        })
      }
      return Object.assign({}, state, {
        isFetching: false,
        result: getChildren(state.result, action)
      })

    case ActionTypes.GET_OPENSTACK_FILE_DIRECTORY_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: []
      })
    case ActionTypes.RESTORE_FILE_STORAGE:
      return Object.assign({},state, {
        isFetching: false,
        result: []
      })
    default:
      return state
  }
}

export default function openstack_storage(state = {}, action) {
  return {
    objectStorageList: objectStorageList(state.objectStorageList, action),
    objectStorageDetailList: objectStorageDetailList(state.objectStorageDetailList, action),
    blockStorageList: blockStorageList(state.blockStorageList, action),
    fileStorage:fileStorage(state.fileStorage,action),
    fileStoragAndDirectory:fileStoragAndDirectory(state.fileStoragAndDirectory,action),
    volumeTypes: reducerFactory({
      REQUEST: ActionTypes.OPENSTACK_GET_VOLUME_TYPE_REQUEST,
      SUCCESS: ActionTypes.OPENSTACK_GET_VOLUME_TYPE_SUCCESS,
      FAILURE: ActionTypes.OPENSTACK_GET_VOLUME_TYPE_FAILURE,
    }, state.volumeTypes,action, {
      overwrite: true
    })
  }
}


function getChildren(parent, action){
  const result = parent.map(item=> {
    if (item.filePath == action.path) {
      item.children = action.response.result.data || []
      return item
    }
    if (item.children) {
      getChildren(item.children, action)
    }
    return item
  })
  return result
}