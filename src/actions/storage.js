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

export function fetchStorageList(pool, cluster, query, callback) {
  return {
    pool,
    [FETCH_API]: {
      types: [STORAGE_LIST_REQUEST, STORAGE_LIST_SUCCESS, STORAGE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes?appname=${query}`,
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}

export function loadStorageList(pool, cluster, query) {
  return (dispath, getState) => {
    const state = getState().storage.storageList
    dispath(fetchStorageList(pool, cluster, query))
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
      endpoint: `${API_URL_PREFIX}/storage-pools/${obj.pool}/${obj.cluster}/volumes`,
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
export const STORAGE_DETAIL_CHANGE = 'STORAGE_DETAIL_CHANGE'
export function loadStorageInfo(pool, cluster, name) {
  console.log(`${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${name}`)
  return {
    pool,
    [FETCH_API]: {
      types: [STORAGE_DETAIL_REQUEST, STORAGE_DETAIL_SUCCESS, STORAGE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${name}`,
      options: {
        method: 'GET'
      },
      schema: {}//Schemas.STORAGE
    }
  }
}

export function changeStorageDetail(storageInfo) {
  return {
    type: STORAGE_DETAIL_CHANGE,
    storageInfo
  }
}

export const STORAGE_DELETE_REQUEST = 'STORAGE_DELETE_REQUEST'
export const STORAGE_DELETE_SUCCESS = 'STORAGE_DELETE_SUCCESS'
export const STORAGE_DELETE_FAILURE = 'STORAGE_DELETE_FAILURE'

export function deleteStorage(pool, cluster, storageIdArray, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_DELETE_REQUEST, STORAGE_DELETE_SUCCESS, STORAGE_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/batch-delete`,
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

export function formateStorage(pool, cluster, storage, callback) {
    return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_FORMATE_REQUEST, STORAGE_FORMATE_SUCCESS, STORAGE_FORMATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/format`,
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

export function resizeStorage(pool, cluster, storage, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_RESIZE_REQUEST, STORAGE_RESIZE_SUCCESS, STORAGE_RESIZE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/size`,
      options: {
        method: 'PUT',
        body: storage
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export const STORAGE_UPLOAD_REQUEST = 'STORAGE_UPLOAD_REQUEST'
export const STORAGE_UPLOAD_SUCCESS = 'STORAGE_UPLOAD_SUCCESS'
export const STORAGE_UPLOAD_FAILURE = 'STORAGE_UPLOAD_FAILURE'
export const STORAGE_UPLOADING      = 'STORAGE_UPLOADING'
export const STORAGE_MERGE_UPLOADINGFILE = 'STORAGE_MERGE_UPLOADINGFILE'

export function uploadFile(pool, cluster, storage, callback) {
  return {
    [FETCH_API]: {
      pool,
      types: [STORAGE_UPLOAD_REQUEST, STORAGE_UPLOAD_SUCCESS, STORAGE_UPLOAD_FAILURE],
      options: {
        method: 'POST',
        body: storage,
      },
      schema: {}
    },
    callback
  }
}


export const STORAGE_FILEHISTORY_REQUEST = 'STORAGE_FILEHISTORY_REQUEST'
export const STORAGE_FILEHISTORY_SUCCESS = 'STORAGE_FILEHISTORY_SUCCESS'
export const STORAGE_FILEHISTORY_FAILURE = 'STORAGE_FILEHISTORY_FAILURE'

export function getStorageFileHistory(pool, cluster, volume, callback) {
  return {
    [FETCH_API]: {
      pool,
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volume}/filehistory`,
      types: [STORAGE_FILEHISTORY_REQUEST, STORAGE_FILEHISTORY_SUCCESS, STORAGE_FILEHISTORY_FAILURE],
      schema: {}
    },
    callback
  }
}



export function getUploadFileUlr(pool, cluster, volume) {
  return `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volume}/import`
}

export function uploadFileRequest(file) {
  return {
    type: STORAGE_UPLOAD_REQUEST,
  }
}

export function uploadFileSuccess() {
  return {
    type: STORAGE_UPLOAD_SUCCESS
  }
}

export function uploadFileFailure(err) {
  return {
    type: STORAGE_UPLOAD_FAILURE,
    error: err
  }
}

export function uploading(percent) {
  return {
    type: STORAGE_UPLOADING,
    percent
  }
}

export function mergeUploadingIntoList(uploadingFile) {
  return {
    type: STORAGE_MERGE_UPLOADINGFILE,
    file: uploadingFile
  }
}


export const STORAGE_BEFORE_UPLOADFILE_REQUEST = 'STORAGE_BEFORE_UPLOADFILE_REQUEST'
export const STORAGE_BEFORE_UPLOADFILE_SUCCESS = 'STORAGE_BEFORE_UPLOADFILE_SUCCESS'
export const STORAGE_BEFORE_UPLOADFILE_FAILURE = 'STORAGE_BEFORE_UPLOADFILE_FAILURE'
 
export function beforeUploadFile(pool, cluster, volume, file, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_BEFORE_UPLOADFILE_REQUEST, STORAGE_BEFORE_UPLOADFILE_SUCCESS, STORAGE_BEFORE_UPLOADFILE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volume}/beforeimport`,
      schema: {},
      options: {
        method: 'POST',
        body:  {
          fileName: file.name,
          size: file.size,
          isUnzip: file.isUnzip
        }
      }
    },
    callback
  }
}

export const STORAGE_GETVOLUMEBIND_REQUEST = 'STORAGE_GETVOLUMEBIND_REQUEST'
export const STORAGE_GETVOLUMEBIND_SUCCESS = 'STORAGE_GETVOLUMEBIND_SUCCESS'
export const STORAGE_GETVOLUMEBIND_FAILURE = 'STORAGE_GETVOLUMEBIND_FAILURE'

export function getVolumeBindInfo(pool, cluster, volumeName, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_GETVOLUMEBIND_REQUEST, STORAGE_GETVOLUMEBIND_SUCCESS, STORAGE_GETVOLUMEBIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volumeName}/bindinfo`,
      schema: {}
    },
    callback
  }
}

export const STORAGE_CHANGE_UPLOADOPTIONS = 'STORAGE_CHANGE_UPLOADOPTIONS'
export function uploadFileOptions(options) {
  return {
    type: STORAGE_CHANGE_UPLOADOPTIONS,
    options
  }
}

export const STORAGE_EXPORT_FILE_REQUEST = 'STORAGE_EXPORT_FILE_REQUEST'
export const STORAGE_EXPORT_FILE_SUCCESS = 'STORAGE_EXPORT_FILE_SUCCESS'
export const STORAGE_EXPORT_FILE_FAILURE = 'STORAGE_EXPORT_FILE_FAILURE'

export function exportFile(pool, cluster, volumeName, callback) {
  return {
    [FETCH_API]: {
      types: [STORAGE_EXPORT_FILE_REQUEST, STORAGE_EXPORT_FILE_SUCCESS, STORAGE_EXPORT_FILE_FAILURE],
      endpoint: `${API_URL_PREFIX}/storage-pools/${pool}/${cluster}/volumes/${volumeName}/exportfile`
    },
    callback
  }
}