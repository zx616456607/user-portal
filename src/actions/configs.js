/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/26
 * @author ZhaoXueYu
 */
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const CONFIG_LIST_REQUEST = 'CONFIG_LIST_REQUEST'
export const CONFIG_LIST_SUCCESS = 'CONFIG_LIST_SUCCESS'
export const CONFIG_LIST_FAILURE = 'CONFIG_LIST_FAILURE'

function fetchConfigGroupList(cluster) {
  return {
    cluster,
    [FETCH_API]: {
      types: [CONFIG_LIST_REQUEST, CONFIG_LIST_SUCCESS, CONFIG_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/configs`,
      schema: Schemas.CONFIGS
    }
  }
}

export function loadConfigGroup(cluster, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchConfigGroupList(cluster))
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
        body: { groupId: obj.groupId }
      },
      schema: {}
    },
    callback: callback
  }
}