/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for openstack volume
 *
 * v0.1 - 2017-07-17
 * @author zhangcz
 */

import { FETCH_API, Schemas } from '../../middleware/api'
import { API_URL_PREFIX } from '../../constants'
import { toQuerystring } from '../../common/tools'

export const OPENSTACK_GET_OBJECT_STORAGE_LIST_REQUEST = 'OPENSTACK_GET_OBJECT_STORAGE_LIST_REQUEST'
export const OPENSTACK_GET_OBJECT_STORAGE_LIST_SUCCESS = 'OPENSTACK_GET_OBJECT_STORAGE_LIST_SUCCESS'
export const OPENSTACK_GET_OBJECT_STORAGE_LIST_FAILURE = 'OPENSTACK_GET_OBJECT_STORAGE_LIST_FAILURE'

function fetchGetObjectStorageList(query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/object_storage`
  if (typeof query == 'function') {
    callback = query
    query = null
  }
  if (query) {
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_OBJECT_STORAGE_LIST_REQUEST, OPENSTACK_GET_OBJECT_STORAGE_LIST_SUCCESS, OPENSTACK_GET_OBJECT_STORAGE_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getObjectStorageList(query, callback) {
  return (dispath, getState) => {
    return dispath(fetchGetObjectStorageList(query, callback))
  }
}

export const CREATE_OBJECT_STORAGE_REQUEST = 'CREATE_OBJECT_STORAGE_REQUEST'
export const CREATE_OBJECT_STORAGE_SUCCESS = 'CREATE_OBJECT_STORAGE_SUCCESS'
export const CREATE_OBJECT_STORAGE_FAILURE = 'CREATE_OBJECT_STORAGE_FAILURE'

function fetchCreateObjectStorage(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/object_storage`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CREATE_OBJECT_STORAGE_REQUEST, CREATE_OBJECT_STORAGE_SUCCESS, CREATE_OBJECT_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body,
      },
    },
    callback
  }
}

export function createObjectStorage(body, query, callback) {
  return (dispatch) => {
    return dispatch(fetchCreateObjectStorage(body, query, callback))
  }
}

export const DELETE_OBJECT_STORAGE_REQUEST = 'DELETE_OBJECT_STORAGE_REQUEST'
export const DELETE_OBJECT_STORAGE_SUCCESS = 'DELETE_OBJECT_STORAGE_SUCCESS'
export const DELETE_OBJECT_STORAGE_FAILURE = 'DELETE_OBJECT_STORAGE_FAILURE'

function fetchDeleteObjectStorage(query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/object_storage`
  endpoint += `?${toQuerystring(query)}`
  return {
    [FETCH_API]: {
      types: [DELETE_OBJECT_STORAGE_REQUEST, DELETE_OBJECT_STORAGE_SUCCESS, DELETE_OBJECT_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback
  }
}

export function deleteObjectStorage(query, callback) {
  return (dispatch) => {
    return dispatch(fetchDeleteObjectStorage(query, callback))
  }
}

export const OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_REQUEST = 'OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_REQUEST'
export const OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_SUCCESS = 'OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_SUCCESS'
export const OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_FAILURE = 'OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_FAILURE'

function fetchGetObjectStorageDetailList(name, query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/object_storage/${name}`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_REQUEST, OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_SUCCESS, OPENSTACK_GET_OBJECT_STORAGE_DETAIL_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    name: name,
    callback
  }
}

export function getObjectStorageDetailList(name, query, callback) {
  return (dispath) => {
    return dispath(fetchGetObjectStorageDetailList(name, query, callback))
  }
}

export const OPENSTACK_GET_BLOCK_STORAGE_LIST_REQUEST = 'OPENSTACK_GET_BLOCK_STORAGE_LIST_REQUEST'
export const OPENSTACK_GET_BLOCK_STORAGE_LIST_SUCCESS = 'OPENSTACK_GET_BLOCK_STORAGE_LIST_SUCCESS'
export const OPENSTACK_GET_BLOCK_STORAGE_LIST_FAILURE = 'OPENSTACK_GET_BLOCK_STORAGE_LIST_FAILURE'

