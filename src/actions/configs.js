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
import { toQuerystring } from '../common/tools'

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

export function createConfigFiles(obj, body, callback) {
  return {
    cluster: obj.cluster,
    [FETCH_API]: {
      types: [CREATE_CONFIG_FILES_REQUEST, CREATE_CONFIG_FILES_SUCCESS, CREATE_CONFIG_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}/configs/${obj.name}`,
      options: {
        method: 'POST',
        body,
      },
      schema: {}
    },
    callback: callback
  }
}
export function dispatchCreateConfig(obj, body, callback) {
  return (dispatch, getState) => {
    return dispatch(createConfigFiles(obj, body, callback))
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

export function updateConfigName(obj, body, callback) {
  return {
    cluster: obj.cluster,
    [FETCH_API]: {
      types: [UPDATE_CONFIG_FILES_REQUEST, UPDATE_CONFIG_FILES_SUCCESS, UPDATE_CONFIG_FILES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${obj.cluster}/configgroups/${obj.group}/configs/${obj.name}`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {}
    },
    callback: callback
  }
}

export function dispatchUpdateConfig(obj, body, callback) {
  return (dispatch, getState) => {
    return dispatch(updateConfigName(obj, body, callback))
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

const CHECK_CONFIG_GROUP_NAME_REQUEST = 'CHECK_CONFIG_GROUP_NAME_REQUEST'
const CHECK_CONFIG_GROUP_NAME_SUCCESS = 'CHECK_CONFIG_GROUP_NAME_SUCCESS'
const CHECK_CONFIG_GROUP_NAME_FAILURE = 'CHECK_CONFIG_GROUP_NAME_FAILURE'

export function checkConfigNameExistence(clusterId, name, callback) {
  return {
    [FETCH_API]: {
      types: [
        CHECK_CONFIG_GROUP_NAME_REQUEST,
        CHECK_CONFIG_GROUP_NAME_SUCCESS,
        CHECK_CONFIG_GROUP_NAME_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/configgroups/${name}/verify`,
      schema: {},
    },
    callback,
  }
}

const GET_GIT_BRANCHS_REQUEST = 'GET_GIT_BRANCHS_REQUEST'
const GET_GIT_BRANCHS_SUCCESS = 'GET_GIT_BRANCHS_SUCCESS'
const GET_GIT_BRANCHS_FAILURE = 'GET_GIT_BRANCHS_FAILURE'

export function fetchProjectBranches(query, callback) {
  return {
    [FETCH_API]: {
      types: [
        GET_GIT_BRANCHS_REQUEST,
        GET_GIT_BRANCHS_SUCCESS,
        GET_GIT_BRANCHS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/managed-projects/${query.project_id}/branches`,
      schema: {},
    },
    callback,
  }
}

export function getProjectBranches(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchProjectBranches(query, callback))
  }
}

export const GET_CONFIG_MAPS_REQUEST = 'GET_CONFIG_MAPS_REQUEST'
export const GET_CONFIG_MAPS_SUCCESS = 'GET_CONFIG_MAPS_SUCCESS'
export const GET_CONFIG_MAPS_FAILURE = 'GET_CONFIG_MAPS_FAILURE'

export function fetchConfigMaps(query, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        GET_CONFIG_MAPS_REQUEST,
        GET_CONFIG_MAPS_SUCCESS,
        GET_CONFIG_MAPS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/clusters/${query.cluster_id}`,
      schema: {},
    },
    callback,
  }
}

export function getConfigMaps(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchConfigMaps(query, callback))
  }
}

export const CREATE_CONFIG_MAPS_REQUEST = 'CREATE_CONFIG_MAPS_REQUEST'
export const CREATE_CONFIG_MAPS_SUCCESS = 'CREATE_CONFIG_MAPS_SUCCESS'
export const CREATE_CONFIG_MAPS_FAILURE = 'CREATE_CONFIG_MAPS_FAILURE'

export function fetchCreateConfigMaps(cluster_id, body, callback) {
  return {
    cluster: cluster_id,
    [FETCH_API]: {
      types: [
        CREATE_CONFIG_MAPS_REQUEST,
        CREATE_CONFIG_MAPS_SUCCESS,
        CREATE_CONFIG_MAPS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/clusters/${cluster_id}`,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback,
  }
}

export function createConfigMaps(cluster_id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateConfigMaps(cluster_id, body, callback))
  }
}

export const CREATE_CONFIG_REQUEST = 'CREATE_CONFIG_REQUEST'
export const CREATE_CONFIG_SUCCESS = 'CREATE_CONFIG_SUCCESS'
export const CREATE_CONFIG_FAILURE = 'CREATE_CONFIG_FAILURE'

