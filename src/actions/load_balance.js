/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for load balance
 *
 * v0.1 - 2018-01-30
 * @author zhangxuan
 */

import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const LOAD_BALANCE_IP_LIST_REQUEST = 'LOAD_BALANCE_IP_LIST_REQUEST'
export const LOAD_BALANCE_IP_LIST_SUCCESS = 'LOAD_BALANCE_IP_LIST_SUCCESS'
export const LOAD_BALANCE_IP_LIST_FAILURE = 'LOAD_BALANCE_IP_LIST_FAILURE'

const fetchLBIPList = cluster => {
  return {
    [FETCH_API]: {
      types: [
        LOAD_BALANCE_IP_LIST_REQUEST,
        LOAD_BALANCE_IP_LIST_SUCCESS,
        LOAD_BALANCE_IP_LIST_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/ip`,
      schema: {},
    }
  }
}

export const getLBIPList = cluster => 
  dispatch => dispatch(fetchLBIPList(cluster))

export const CREATE_LOAD_BALANCES_REQUEST = 'CREATE_LOAD_BALANCES_REQUEST'
export const CREATE_LOAD_BALANCES_SUCCESS = 'CREATE_LOAD_BALANCES_SUCCESS'
export const CREATE_LOAD_BALANCES_FAILURE = 'CREATE_LOAD_BALANCES_FAILURE'

const fetchCreateLB = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_LOAD_BALANCES_REQUEST,
        CREATE_LOAD_BALANCES_SUCCESS,
        CREATE_LOAD_BALANCES_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export const createLB = (cluster, body, callback) =>
  dispatch => dispatch(fetchCreateLB(cluster, body, callback))


export const EDIT_LOAD_BALANCE_REQUEST = 'EDIT_LOAD_BALANCE_REQUEST'
export const EDIT_LOAD_BALANCE_SUCCESS = 'EDIT_LOAD_BALANCE_SUCCESS'
export const EDIT_LOAD_BALANCE_FAILURE = 'EDIT_LOAD_BALANCE_FAILURE'

const fetchEditLB = (cluster, name, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        EDIT_LOAD_BALANCE_REQUEST,
        EDIT_LOAD_BALANCE_SUCCESS,
        EDIT_LOAD_BALANCE_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/displayname/${body.displayName}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export const editLB = (cluster, name, body, callback) =>
  dispatch => dispatch(fetchEditLB(cluster, name, body, callback))

export const LOAD_BALANCE_LIST_REQUEST = 'LOAD_BALANCE_LIST_REQUEST'
export const LOAD_BALANCE_LIST_SUCCESS = 'LOAD_BALANCE_LIST_SUCCESS'
export const LOAD_BALANCE_LIST_FAILURE = 'LOAD_BALANCE_LIST_FAILURE'

const fetchLBList = (cluster, query, callback) => {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/loadbalances`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [
        LOAD_BALANCE_LIST_REQUEST,
        LOAD_BALANCE_LIST_SUCCESS,
        LOAD_BALANCE_LIST_FAILURE
      ],
      endpoint,
      schema: {},
    },
    callback
  }
}

export const getLBList = (cluster, query, callback) => 
  dispatch => dispatch(fetchLBList(cluster, query, callback))


export const GET_LOAD_BALANCE_DETAIL_REQUEST = 'GET_LOAD_BALANCE_DETAIL_REQUEST'
export const GET_LOAD_BALANCE_DETAIL_SUCCESS = 'GET_LOAD_BALANCE_DETAIL_SUCCESS'
export const GET_LOAD_BALANCE_DETAIL_FAILURE = 'GET_LOAD_BALANCE_DETAIL_FAILURE'

const fetchLBDetail = (cluster, name, displayName, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_LOAD_BALANCE_DETAIL_REQUEST,
        GET_LOAD_BALANCE_DETAIL_SUCCESS,
        GET_LOAD_BALANCE_DETAIL_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/displayname/${displayName}`,
      schema: {}
    },
    callback
  }
}

export const getLBDetail = (cluster, name, displayName, callback) =>
  dispatch => dispatch(fetchLBDetail(cluster, name, displayName, callback))

export const DELETE_LOAD_BALANCE_REQUEST = 'DELETE_LOAD_BALANCE_REQUEST'
export const DELETE_LOAD_BALANCE_SUCCESS = 'DELETE_LOAD_BALANCE_SUCCESS'
export const DELETE_LOAD_BALANCE_FAILURE = 'DELETE_LOAD_BALANCE_FAILURE'

const fetchDeleteLB = (cluster, name, displayName, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_LOAD_BALANCE_REQUEST,
        DELETE_LOAD_BALANCE_SUCCESS,
        DELETE_LOAD_BALANCE_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/displayname/${displayName}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}

export const deleteLB = (cluster, name, displayName, callback) => 
  dispatch => dispatch(fetchDeleteLB(cluster, name, displayName, callback))

export const CREATE_LOAD_BALANCE_INGRESS_REQUEST = 'CREATE_LOAD_BALANCE_INGRESS_REQUEST'
export const CREATE_LOAD_BALANCE_INGRESS_SUCCESS = 'CREATE_LOAD_BALANCE_INGRESS_SUCCESS'
export const CREATE_LOAD_BALANCE_INGRESS_FAILURE = 'CREATE_LOAD_BALANCE_INGRESS_FAILURE'

const fetchCreateIngress = (cluster, name, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_LOAD_BALANCE_INGRESS_REQUEST,
        CREATE_LOAD_BALANCE_INGRESS_SUCCESS,
        CREATE_LOAD_BALANCE_INGRESS_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/ingress`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export const createIngress = (cluster, name, body, callback) =>
  dispatch => dispatch(fetchCreateIngress(cluster, name, body, callback))

export const UPDATE_LOAD_BALANCE_INGRESS_REQUEST = 'UPDATE_LOAD_BALANCE_INGRESS_REQUEST'
export const UPDATE_LOAD_BALANCE_INGRESS_SUCCESS = 'UPDATE_LOAD_BALANCE_INGRESS_SUCCESS'
export const UPDATE_LOAD_BALANCE_INGRESS_FAILURE = 'UPDATE_LOAD_BALANCE_INGRESS_FAILURE'

const fetchUpdateIngress = (cluster, name, displayName, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_LOAD_BALANCE_INGRESS_REQUEST,
        UPDATE_LOAD_BALANCE_INGRESS_SUCCESS,
        UPDATE_LOAD_BALANCE_INGRESS_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${name}/ingress/${displayName}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export const updateIngress = (cluster, name, displayName, body, callback) =>
  dispatch => dispatch(fetchUpdateIngress(cluster, name, displayName, body, callback))

export const DELETE_LOAD_BALANCE_INGRESS_REQUESS = 'DELETE_LOAD_BALANCE_INGRESS_REQUESS'
export const DELETE_LOAD_BALANCE_INGRESS_SUCCESS = 'DELETE_LOAD_BALANCE_INGRESS_SUCCESS'
export const DELETE_LOAD_BALANCE_INGRESS_FAILURE = 'DELETE_LOAD_BALANCE_INGRESS_FAILURE'

const fetchDeleteIngress = (cluster, lbname, name, displayName, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_LOAD_BALANCE_INGRESS_REQUESS,
        DELETE_LOAD_BALANCE_INGRESS_SUCCESS,
        DELETE_LOAD_BALANCE_INGRESS_FAILURE
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/loadbalances/${lbname}/ingresses/${name}/displayname/${displayName}`,
      schema: {},
      options: {
        method: 'DELETE'
      }
    },
    callback
  }
}

export const deleteIngress = (cluster, lbname, name, displayName, callback) =>
  dispatch => dispatch(fetchDeleteIngress(cluster, lbname, name, displayName, callback))