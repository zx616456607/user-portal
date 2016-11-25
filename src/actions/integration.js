/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for integration cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const GET_ALL_INTEGRATION_LIST_REQUEST = 'GET_ALL_INTEGRATION_LIST_REQUEST'
export const GET_ALL_INTEGRATION_LIST_SUCCESS = 'GET_ALL_INTEGRATION_LIST_SUCCESS'
export const GET_ALL_INTEGRATION_LIST_FAILURE = 'GET_ALL_INTEGRATION_LIST_FAILURE'

function fetchAllIntegration(callback) {
  return {
    [FETCH_API]: {
      types: [GET_ALL_INTEGRATION_LIST_REQUEST, GET_ALL_INTEGRATION_LIST_SUCCESS, GET_ALL_INTEGRATION_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/integrations/getAllIntegration`,
      schema: {}
    },
    callback
  }
}

export function getAllIntegration(callback) {
  return (dispatch) => {
    return dispatch(fetchAllIntegration(callback))
  }
}