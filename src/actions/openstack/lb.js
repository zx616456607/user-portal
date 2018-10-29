/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for lb
 *
 * v0.1 - 2017-07-27
 * @author YangYuBiao
 */

import { FETCH_API, Schemas } from '../../middleware/api'
import { API_URL_PREFIX } from '../../constants'
import { toQuerystring } from '../../common/tools'

export const OPENSTACK_LB_LIST_REQUEST = 'OPENSTACK_LB_LIST_REQUEST'
export const OPENSTACK_LB_LIST_SUCCESS = 'OPENSTACK_LB_LIST_SUCCESS'
export const OPENSTACK_LB_LIST_FAILURE = 'OPENSTACK_LB_LIST_FAILURE'

function fetchopenstackLBList(query, callback) {
    let endpoint=`${API_URL_PREFIX}/openstack/lb`
    if (query) {
        endpoint += `?${toQuerystring(query)}`
    }
    return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_LIST_REQUEST, OPENSTACK_LB_LIST_SUCCESS, OPENSTACK_LB_LIST_FAILURE],
      endpoint,
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}

export function loadopenstackLBList(query, callback) {
  return (dispath, getState) => {
    dispath(fetchopenstackLBList(query, callback))
  }
}


export const OPENSTACK_LB_CREATE_REQUEST = 'OPENSTACK_LB_CREATE_REQUEST'
export const OPENSTACK_LB_CREATE_SUCCESS = 'OPENSTACK_LB_CREATE_SUCCESS'
export const OPENSTACK_LB_CREATE_FAILURE = 'OPENSTACK_LB_CREATE_FAILURE'

function fetchCreateopenstackLB(body, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_CREATE_REQUEST, OPENSTACK_LB_CREATE_SUCCESS, OPENSTACK_LB_CREATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/actions/insert`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}//Schemas.STORAGE
    },
    callback: callback
  }
}

export function createopenstackLB(body, callback) {
  return (dispath, getState) => {
    dispath(fetchCreateopenstackLB(body, callback))
  }
}



export const OPENSTACK_LB_DELETE_REQUEST = 'OPENSTACK_LB_DELETE_REQUEST'
export const OPENSTACK_LB_DELETE_SUCCESS = 'OPENSTACK_LB_DELETE_SUCCESS'
export const OPENSTACK_LB_DELETE_FAILURE = 'OPENSTACK_LB_DELETE_FAILURE'

function fetchDeleteopenstackLB(name, callback) {
  return {
    [FETCH_API]: {
      types: [OPENSTACK_LB_DELETE_REQUEST, OPENSTACK_LB_DELETE_SUCCESS, OPENSTACK_LB_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/openstack/lb/${name}`,
      options: {
        method: 'DELETE'
      },
      schema: {}//Schemas.STORAGE
    },
    callback
  }
}

export function deleteopenstackLB(name, callback) {
  return (dispath) => {
    return dispath(fetchDeleteopenstackLB(name, callback))
  }
}

export const GET_OPENSTACK_CLUSTER_REQUEST = 'GET_OPENSTACK_CLUSTER_REQUEST'
export const GET_OPENSTACK_CLUSTER_SUCCESS = 'GET_OPENSTACK_CLUSTER_SUCCESS'
export const GET_OPENSTACK_CLUSTER_FAILURE = 'GET_OPENSTACK_CLUSTER_FAILURE'

function fetchClusterList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/bay`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_OPENSTACK_CLUSTER_REQUEST, GET_OPENSTACK_CLUSTER_SUCCESS, GET_OPENSTACK_CLUSTER_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getClusterList(query, callback) {
  return (dispath) => {
    return dispath(fetchClusterList(query, callback))
  }
}

export const GET_OPENSTACK_CLUSTER_BYMODEL_REQUEST = 'GET_OPENSTACK_CLUSTER_BYMODEL_REQUEST'
export const GET_OPENSTACK_CLUSTER_BYMODEL_SUCCESS = 'GET_OPENSTACK_CLUSTER_BYMODEL_SUCCESS'
export const GET_OPENSTACK_CLUSTER_BYMODEL_FAILURE = 'GET_OPENSTACK_CLUSTER_BYMODEL_FAILURE'

function fetchClusterTemplate(query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/baymodels`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_OPENSTACK_CLUSTER_BYMODEL_REQUEST, GET_OPENSTACK_CLUSTER_BYMODEL_SUCCESS, GET_OPENSTACK_CLUSTER_BYMODEL_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getClusterBaymodel(query, callback) {
  return (dispath) => {
    return dispath(fetchClusterTemplate(query, callback))
  }
}

export const CREATE_OPENSTACK_CLUSTER_REQUEST = 'CREATE_OPENSTACK_CLUSTER_REQUEST'
export const CREATE_OPENSTACK_CLUSTER_SUCCESS = 'CREATE_OPENSTACK_CLUSTER_SUCCESS'
export const CREATE_OPENSTACK_CLUSTER_FAILURE = 'CREATE_OPENSTACK_CLUSTER_FAILURE'

