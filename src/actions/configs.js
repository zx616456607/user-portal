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




