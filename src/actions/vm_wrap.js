/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for VM wrap
 *
 * v0.1 - 2017-07-20
 * @author Zhangpc, ZhangXuan, ZhaoYanbei
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const VM_WRAP_VMINFOS_REQUEST = 'VM_WRAP_VMINFOS_REQUEST'
export const VM_WRAP_VMINFOS_SUCCESS = 'VM_WRAP_VMINFOS_SUCCESS'
export const VM_WRAP_VMINFOS_FAILURE = 'VM_WRAP_VMINFOS_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchVMinfosList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/vminfos`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [VM_WRAP_VMINFOS_REQUEST, VM_WRAP_VMINFOS_SUCCESS, VM_WRAP_VMINFOS_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function getVMinfosList(query, callback) {
  return (dispatch) => {
    return dispatch(fetchVMinfosList(query, callback))
  }
}
