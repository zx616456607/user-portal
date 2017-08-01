/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for VM wrap
 *
 * v0.1 - 2017-07-28
 * @author ZhaoYanbei
 */

 /**
  * 查询所有权限
  */
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const TENANT_OVERVIEW_INFOS_REQUEST = 'TENANT_OVERVIEW_INFOS_REQUEST'
export const TENANT_OVERVIEW_INFOS_SUCCESS = 'TENANT_OVERVIEW_INFOS_SUCCESS'
export const TENANT_OVERVIEW_INFOS_FAILURE = 'TENANT_OVERVIEW_INFOS_FAILURE'

function fetchOVinfoList(query, callback){
  let endpoint = `${API_URL_PREFIX}/permission`

  return {
    [FETCH_API]: {
      types: [TENANT_OVERVIEW_INFOS_REQUEST, TENANT_OVERVIEW_INFOS_SUCCESS, TENANT_OVERVIEW_INFOS_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

export function fetchinfoList(query, callback){
  return (dispatch) => {
      return dispatch(fetchOVinfoList(query, callback))
  }
}

/**
 * 查询单独权限
 */
export const TENANT_OVERVIEW_LIST_REQUEST = 'TENANT_OVERVIEW_LIST_REQUEST'
export const TENANT_OVERVIEW_LIST_SUCCESS = 'TENANT_OVERVIEW_LIST_SUCCESS'
export const TENANT_OVERVIEW_LIST_FAILURE = 'TENANT_OVERVIEW_LIST_FAILURE'

function searchinfoList(body, callback){
  debugger
  let endpoint = `${API_URL_PREFIX}/permission/${body.id}/retrieve`

  return {
    [FETCH_API]: {
      types: [TENANT_OVERVIEW_LIST_REQUEST, TENANT_OVERVIEW_LIST_SUCCESS, TENANT_OVERVIEW_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

export function getSearchList(body, callback){
  return (dispatch) => {
    return dispatch(searchinfoList(body, callback))
  }
}