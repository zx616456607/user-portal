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
import { API_URL_PREFIX, DEFAULT_CLUSTER } from '../constants'

export const CONFIG_LIST_REQUEST = 'CONFIG_LIST_REQUEST'
export const CONFIG_LIST_SUCCESS = 'CONFIG_LIST_SUCCESS'
export const CONFIG_LIST_FAILURE = 'CONFIG_LIST_FAILURE'

function fetchConfigGroupList() {
  return {
    cluster: DEFAULT_CLUSTER,
    [FETCH_API]: {
      types: [CONFIG_LIST_REQUEST, CONFIG_LIST_SUCCESS, CONFIG_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${DEFAULT_CLUSTER}/configgroups`,
      schema: Schemas.CONFIGS
    }
  }
}

export function loadConfigGroup() {
  return (dispatch, getState) => {
    return dispatch(fetchConfigGroupList(DEFAULT_CLUSTER))
  }
}

export const GET_CONFIG_FILES_REQUEST = 'GET_CONFIG_FILES_REQUEST'
export const GET_CONFIG_FILES_SUCCESS = 'GET_CONFIG_FILES_SUCCESS'
export const GET_CONFIG_FILES_FAILURE = 'GET_CONFIG_FILES_FAILURE'

// get config files
// export function configGroupName(obj) {
//   return {
//         cluster: obj.cluster,
//         [FETCH_API]: {
//           types: [GET_CONFIG_FILES_REQUEST, GET_CONFIG_FILES_SUCCESS, GET_CONFIG_FILES_FAILURE],
//           endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}`,
//           options: {
//             method: 'GET',
//           },
//           schema: {}
//         },
//       }
  
// }
export function configGroupName(obj) {
  console.log('get config name  in action ……',obj)
  return {
    cluster: obj.cluster,
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

export const CONFIG_listName_REQUEST = 'CONFIG_listName_REQUEST'
export const CONFIG_LISTName_SUCCESS = 'CONFIG_LISTName_SUCCESS'
export const CONFIG_LISTName_FAILURE = 'CONFIG_LISTName_FAILURE'

// get config  file name => data
export function loadConfigName(obj, callback) {
  console.log('get name is to ',obj.Name)
    return {
    cluster: DEFAULT_CLUSTER,
    [FETCH_API]:{
      types:[CONFIG_listName_REQUEST,CONFIG_LISTName_SUCCESS,CONFIG_LISTName_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${DEFAULT_CLUSTER}/configgroups/${obj.group}/configs/${obj.Name}`,
      options: {
        method: 'GET',
        body: { name: obj.Name }
      },
      schema: {}
    },
    callback: callback
  }
}

export const CREATE_CONFIG_GROUP_REQUEST = 'CREATE_CONFIG_GROUP_REQUEST'
export const CREATE_CONFIG_GROUP_SUCCESS = 'CREATE_CONFIG_GROUP_SUCCESS'
export const CREATE_CONFIG_GROUP_FAILURE = 'CREATE_CONFIG_GROUP_FAILURE'

export function createConfigGroup(obj, callback) {
  return {
    cluster: obj.cluster,
    [FETCH_API]:{
      types:[CREATE_CONFIG_GROUP_REQUEST,CREATE_CONFIG_GROUP_SUCCESS,CREATE_CONFIG_GROUP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configs`,
      options: {
        method: 'POST',
        body: { groupName: obj.groupName }
      },
      schema: {}
    },
    callback: callback
  }
}

export const DELETE_CONFIG_REQUEST = 'DELETE_CONFIG_REQUEST'
export const DELETE_CONFIG_SUCCESS = 'DELETE_CONFIG_SUCCESS'
export const DELETE_CONFIG_FAILURE = 'DELETE_CONFIG_FAILURE'

export function deleteConfigGroup(obj, callback) {
  console.log('type ',obj)
  return {
    cluster: obj.cluster,
    [FETCH_API]: {
      types: [DELETE_CONFIG_REQUEST, DELETE_CONFIG_SUCCESS, DELETE_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configs/delete`,
      options: {
        method: 'POST',
        body: { "groups":obj.groups }
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
        body: {'groupFiles': obj.desc} 
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
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}/configs/batch-delete`,
      options: {
        method: 'POST',
        body: {"configs": obj.configs}
      },
      schema: {}
    },
    callback: callback
  }
}