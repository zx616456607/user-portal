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
import { toQuerystring } from '../common/tools'

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

export const GET_INTEGRATION_DETAIL_CONFIG_REQUEST = 'GET_INTEGRATION_DETAIL_CONFIG_REQUEST'
export const GET_INTEGRATION_DETAIL_CONFIG_SUCCESS = 'GET_INTEGRATION_DETAIL_CONFIG_SUCCESS'
export const GET_INTEGRATION_DETAIL_CONFIG_FAILURE = 'GET_INTEGRATION_DETAIL_CONFIG_FAILURE'

function fetchIntegrationConfig(id, callback) {
  return {
    [FETCH_API]: {
      types: [GET_INTEGRATION_DETAIL_CONFIG_REQUEST, GET_INTEGRATION_DETAIL_CONFIG_SUCCESS, GET_INTEGRATION_DETAIL_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/integrations/getIntegrationConfig/${id}`,
      schema: {}
    },
    callback
  }
}

export function getIntegrationConfig(id, callback) {
  return (dispatch) => {
    return dispatch(fetchIntegrationConfig(id, callback))
  }
}

export const UPDATE_INTEGRATION_DETAIL_CONFIG_REQUEST = 'UPDATE_INTEGRATION_DETAIL_CONFIG_REQUEST'
export const UPDATE_INTEGRATION_DETAIL_CONFIG_SUCCESS = 'UPDATE_INTEGRATION_DETAIL_CONFIG_SUCCESS'
export const UPDATE_INTEGRATION_DETAIL_CONFIG_FAILURE = 'UPDATE_INTEGRATION_DETAIL_CONFIG_FAILURE'

function postUpdateIntegrationConfig(id, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_INTEGRATION_DETAIL_CONFIG_REQUEST, UPDATE_INTEGRATION_DETAIL_CONFIG_SUCCESS, UPDATE_INTEGRATION_DETAIL_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/integrations/updateIntegrationConfig/${id}`,
      options: {
        method: 'PUT',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function updateIntegrationConfig(id, body, callback) {
  return (dispatch) => {
    return dispatch(postUpdateIntegrationConfig(id, body, callback))
  }
}

export const POST_CREATE_INTEGRATION_REQUEST = 'POST_CREATE_INTEGRATION_REQUEST'
export const POST_CREATE_INTEGRATION_SUCCESS = 'POST_CREATE_INTEGRATION_SUCCESS'
export const POST_CREATE_INTEGRATION_FAILURE = 'POST_CREATE_INTEGRATION_FAILURE'

function postCreateIntegration(body, callback) {
  return {
    [FETCH_API]: {
      types: [POST_CREATE_INTEGRATION_REQUEST, POST_CREATE_INTEGRATION_SUCCESS, POST_CREATE_INTEGRATION_FAILURE],
      endpoint: `${API_URL_PREFIX}/integrations/createIntegration`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function createIntegration(body, callback) {
  return (dispatch) => {
    return dispatch(postCreateIntegration(body, callback))
  }
}

export const DELETE_INTEGRATION_DETAIL_REQUEST = 'DELETE_INTEGRATION_DETAIL_REQUEST'
export const DELETE_INTEGRATION_DETAIL_SUCCESS = 'DELETE_INTEGRATION_DETAIL_SUCCESS'
export const DELETE_INTEGRATION_DETAIL_FAILURE = 'DELETE_INTEGRATION_DETAIL_FAILURE'

function deleteIntegrationDetail(id, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_INTEGRATION_DETAIL_REQUEST, DELETE_INTEGRATION_DETAIL_SUCCESS, DELETE_INTEGRATION_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/integrations/deleteIntegrations/${id}`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteIntegration(id, callback) {
  return (dispatch) => {
    return dispatch(deleteIntegrationDetail(id, callback))
  }
}

export const GET_INTEGRATION_DATA_CENTER_REQUEST = 'GET_INTEGRATION_DATA_CENTER_REQUEST'
export const GET_INTEGRATION_DATA_CENTER_SUCCESS = 'GET_INTEGRATION_DATA_CENTER_SUCCESS'
export const GET_INTEGRATION_DATA_CENTER_FAILURE = 'GET_INTEGRATION_DATA_CENTER_FAILURE'

function fetchIntegrationDateCenter(id, callback) {
  return {
    [FETCH_API]: {
      types: [GET_INTEGRATION_DATA_CENTER_REQUEST, GET_INTEGRATION_DATA_CENTER_SUCCESS, GET_INTEGRATION_DATA_CENTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/integrations/getIntegrationDateCenter/${id}`,
      schema: {}
    },
    callback
  }
}

export function getIntegrationDateCenter(id, callback) {
  return (dispatch) => {
    return dispatch(fetchIntegrationDateCenter(id, callback))
  }
}

export const GET_INTEGRATION_VM_LIST_REQUEST = 'GET_INTEGRATION_VM_LIST_REQUEST'
export const GET_INTEGRATION_VM_LIST_SUCCESS = 'GET_INTEGRATION_VM_LIST_SUCCESS'
export const GET_INTEGRATION_VM_LIST_FAILURE = 'GET_INTEGRATION_VM_LIST_FAILURE'

function fetchIntegrationVmList(id, dcPath, callback) {
  let endpoint = `${API_URL_PREFIX}/integrations/getIntegrationVmList/${id}`
  if (dcPath) {
    endpoint += `?${toQuerystring({dcPath})}`
  }
  return {
    [FETCH_API]: {
      types: [GET_INTEGRATION_VM_LIST_REQUEST, GET_INTEGRATION_VM_LIST_SUCCESS, GET_INTEGRATION_VM_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getIntegrationVmList(id, dcPath, callback) {
  return (dispatch) => {
    return dispatch(fetchIntegrationVmList(id, dcPath, callback))
  }
}

export const POST_MANAGE_VM_DETAIL_REQUEST = 'POST_MANAGE_VM_DETAIL_REQUEST'
export const POST_MANAGE_VM_DETAIL_SUCCESS = 'POST_MANAGE_VM_DETAIL_SUCCESS'
export const POST_MANAGE_VM_DETAIL_FAILURE = 'POST_MANAGE_VM_DETAIL_FAILURE'

function postManageVmDetail(id, dcPath, body, callback) {
  let endpoint = `${API_URL_PREFIX}/integrations/manageIntegrationsVmDetail/${id}`
  if (dcPath) {
    endpoint += `?${toQuerystring({dcPath})}`
  }
  return {
    [FETCH_API]: {
      types: [POST_MANAGE_VM_DETAIL_REQUEST, POST_MANAGE_VM_DETAIL_SUCCESS, POST_MANAGE_VM_DETAIL_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function manageVmDetail(id, dcPath, body, callback) {
  return (dispatch) => {
    return dispatch(postManageVmDetail(id, dcPath, body, callback))
  }
}

export const GET_CLONE_VM_CONFIG_REQUEST = 'GET_CLONE_VM_CONFIG_REQUEST'
export const GET_CLONE_VM_CONFIG_SUCCESS = 'GET_CLONE_VM_CONFIG_SUCCESS'
export const GET_CLONE_VM_CONFIG_FAILURE = 'GET_CLONE_VM_CONFIG_FAILURE'

function fetchCloneVmConfig(id, dcPath, callback) {
  let endpoint = `${API_URL_PREFIX}/integrations/getCreateVmConfig/${id}`
  if (dcPath) {
    endpoint += `?${toQuerystring({dcPath})}`
  }
  return {
    [FETCH_API]: {
      types: [GET_CLONE_VM_CONFIG_REQUEST, GET_CLONE_VM_CONFIG_SUCCESS, GET_CLONE_VM_CONFIG_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getCloneVmConfig(id, dcPath, callback) {
  return (dispatch) => {
    return dispatch(fetchCloneVmConfig(id, dcPath, callback))
  }
}

export const POST_CREATE_INTEGRATION_VM_REQUEST = 'POST_CREATE_INTEGRATION_VM_REQUEST'
export const POST_CREATE_INTEGRATION_VM_SUCCESS = 'POST_CREATE_INTEGRATION_VM_SUCCESS'
export const POST_CREATE_INTEGRATION_VM_FAILURE = 'POST_CREATE_INTEGRATION_VM_FAILURE'

function postCreateIntegrationVm(id, dcPath, body, callback) {
  let endpoint = `${API_URL_PREFIX}/integrations/createIntegrationVm/${id}`
  if (dcPath) {
    endpoint += `?${toQuerystring({dcPath})}`
  }
  return {
    [FETCH_API]: {
      types: [POST_CREATE_INTEGRATION_VM_REQUEST, POST_CREATE_INTEGRATION_VM_SUCCESS, POST_CREATE_INTEGRATION_VM_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function createIntegrationVm(id, dcPath, body, callback) {
  return (dispatch) => {
    return dispatch(postCreateIntegrationVm(id, dcPath, body, callback))
  }
}

export const GET_INTEGRATION_POD_DETAIL_REQUEST = 'GET_INTEGRATION_POD_DETAIL_REQUEST'
export const GET_INTEGRATION_POD_DETAIL_SUCCESS = 'GET_INTEGRATION_POD_DETAIL_SUCCESS'
export const GET_INTEGRATION_POD_DETAIL_FAILURE = 'GET_INTEGRATION_POD_DETAIL_FAILURE'

function fetchIntegrationPodDetail(id, dcPath, callback) {
  let endpoint = `${API_URL_PREFIX}/integrations/getIntegrationPods/${id}`
  if (dcPath) {
    endpoint += `?${toQuerystring({dcPath})}`
  }
  return {
    [FETCH_API]: {
      types: [GET_INTEGRATION_POD_DETAIL_REQUEST, GET_INTEGRATION_POD_DETAIL_SUCCESS, GET_INTEGRATION_POD_DETAIL_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getIntegrationPodDetail(id, dcPath, callback) {
  return (dispatch) => {
    return dispatch(fetchIntegrationPodDetail(id, dcPath, callback))
  }
}

export const CREATE_CEPH_REQUEST = 'CREATE_CEPH_REQUEST'
export const CREATE_CEPH_SUCCESS = 'CREATE_CEPH_SUCCESS'
export const CREATE_CEPH_FAILURE = 'CREATE_CEPH_FAILURE'

const fetchCreateCeph = (body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_CEPH_REQUEST,
        CREATE_CEPH_SUCCESS,
        CREATE_CEPH_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/integrations/ceph`,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback,
  }
}

export const createCeph = (body, callback) =>
  dispatch => dispatch(fetchCreateCeph(body, callback))

export const UPDATE_CEPH_REQUEST = 'UPDATE_CEPH_REQUEST'
export const UPDATE_CEPH_SUCCESS = 'UPDATE_CEPH_SUCCESS'
export const UPDATE_CEPH_FAILURE = 'UPDATE_CEPH_FAILURE'

const fetchUpdateCeph = (id, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_CEPH_REQUEST,
        UPDATE_CEPH_SUCCESS,
        UPDATE_CEPH_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/integrations/ceph/${id}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      }
    },
    callback,
  }
}

export const updateCeph = (id, body, callback) =>
  dispatch => dispatch(fetchUpdateCeph(id, body, callback))

export const FETCH_CEPH_DETAIL_REQUEST = 'FETCH_CEPH_DETAIL_REQUEST'
export const FETCH_CEPH_DETAIL_SUCCESS = 'FETCH_CEPH_DETAIL_SUCCESS'
export const FETCH_CEPH_DETAIL_FAILURE = 'FETCH_CEPH_DETAIL_FAILURE'

const fetchCephDetail = (id, callback) => {
  return {
    [FETCH_API]: {
      types: [
        FETCH_CEPH_DETAIL_REQUEST,
        FETCH_CEPH_DETAIL_SUCCESS,
        FETCH_CEPH_DETAIL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/integrations/ceph/${id}`,
      schema: {},
    },
    callback,
  }
}

export const getCephDetail = (id, callback) =>
  dispatch => dispatch(fetchCephDetail(id, callback))