/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'
// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}

export const SET_CLUSTER = 'SET_CLUSTER'
// Resets the currently visible error message.
export function setCluster(cluster) {
  return {
    cluster,
    type: SET_CLUSTER
  }
}