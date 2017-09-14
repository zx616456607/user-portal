/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Apm aciton
 *
 * 2017-08-16
 * @author zhangpc
 */

import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const APMS_REQUEST = 'APMS_REQUEST'
export const APMS_SUCCESS = 'APMS_SUCCESS'
export const APMS_FAILURE = 'APMS_FAILURE'

const fetchApms = clusterID => {
  return {
    clusterID,
    [FETCH_API]: {
      types: [ APMS_REQUEST, APMS_SUCCESS, APMS_FAILURE ],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/apms`,
      schema: {},
    },
  }
}

export const loadApms = clusterID => dispatch => {
  return dispatch(fetchApms(clusterID))
}