export function fetchCreateConfig(configmap_name, cluster_id, body, callback) {
  return {
    [FETCH_API]: {
      types: [
        CREATE_CONFIG_REQUEST,
        CREATE_CONFIG_SUCCESS,
        CREATE_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/${configmap_name}/clusters/${cluster_id}/configs`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback,
  }
}

export function createConfig(configmap_name, cluster_id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateConfig(configmap_name, cluster_id, body, callback))
  }
}


export const GET_FILE_CONTENT_REQUEST = 'GET_FILE_CONTENT_REQUEST'
export const GET_FILE_CONTENT_SUCCESS = 'GET_FILE_CONTENT_SUCCESS'
export const GET_FILE_CONTENT_FAILURE = 'GET_FILE_CONTENT_FAILURE'

export function fetchGitFileContent(query, callback) {
  const pathName = query.path_name// .replace("./", "")
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        GET_FILE_CONTENT_REQUEST,
        GET_FILE_CONTENT_SUCCESS,
        GET_FILE_CONTENT_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/projects/${query.project_id}/branches/${query.branch_name}/path/${encodeURIComponent(pathName)}/files`,
      schema: {},
    },
    callback,
  }
}

// export function fetchGitFileContent(query, callback) {
//   let endpoint = `${API_URL_PREFIX}/devops/projects/${query.project_id}/branches/${query.branch_name}/files`
//   endpoint += `?${toQuerystring({ path_name: query.path_name})}`
//   return {
//     cluster: query.cluster_id,
//     [FETCH_API]: {
//       types: [
//         GET_FILE_CONTENT_REQUEST,
//         GET_FILE_CONTENT_SUCCESS,
//         GET_FILE_CONTENT_FAILURE,
//       ],
//       endpoint,
//       schema: {},
//     },
//     callback,
//   }
// }

export function getGitFileContent(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGitFileContent(query, callback))
  }
}

export const SET_COMFIG_MAP_LABEL_REQUEST = 'SET_COMFIG_MAP_LABEL_REQUEST'
export const SET_COMFIG_MAP_LABEL_SUCCESS = 'SET_COMFIG_MAP_LABEL_SUCCESS'
export const SET_COMFIG_MAP_LABEL_FAILURE = 'SET_COMFIG_MAP_LABEL_FAILURE'

export function fetchSetConfigMapLabel(configmap_name, cluster_id, body, callback) {
  return {
    [FETCH_API]: {
      types: [
        SET_COMFIG_MAP_LABEL_REQUEST,
        SET_COMFIG_MAP_LABEL_SUCCESS,
        SET_COMFIG_MAP_LABEL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/${configmap_name}/clusters/${cluster_id}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      },
    },
    callback,
  }
}

export function setConfigMapLabel(configmap_name, cluster_id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSetConfigMapLabel(configmap_name, cluster_id, body, callback))
  }
}

export const GET_CONFIG_REQUEST = 'GET_CONFIG_REQUEST'
export const GET_CONFIG_SUCCESS = 'GET_CONFIG_SUCCESS'
export const GET_CONFIG_FAILURE = 'GET_CONFIG_FAILURE'

export function fetchConfig(query, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        GET_CONFIG_REQUEST,
        GET_CONFIG_SUCCESS,
        GET_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/${query.configmap_name}/clusters/${query.cluster_id}/configs/${query.config_name}`,
      schema: {},
    },
    callback,
  }
}

export function getConfig(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchConfig(query, callback))
  }
}

export const DELETE_CONFIG_REQUEST = 'DELETE_CONFIG_REQUEST'
export const DELETE_CONFIG_SUCCESS = 'DELETE_CONFIG_SUCCESS'
export const DELETE_CONFIG_FAILURE = 'DELETE_CONFIG_FAILURE'

export function fetchDelConfig(query, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        DELETE_CONFIG_REQUEST,
        DELETE_CONFIG_SUCCESS,
        DELETE_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/${query.configmap_name}/clusters/${query.cluster_id}/configs/${query.config_name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  }
}

export function deleteConfig(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDelConfig(query, callback))
  }
}

export const UPDATE_CONFIG_REQUEST = 'UPDATE_CONFIG_REQUEST'
export const UPDATE_CONFIG_SUCCESS = 'UPDATE_CONFIG_SUCCESS'
export const UPDATE_CONFIG_FAILURE = 'UPDATE_CONFIG_FAILURE'

export function fetchUpdateConfig(query, body, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        UPDATE_CONFIG_REQUEST,
        UPDATE_CONFIG_SUCCESS,
        UPDATE_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/${query.configmap_name}/clusters/${query.cluster_id}/configs/${query.config_name}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  }
}

export function updateConfig(query, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateConfig(query, body, callback))
  }
}


export const DELETE_CONFIG_MAP_REQUEST = 'DELETE_CONFIG_MAP_REQUEST'
export const DELETE_CONFIG_MAP_SUCCESS = 'DELETE_CONFIG_MAP_SUCCESS'
export const DELETE_CONFIG_MAP_FAILURE = 'DELETE_CONFIG_MAP_FAILURE'

export function fetchDelConfigMap(cluster_id, body, callback) {
  return {
    [FETCH_API]: {
      types: [
        DELETE_CONFIG_MAP_REQUEST,
        DELETE_CONFIG_MAP_SUCCESS,
        DELETE_CONFIG_MAP_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/clusters/${cluster_id}`,
      schema: {},
      options: {
        method: 'DELETE',
        body,
      },
    },
    callback,
  }
}

export function deleteConfigMap(cluster_id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDelConfigMap(cluster_id, body, callback))
  }
}
