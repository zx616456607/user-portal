/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group list
 *
 * v2.0 - 2016/9/26
 * @author ZhaoXueYu BaiYu
 */
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const CONFIG_LIST_REQUEST = 'CONFIG_LIST_REQUEST'
export const CONFIG_LIST_SUCCESS = 'CONFIG_LIST_SUCCESS'
export const CONFIG_LIST_FAILURE = 'CONFIG_LIST_FAILURE'

export function loadConfigGroup(cluster, headers, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [CONFIG_LIST_REQUEST, CONFIG_LIST_SUCCESS, CONFIG_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/configgroups`,
      schema: Schemas.CONFIGS,
      options: {
        headers
      }
    },
    callback: callback
  }
}

export const GET_CONFIG_FILES_REQUEST = 'GET_CONFIG_FILES_REQUEST'
export const GET_CONFIG_FILES_SUCCESS = 'GET_CONFIG_FILES_SUCCESS'
export const GET_CONFIG_FILES_FAILURE = 'GET_CONFIG_FILES_FAILURE'
export const ADD_CONFIG_FILES = 'ADD_CONFIG_FILES'
export const DELETE_CONFIG_FILES = 'DELETE_CONFIG_FILES'
// get config files
export function configGroupName(obj) {
  return {
    cluster: obj.cluster,
    configName: obj.group,
    [FETCH_API]: {
      types: [GET_CONFIG_FILES_REQUEST, GET_CONFIG_FILES_SUCCESS, GET_CONFIG_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}`,
      options: {
        method: 'GET',
      },
      schema: {}
    },
  }
}

export function addConfigFile(configFile) {
  return {
    type: ADD_CONFIG_FILES,
    configFile
  }
}

export function deleteConfigFile(configFile) {
  return {
    type: DELETE_CONFIG_FILES,
    configFile
  }
}

export const CONFIG_listName_REQUEST = 'CONFIG_listName_REQUEST'
export const CONFIG_LISTName_SUCCESS = 'CONFIG_LISTName_SUCCESS'
export const CONFIG_LISTName_FAILURE = 'CONFIG_LISTName_FAILURE'

// get config  file name => data
export function loadConfigName(cluster, obj, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [CONFIG_listName_REQUEST, CONFIG_LISTName_SUCCESS, CONFIG_LISTName_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/configgroups/${obj.group}/configs/${obj.Name}`,
      schema: {}
    },
    callback: callback
  }
}

export const CREATE_CONFIG_GROUP_REQUEST = 'CREATE_CONFIG_GROUP_REQUEST'
export const CREATE_CONFIG_GROUP_SUCCESS = 'CREATE_CONFIG_GROUP_SUCCESS'
export const CREATE_CONFIG_GROUP_FAILURE = 'CREATE_CONFIG_GROUP_FAILURE'

export function createConfigGroup(body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_CONFIG_GROUP_REQUEST, CREATE_CONFIG_GROUP_SUCCESS, CREATE_CONFIG_GROUP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/configs`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback: callback
  }
}

export const DELETE_CONFIG_GROUP_REQUEST = 'DELETE_CONFIG_GROUP_REQUEST'
export const DELETE_CONFIG_GROUP_SUCCESS = 'DELETE_CONFIG_GROUP_SUCCESS'
export const DELETE_CONFIG_GROUP_FAILURE = 'DELETE_CONFIG_GROUP_FAILURE'

export function deleteConfigGroup(obj, callback) {
  return {
    cluster: obj.cluster,
    groupName: obj.groups,
    [FETCH_API]: {
      types: [DELETE_CONFIG_GROUP_REQUEST, DELETE_CONFIG_GROUP_SUCCESS, DELETE_CONFIG_GROUP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configs/delete`,
      options: {
        method: 'POST',
        body: { "groups": obj.groups }
      },
      schema: {}
    },
    callback: callback
  }
}

export const CREATE_CONFIG_FILES_REQUEST = 'CREATE_CONFIG_FILES_REQUEST'
export const CREATE_CONFIG_FILES_SUCCESS = 'CREATE_CONFIG_FILES_SUCCESS'
export const CREATE_CONFIG_FILES_FAILURE = 'CREATE_CONFIG_FILES_FAILURE'

export function createConfigFiles(obj, callback) {
  return {
    cluster: obj.cluster,
    [FETCH_API]: {
      types: [CREATE_CONFIG_FILES_REQUEST, CREATE_CONFIG_FILES_SUCCESS, CREATE_CONFIG_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}/configs/${obj.name}`,
      options: {
        method: 'POST',
        body: { 'groupFiles': obj.desc }
      },
      schema: {}
    },
    callback: callback
  }
}

export const DELETE_CONFIG_FILES_REQUEST = 'DELETE_CONFIG_FILES_REQUEST'
export const DELETE_CONFIG_FILES_SUCCESS = 'DELETE_CONFIG_FILES_SUCCESS'
export const DELETE_CONFIG_FILES_FAILURE = 'DELETE_CONFIG_FILES_FAILURE'

export function deleteConfigName(obj, callback) {
  return {
    cluster: obj.cluster,
    [FETCH_API]: {
      types: [DELETE_CONFIG_FILES_REQUEST, DELETE_CONFIG_FILES_SUCCESS, DELETE_CONFIG_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}/configs-batch-delete`,
      options: {
        method: 'POST',
        body: { "configs": obj.configs }
      },
      schema: {}
    },
    callback: callback
  }
}

export const UPDATE_CONFIG_FILES_REQUEST = 'UPDATE_CONFIG_FILES_REQUEST'
export const UPDATE_CONFIG_FILES_SUCCESS = 'UPDATE_CONFIG_FILES_SUCCESS'
export const UPDATE_CONFIG_FILES_FAILURE = 'UPDATE_CONFIG_FILES_FAILURE'

export function updateConfigName(obj, callback) {
  return {
    cluster: obj.cluster,
    [FETCH_API]: {
      types: [UPDATE_CONFIG_FILES_REQUEST, UPDATE_CONFIG_FILES_SUCCESS, UPDATE_CONFIG_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}/configs/${obj.name}`,
      options: {
        method: 'PUT',
        body: { "desc": obj.desc }
      },
      schema: {}
    },
    callback: callback
  }
}

export const UPDATE_CONFIG_ANNOTATIONS_REQUEST = 'UPDATE_CONFIG_ANNOTATIONS_REQUEST'
export const UPDATE_CONFIG_ANNOTATIONS_SUCCESS = 'UPDATE_CONFIG_ANNOTATIONS_SUCCESS'
export const UPDATE_CONFIG_ANNOTATIONS_FAILURE = 'UPDATE_CONFIG_ANNOTATIONS_FAILURE'

export function updateConfigAnnotations(body,callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_CONFIG_ANNOTATIONS_REQUEST,UPDATE_CONFIG_ANNOTATIONS_SUCCESS,UPDATE_CONFIG_ANNOTATIONS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/configgroups/${body.groupName}`,
      options: {
        method: 'PUT',
        body: {configlabels: body.configlabels}
      },
      schema: {}
    },
    callback: callback
  }
}

// export function updateConfigAnnotations(body,callback) {
//   return (dispatch,getState) => {
//     dispatch(fetchUpdateConfigAnnotations(body,callback))
//   }
// }