function fetchCreateCluster(body,query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/bay`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [DELETE_OPENSTACK_CLUSTER_REQUEST, DELETE_OPENSTACK_CLUSTER_SUCCESS, DELETE_OPENSTACK_CLUSTER_FAILURE],
      endpoint,
      options:{
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function createCluster(body,query, callback) {
  return (dispath) => {
    return dispath(fetchCreateCluster(body,query, callback))
  }
}

//openstack/bay/:uuid/baymodels/:model
export const DELETE_OPENSTACK_CLUSTER_REQUEST = 'DELETE_OPENSTACK_CLUSTER_REQUEST'
export const DELETE_OPENSTACK_CLUSTER_SUCCESS = 'DELETE_OPENSTACK_CLUSTER_SUCCESS'
export const DELETE_OPENSTACK_CLUSTER_FAILURE = 'DELETE_OPENSTACK_CLUSTER_FAILURE'

function fetchDeleteCluster(body,query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/bay/${body.uuid}/baymodels/${body.model}`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CREATE_OPENSTACK_CLUSTER_REQUEST, CREATE_OPENSTACK_CLUSTER_SUCCESS, CREATE_OPENSTACK_CLUSTER_FAILURE],
      endpoint,
      options:{
        method: 'DELETE',
      },
      schema: {}
    },
    callback
  }
}

export function deleteCluster(body,query, callback) {
  return (dispath) => {
    return dispath(fetchDeleteCluster(body,query,callback))
  }
}

export const GET_OPENSTACK_KEYPAIR_REQUEST = 'GET_OPENSTACK_KEYPAIR_REQUEST'
export const GET_OPENSTACK_KEYPAIR_SUCCESS = 'GET_OPENSTACK_KEYPAIR_SUCCESS'
export const GET_OPENSTACK_KEYPAIR_FAILURE = 'GET_OPENSTACK_KEYPAIR_FAILURE'

function fetchKeypairList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/openstack/keypairs`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_OPENSTACK_KEYPAIR_REQUEST, GET_OPENSTACK_KEYPAIR_SUCCESS, GET_OPENSTACK_KEYPAIR_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

export function getKeypairList(query, callback) {
  return (dispath) => {
    return dispath(fetchKeypairList(query, callback))
  }
}

export const CREATE_OPENSTACK_KEYPAIR_REQUEST = 'CREATE_OPENSTACK_KEYPAIR_REQUEST'
export const CREATE_OPENSTACK_KEYPAIR_SUCCESS = 'CREATE_OPENSTACK_KEYPAIR_SUCCESS'
export const CREATE_OPENSTACK_KEYPAIR_FAILURE = 'CREATE_OPENSTACK_KEYPAIR_FAILURE'

function fetchCreateKeypair(body,query, callback) {
  let endpoint =  `${API_URL_PREFIX}/openstack/keypairs`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CREATE_OPENSTACK_KEYPAIR_REQUEST, CREATE_OPENSTACK_KEYPAIR_SUCCESS, CREATE_OPENSTACK_KEYPAIR_FAILURE],
      endpoint,
      options:{
        method:'POST',
        body
      },
      schema: {}
    },
    callback
  }
}
export function CreateKeypair(body,query, callback) {
  return (dispath) => {
    return dispath(fetchCreateKeypair(body,query, callback))
  }
}

export const DELETE_OPENSTACK_KEYPAIR_REQUEST = 'DELETE_OPENSTACK_KEYPAIR_REQUEST'
export const DELETE_OPENSTACK_KEYPAIR_SUCCESS = 'DELETE_OPENSTACK_KEYPAIR_SUCCESS'
export const DELETE_OPENSTACK_KEYPAIR_FAILURE = 'DELETE_OPENSTACK_KEYPAIR_FAILURE'

function fetchDeleteKeypair(name,query, callback) {
  let endpoint =  `${API_URL_PREFIX}/openstack/keypairs/${name}`
  if(query) {
    endpoint = `${endpoint}?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [DELETE_OPENSTACK_KEYPAIR_REQUEST, DELETE_OPENSTACK_KEYPAIR_SUCCESS, DELETE_OPENSTACK_KEYPAIR_FAILURE],
      endpoint,
      options:{
        method:'DELETE'
      },
      schema: {}
    },
    callback
  }
}
export function deleteKeypair(keyname,query, callback) {
  return (dispath) => {
    return dispath(fetchDeleteKeypair(keyname,query,callback))
  }
}

export const OPENSTACK_CLEAR_KEYPAIR_LIST = 'OPENSTACK_CLEAR_KEYPAIR_LIST'
export function clearKeyPair() {
  return {
    type: OPENSTACK_CLEAR_KEYPAIR_LIST
  }
}

export const OPENSTACK_CLEAR_CLUSTER_LIST = 'OPENSTACK_CLEAR_CLUSTER_LIST'
export function clearCluster() {
  return {
    type: OPENSTACK_CLEAR_CLUSTER_LIST
  }
}


export const SCALE_BAY_REQUEST = 'SCALE_BAY_REQUEST'
export const SCALE_BAY_SUCCESS = 'SCALE_BAY_SUCCESS'
export const SCALE_BAY_FAILURE = 'SCALE_BAY_FAILURE'

function fetchScaleBay(uuid, body, callback) {
  let endpoint =  `${API_URL_PREFIX}/openstack/bay/${uuid}`
  return {
    [FETCH_API]: {
      types: [SCALE_BAY_REQUEST, SCALE_BAY_SUCCESS, SCALE_BAY_FAILURE],
      endpoint,
      options:{
        method:'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}
export function scaleBay(uuid, body, callback) {
  return (dispath) => {
    return dispath(fetchScaleBay(uuid, body, callback))
  }
}