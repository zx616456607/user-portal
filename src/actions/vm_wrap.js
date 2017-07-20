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

export const VM_WRAP_CREATE_SERVICE_REQUEST = 'VM_WRAP_CREATE_SERVICE_REQUEST'
export const VM_WRAP_CREATE_SERVICE_SUCCESS = 'VM_WRAP_CREATE_SERVICE_SUCCESS'
export const VM_WRAP_CREATE_SERVICE_FAILURE = 'VM_WRAP_CREATE_SERVICE_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateService(body, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/services`
  return {
    [FETCH_API]: {
      types: [VM_WRAP_CREATE_SERVICE_REQUEST, VM_WRAP_CREATE_SERVICE_SUCCESS, VM_WRAP_CREATE_SERVICE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: body
      },
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function createVMservice(query, callback) {
  return (dispatch) => {
    return dispatch(fetchCreateService(query, callback))
  }
}

export const VM_WRAP_SERVICE_LIST_REQUEST = 'VM_WRAP_SERVICE_LIST_REQUEST'
export const VM_WRAP_SERVICE_LIST_SUCCESS = 'VM_WRAP_SERVICE_LIST_SUCCESS'
export const VM_WRAP_SERVICE_LIST_FAILURE = 'VM_WRAP_SERVICE_LIST_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/services`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [VM_WRAP_SERVICE_LIST_REQUEST, VM_WRAP_SERVICE_LIST_SUCCESS, VM_WRAP_SERVICE_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function getVMserviceList(query, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceList(query, callback))
  }
}

export const VM_WRAP_SERVICE_DELETE_REQUEST = 'VM_WRAP_SERVICE_DELETE_REQUEST'
export const VM_WRAP_SERVICE_DELETE_SUCCESS = 'VM_WRAP_SERVICE_DELETE_SUCCESS'
export const VM_WRAP_SERVICE_DELETE_FAILURE = 'VM_WRAP_SERVICE_DELETE_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceDelete(body, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/services/${body.serviceId}`
  return {
    [FETCH_API]: {
      types: [VM_WRAP_SERVICE_DELETE_REQUEST, VM_WRAP_SERVICE_DELETE_SUCCESS, VM_WRAP_SERVICE_DELETE_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE'
      },
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function vmServiceDelete(body, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceDelete(body, callback))
  }
}

export const VM_WRAP_SERVICES_CHECK_REQUEST = 'VM_WRAP_SERVICES_CHECK_REQUEST'
export const VM_WRAP_SERVICES_CHECK_SUCCESS = 'VM_WRAP_SERVICES_CHECK_SUCCESS'
export const VM_WRAP_SERVICES_CHECK_FAILURE = 'VM_WRAP_SERVICES_CHECK_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchcheckServiceExists(serviceName,query, callback) {
  let endpoint = `${API_URL_PREFIX}/vm-wrap/services/${serviceName}/exists`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [VM_WRAP_SERVICES_CHECK_REQUEST, VM_WRAP_SERVICES_CHECK_SUCCESS, VM_WRAP_SERVICES_CHECK_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function checkServiceExists(serviceName,query, callback) {
  return (dispatch) => {
    return dispatch(fetchcheckServiceExists(serviceName,query, callback))
  }
}