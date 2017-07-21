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

/**
 * 查询传统环境信息
 * @type {string}
 */
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
/**
 * 添加传统环境
 * @type {string}
 */
export const VM_WRAP_VMADD_REQUEST = 'VM_WRAP_VMADD_REQUEST'
export const VM_WRAP_VMADD_SUCCESS = 'VM_WRAP_VMADD_SUCCESS'
export const VM_WRAP_VMADD_FAILURE = 'VM_WRAP_VMADD_FAILURE'

function addVMinfosList(body, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/vminfos`
  if(state){
    endpoint += `?${toQuerystring(query)}`
  }
  return{
    [FETCH_API]: {
      types: [VM_WRAP_VMADD_REQUEST, VM_WRAP_VMADD_SUCCESS, VM_WRAP_VMADD_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body,
      },
      schema:{}
    },
    callback,
  }
}

export function postVMinfoList(state, callback) {
  return(dispatch) => {
    return dispatch(addVMinfosList(state, callback))
  }
}

/**
 * 删除传统环境
 * @type {string}
 */
export const VM_WRAP_VMDEL_REQUEST = 'VM_WRAP_VMDEL_REQUEST'
export const VM_WRAP_VMDEL_SUCCESS = 'VM_WRAP_VMDEL_SUCCESS'
export const VM_WRAP_VMDEL_FAILURE = 'VM_WRAP_VMDEL_FAILURE'

function deleteVMInfoList(ID, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/vminfos/${ID.vmID}`
  return{
    [FETCH_API]: {
      types: [VM_WRAP_VMDEL_REQUEST, VM_WRAP_VMDEL_SUCCESS, VM_WRAP_VMDEL_FAILURE],
      endpoint,
      options: {
        method: 'DELTE'
      },
      schema:{}
    },
    callback,
  }
}

export function delVMInfoList(state, callback) {
  return(dispatch) => {
    return dispatch(deleteVMInfoList(state, callback))
  }
}

/**
 * 编辑传统信息
 * @type {string}
 */
export const VM_WRAP_VMPUT_REQUEST = 'VM_WRAP_VMPUT_REQUEST'
export const VM_WRAP_VMPUT_SUCCESS = 'VM_WRAP_VMPUT_SUCCESS'
export const VM_WRAP_VMPUT_FAILURE = 'VM_WRAP_VMPUT_FAILURE'

function EditVMInfo(state, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/vminfos/:vm_id`
  if(state){
    endpoint += `?${toQuerystring(state)}`
  }
  return{
    [FETCH_API]: {
      types: [VM_WRAP_VMPUT_REQUEST, VM_WRAP_VMPUT_SUCCESS, VM_WRAP_VMPUT_FAILURE],
      endpoint,
      options: {
        method: 'PUT',
        body: state,
      },
      schema:{}
    },
    callback,
  }
}

export function putVMInfoList(state, callback) {
  return(dispatch) => {
    return dispatch(EditVMInfo(state, callback))
  }
}
