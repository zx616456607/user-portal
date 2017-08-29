/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for VM wrap
 *
 * v0.1 - 2017-08-01
 * @author ZhaoYanbei
 */

 /**
  * 概览
  */
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const TENANT_OVERVIEW_INFOS_REQUEST = 'TENANT_OVERVIEW_INFOS_REQUEST'
export const TENANT_OVERVIEW_INFOS_SUCCESS = 'TENANT_OVERVIEW_INFOS_SUCCESS'
export const TENANT_OVERVIEW_INFOS_FAILURE = 'TENANT_OVERVIEW_INFOS_FAILURE'

function fetchOVinfoList(query, callback){
  let endpoint = `${API_URL_PREFIX}/tenant/overview`

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