function fetchGetBlockStorageList(query, callback) {
  let endpoint =  `${API_URL_PREFIX}/openstack/volumes`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_BLOCK_STORAGE_LIST_REQUEST, OPENSTACK_GET_BLOCK_STORAGE_LIST_SUCCESS, OPENSTACK_GET_BLOCK_STORAGE_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getBlockStorageList(callback) {
  return (dispath, getState) => {
    return dispath(fetchGetBlockStorageList(callback))
  }
}


export const CREATE_BLOCK_STORAGE_REQUEST = 'CREATE_BLOCK_STORAGE_REQUEST'
export const CREATE_BLOCK_STORAGE_SUCCESS = 'CREATE_BLOCK_STORAGE_SUCCESS'
export const CREATE_BLOCK_STORAGE_FAILURE = 'CREATE_BLOCK_STORAGE_FAILURE'

function fetchCreateBlockStorage(body, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/volumes`
  return {
    [FETCH_API]: {
      types: [CREATE_BLOCK_STORAGE_REQUEST, CREATE_BLOCK_STORAGE_SUCCESS, CREATE_BLOCK_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body,
      },
    },
    callback
  }
}

export function createBlockStorage(body, callback) {
  return (dispatch) => {
    return dispatch(fetchCreateBlockStorage(body, callback))
  }
}

export const ATTACH_BLOCK_STORAGE_REQUEST = 'ATTACH_BLOCK_STORAGE_REQUEST'
export const ATTACH_BLOCK_STORAGE_SUCCESS = 'ATTACH_BLOCK_STORAGE_SUCCESS'
export const ATTACH_BLOCK_STORAGE_FAILURE = 'ATTACH_BLOCK_STORAGE_FAILURE'

function fetchAttachBlockStorage(volumes, body, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/volumes/${volumes.id}/actions/attach`

  return {
    [FETCH_API]: {
      types: [ATTACH_BLOCK_STORAGE_REQUEST, ATTACH_BLOCK_STORAGE_SUCCESS, ATTACH_BLOCK_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body,
      },
    },
    callback
  }
}

export function attachBlockStorage(volumes, body, callback) {
  return (dispatch) => {
    return dispatch(fetchAttachBlockStorage(volumes, body, callback))
  }
}

export const DETACH_BLOCK_STORAGE_REQUEST = 'DETACH_BLOCK_STORAGE_REQUEST'
export const DETACH_BLOCK_STORAGE_SUCCESS = 'DETACH_BLOCK_STORAGE_SUCCESS'
export const DETACH_BLOCK_STORAGE_FAILURE = 'DETACH_BLOCK_STORAGE_FAILURE'

function fetchDetachBlockStorage(volumes, body, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/volumes/${volumes.id}/actions/detach`

  return {
    [FETCH_API]: {
      types: [DETACH_BLOCK_STORAGE_REQUEST, DETACH_BLOCK_STORAGE_SUCCESS, DETACH_BLOCK_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body,
      },
    },
    callback
  }
}

export function detachBlockStorage(volumes, body , callback) {
  return (dispatch) => {
    return dispatch(fetchDetachBlockStorage(volumes, body, callback))
  }
}

export const RESIZE_BLOCK_STORAGE_REQUEST = 'RESIZE_BLOCK_STORAGE_REQUEST'
export const RESIZE_BLOCK_STORAGE_SUCCESS = 'RESIZE_BLOCK_STORAGE_SUCCESS'
export const RESIZE_BLOCK_STORAGE_FAILURE = 'RESIZE_BLOCK_STORAGE_FAILURE'

function fetchResizeBlockStorage(volumes, body, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/volumes/${volumes.id}/actions/resize`

  return {
    [FETCH_API]: {
      types: [RESIZE_BLOCK_STORAGE_REQUEST, RESIZE_BLOCK_STORAGE_SUCCESS, RESIZE_BLOCK_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body,
      },
    },
    callback
  }
}

export function resizeBlockStorage(volumes, body, callback) {
  return (dispatch) => {
    return dispatch(fetchResizeBlockStorage(volumes, body, callback))
  }
}

export const SNAPSHOT_BLOCK_STORAGE_REQUEST = 'SNAPSHOT_BLOCK_STORAGE_REQUEST'
export const SNAPSHOT_BLOCK_STORAGE_SUCCESS = 'SNAPSHOT_BLOCK_STORAGE_SUCCESS'
export const SNAPSHOT_BLOCK_STORAGE_FAILURE = 'SNAPSHOT_BLOCK_STORAGE_FAILURE'

function fetchSnapshotBlockStorage(body, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/snapshots`

  return {
    [FETCH_API]: {
      types: [SNAPSHOT_BLOCK_STORAGE_REQUEST, SNAPSHOT_BLOCK_STORAGE_SUCCESS, SNAPSHOT_BLOCK_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body,
      },
    },
    callback
  }
}

export function snapshotBlockStorage(body, callback) {
  return (dispatch) => {
    return dispatch(fetchSnapshotBlockStorage(body, callback))
  }
}

export const DELETE_BLOCK_STORAGE_REQUEST = 'DELETE_BLOCK_STORAGE_REQUEST'
export const DELETE_BLOCK_STORAGE_SUCCESS = 'DELETE_BLOCK_STORAGE_SUCCESS'
export const DELETE_BLOCK_STORAGE_FAILURE = 'DELETE_BLOCK_STORAGE_FAILURE'

function fetchDeleteBlockStorage(body, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/volumes/${body.id}`

  return {
    [FETCH_API]: {
      types: [DELETE_BLOCK_STORAGE_REQUEST, DELETE_BLOCK_STORAGE_SUCCESS, DELETE_BLOCK_STORAGE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback
  }
}

export function deleteBlockStorage(body, callback) {
  return (dispatch) => {
    return dispatch(fetchDeleteBlockStorage(body, callback))
  }
}

export const GET_OPENSTACK_FILE_DIRECTORY_REQUEST = 'GET_OPENSTACK_FILE_DIRECTORY_REQUEST'
export const GET_OPENSTACK_FILE_DIRECTORY_SUCCESS = 'GET_OPENSTACK_FILE_DIRECTORY_SUCCESS'
export const GET_OPENSTACK_FILE_DIRECTORY_FAILURE = 'GET_OPENSTACK_FILE_DIRECTORY_FAILURE'

/**
 *
 * url directory 只获取目录
 * url directoryandfile 获取目录和文件
 * @param {*} callback
 */

function fetchFileDirectory(body, callback) {
  // parentPath
  body.path = body.query
  if (body.query =='/') {
    body.path +=`user/${body.appCode}/`
  }
  return {
    [FETCH_API]: {
      types:[GET_OPENSTACK_FILE_DIRECTORY_REQUEST,GET_OPENSTACK_FILE_DIRECTORY_SUCCESS,GET_OPENSTACK_FILE_DIRECTORY_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${body.appCode}/hdfs/directory?parentPath=${body.path}`,
      schema: {}
    },
    path:body.query,
    callback
  }
}

export function getFileDirectory(body, callback) {
  return (dispath) => {
    return dispath(fetchFileDirectory(body, callback))
  }
}


export const GET_OPENSTACK_FILE_STORAGE_REQUEST = 'GET_OPENSTACK_FILE_STORAGE_REQUEST'
export const GET_OPENSTACK_FILE_STORAGE_SUCCESS = 'GET_OPENSTACK_FILE_STORAGE_SUCCESS'
export const GET_OPENSTACK_FILE_STORAGE_FAILURE = 'GET_OPENSTACK_FILE_STORAGE_FAILURE'

function fetchFileStorage(body, callback) {
  // parentPath
  body.path = body.query
  if (body.query =='/') {
    body.path +=`user/${body.appCode}/`
  }
  return {
    [FETCH_API]: {
      types:[GET_OPENSTACK_FILE_STORAGE_REQUEST,GET_OPENSTACK_FILE_STORAGE_SUCCESS,GET_OPENSTACK_FILE_STORAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${body.appCode}/hdfs/directoryandfile?parentPath=${body.path}`,
      schema: {}
    },
    path:body.query,
    callback
  }
}

export function getFileStorage(body, callback) {
  return (dispath) => {
    return dispath(fetchFileStorage(body, callback))
  }
}

export const RESTORE_FILE_STORAGE = 'RESTORE_FILE_STORAGE'
export function restoreStoreage() {
  return {
    type: RESTORE_FILE_STORAGE
  }
}

// /openstack/big_data/apps/:appCode/hdfs/app-share
export const POST_OPENSTACK_APP_SHARE_REQUEST = 'POST_OPENSTACK_APP_SHARE_REQUEST'
export const POST_OPENSTACK_APP_SHARE_SUCCESS = 'POST_OPENSTACK_APP_SHARE_SUCCESS'
export const POST_OPENSTACK_APP_SHARE_FAILURE = 'POST_OPENSTACK_APP_SHARE_FAILURE'

function fetchAppShare(appCode,body, callback) {
  return {
    [FETCH_API]: {
      types:[POST_OPENSTACK_APP_SHARE_REQUEST,POST_OPENSTACK_APP_SHARE_SUCCESS,POST_OPENSTACK_APP_SHARE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${appCode}/hdfs/app-share`,
      schema: {},
      options:{
        method:'POST',
        body:body
      }
    },
    callback
  }
}

export function setAppShare(appCode,body, callback) {
  return (dispath) => {
    return dispath(fetchAppShare(appCode, body, callback))
  }
}

// global-share
export const POST_OPENSTACK_GLOBAL_SHARE_REQUEST = 'POST_OPENSTACK_GLOBAL_SHARE_REQUEST'
export const POST_OPENSTACK_GLOBAL_SHARE_SUCCESS = 'POST_OPENSTACK_GLOBAL_SHARE_SUCCESS'
export const POST_OPENSTACK_GLOBAL_SHARE_FAILURE = 'POST_OPENSTACK_GLOBAL_SHARE_FAILURE'

function fetchGlobalShare(appCode,body, callback) {
  return {
    [FETCH_API]: {
      types:[POST_OPENSTACK_GLOBAL_SHARE_REQUEST,POST_OPENSTACK_GLOBAL_SHARE_SUCCESS,POST_OPENSTACK_GLOBAL_SHARE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${appCode}/hdfs/global-share`,
      schema: {},
      options:{
        method:'POST',
        body:body
      }
    },
    callback
  }
}

export function globalShare(appCode,body, callback) {
  return (dispath) => {
    return dispath(fetchGlobalShare(appCode, body, callback))
  }
}

export const CREATE_OPENSTACK_FILE_DIRECTORY_REQUEST = 'CREATE_OPENSTACK_FILE_DIRECTORY_REQUEST'
export const CREATE_OPENSTACK_FILE_DIRECTORY_SUCCESS = 'CREATE_OPENSTACK_FILE_DIRECTORY_SUCCESS'
export const CREATE_OPENSTACK_FILE_DIRECTORY_FAILURE = 'CREATE_OPENSTACK_FILE_DIRECTORY_FAILURE'

function fetchDirectory(body,callback) {
  return {
    [FETCH_API]: {
      types:[CREATE_OPENSTACK_FILE_DIRECTORY_REQUEST,CREATE_OPENSTACK_FILE_DIRECTORY_SUCCESS,CREATE_OPENSTACK_FILE_DIRECTORY_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${body.appCode}/hdfs/directory`,
      schema: {},
      options:{
        method:'POST',
        body:{
          filePath: body.filePath
        }
      }
    },
    callback
  }
}

export function createDirectory(body, callback) {
  return (dispath)=> {
    return dispath(fetchDirectory(body, callback))
  }
}

export const RENAME_OPENSTACK_FILE_DIRECTORY_REQUEST = 'RENAME_OPENSTACK_FILE_DIRECTORY_REQUEST'
export const RENAME_OPENSTACK_FILE_DIRECTORY_SUCCESS = 'RENAME_OPENSTACK_FILE_DIRECTORY_SUCCESS'
export const RENAME_OPENSTACK_FILE_DIRECTORY_FAILURE = 'RENAME_OPENSTACK_FILE_DIRECTORY_FAILURE'

function fetchRenameDirectory(appCode,body,callback) {
  return {
    [FETCH_API]: {
      types:[RENAME_OPENSTACK_FILE_DIRECTORY_REQUEST,RENAME_OPENSTACK_FILE_DIRECTORY_SUCCESS,RENAME_OPENSTACK_FILE_DIRECTORY_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${appCode}/hdfs/rename`,
      schema: {},
      options:{
        method:'PUT',
        body
      }
    },
    callback
  }
}

export function renameDirectory(appCode, body, callback) {
  return (dispath)=> {
    return dispath(fetchRenameDirectory(appCode, body, callback))
  }
}

export const DELETE_OPENSTACK_FILE_DIRECTORY_REQUEST = 'DELETE_OPENSTACK_FILE_DIRECTORY_REQUEST'
export const DELETE_OPENSTACK_FILE_DIRECTORY_SUCCESS = 'DELETE_OPENSTACK_FILE_DIRECTORY_SUCCESS'
export const DELETE_OPENSTACK_FILE_DIRECTORY_FAILURE = 'DELETE_OPENSTACK_FILE_DIRECTORY_FAILURE'

function fetchdeleteDirectory(appCode,body,callback) {
  return {
    [FETCH_API]: {
      types:[DELETE_OPENSTACK_FILE_DIRECTORY_REQUEST,DELETE_OPENSTACK_FILE_DIRECTORY_SUCCESS,DELETE_OPENSTACK_FILE_DIRECTORY_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${appCode}/hdfs/batch-delete`,
      schema: {},
      options:{
        method:'POST',
        body
      }
    },
    callback
  }
}

export function deleteDirectory(appCode, body, callback) {
  return (dispath)=> {
    return dispath(fetchdeleteDirectory(appCode, body, callback))
  }
}


export const UPLOAD_OPENSTACK_FILE_REQUEST = 'UPLOAD_OPENSTACK_FILE_REQUEST'
export const UPLOAD_OPENSTACK_FILE_SUCCESS = 'UPLOAD_OPENSTACK_FILE_SUCCESS'
export const UPLOAD_OPENSTACK_FILE_FAILURE = 'UPLOAD_OPENSTACK_FILE_FAILURE'

function fetchUploadFile(appCode,body,callback) {
  return {
    [FETCH_API]: {
      types:[UPLOAD_OPENSTACK_FILE_REQUEST,UPLOAD_OPENSTACK_FILE_SUCCESS,UPLOAD_OPENSTACK_FILE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${appCode}/hdfs/file`,
      schema: {},
      options:{
        method:'POST',
        body
      }
    },
    callback
  }
}

export function uploadFile(appCode, body, callback) {
  return (dispath)=> {
    return dispath(fetchUploadFile(appCode, body, callback))
  }
}

export const GET_OPENSTACK_FILE_CONTENT_REQUEST = 'GET_OPENSTACK_FILE_CONTENT_REQUEST'
export const GET_OPENSTACK_FILE_CONTENT_SUCCESS = 'GET_OPENSTACK_FILE_CONTENT_SUCCESS'
export const GET_OPENSTACK_FILE_CONTENT_FAILURE = 'GET_OPENSTACK_FILE_CONTENT_FAILURE'

function fetchFileContent(body,callback) {
  return {
    [FETCH_API]: {
      types:[GET_OPENSTACK_FILE_CONTENT_REQUEST,GET_OPENSTACK_FILE_CONTENT_SUCCESS,GET_OPENSTACK_FILE_CONTENT_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${body.appCode}/hdfs/file/content?filePath=${body.filePath}`,
      schema: {},
    },
    callback
  }
}

export function fileContent(body, callback) {
  return (dispath)=> {
    return dispath(fetchFileContent(body, callback))
  }
}

// share-files
export const GET_OPENSTACK_SHARE_FILES_REQUEST = 'GET_OPENSTACK_SHARE_FILES_REQUEST'
export const GET_OPENSTACK_SHARE_FILES_SUCCESS = 'GET_OPENSTACK_SHARE_FILES_SUCCESS'
export const GET_OPENSTACK_SHARE_FILES_FAILURE = 'GET_OPENSTACK_SHARE_FILES_FAILURE'

function fetchShareFiles(body,callback) {
  // shareType: 01为app || 02为目录
  // appCode=${body.appCode}&shareType=${body.shareType}
  return {
    [FETCH_API]: {
      types:[GET_OPENSTACK_SHARE_FILES_REQUEST,GET_OPENSTACK_SHARE_FILES_SUCCESS,GET_OPENSTACK_SHARE_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/big_data/apps/${body.appCode}/hdfs/share-files?${toQuerystring(body)}`,
      schema: {},
    },
    callback
  }
}

export function showShareFiles(body, callback) {
  return (dispath)=> {
    return dispath(fetchShareFiles(body, callback))
  }
}

export const OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_REQUEST = 'OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_REQUEST'
export const OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_SUCCESS = 'OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_SUCCESS'
export const OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_FAILURE = 'OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_FAILURE'

function fetchGetObjectStorageCopy(body, query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/object_storage/object/copy`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_REQUEST, OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_SUCCESS, OPENSTACK_GET_OBJECT_STORAGE_DETAIL_COPY_FAILURE],
      endpoint,
      schema: {},
      options: {
        method:"PUT",
        body
      }
    },
    callback
  }
}

export function objectStorageDetailCopy(body, query, callback) {
  return (dispath) => {
    return dispath(fetchGetObjectStorageCopy(body, query, callback))
  }
}

export const OPENSTACK_GET_VOLUME_TYPE_REQUEST = 'OPENSTACK_GET_VOLUME_TYPE_REQUEST'
export const OPENSTACK_GET_VOLUME_TYPE_SUCCESS = 'OPENSTACK_GET_VOLUME_TYPE_SUCCESS'
export const OPENSTACK_GET_VOLUME_TYPE_FAILURE = 'OPENSTACK_GET_VOLUME_TYPE_FAILURE'
function fetchVolumeType(query, callback) {
  let endpointUrl = `${API_URL_PREFIX}/openstack/volumes/types`
  if (query) {
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [OPENSTACK_GET_VOLUME_TYPE_REQUEST, OPENSTACK_GET_VOLUME_TYPE_SUCCESS, OPENSTACK_GET_VOLUME_TYPE_FAILURE],
      endpoint: endpointUrl,
      schema: {}
    },
    callback
  }
}

export function getVolumeType(query, callback) {
  return (dispath, getState) => {
    return dispath(fetchVolumeType(query, callback))
  }
}


export const OPENSTACK_CLEAR_VOLUME_LIST = 'OPENSTACK_CLEAR_VOLUME_LIST'
export function clearVolumeList() {
  return {
    type: OPENSTACK_CLEAR_VOLUME_LIST
  }
}


export const OPENSTACK_CLEAR_OBJECT_STORAGE_LIST = 'OPENSTACK_CLEAR_OBJECT_STORAGE_LIST'
export function clearObjectStorageList() {
  return {
    type: OPENSTACK_CLEAR_OBJECT_STORAGE_LIST
  }
}


