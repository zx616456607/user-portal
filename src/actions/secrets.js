/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for secrets
 *
 * v0.1 - 2018-01-31
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const CREATE_SECRETS_REQUEST = 'CREATE_SECRETS_REQUEST'
export const CREATE_SECRETS_SUCCESS = 'CREATE_SECRETS_SUCCESS'
export const CREATE_SECRETS_FAILURE = 'CREATE_SECRETS_FAILURE'

function fetchCreateSecret(clusterID, name, callback) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/secrets/${name}`
  return {
    clusterID,
    [FETCH_API]: {
      types: [ CREATE_SECRETS_REQUEST, CREATE_SECRETS_SUCCESS, CREATE_SECRETS_FAILURE ],
      endpoint,
      options: {
        method: 'POST',
      },
      schema: {}
    },
    callback,
  }
}

export function createSecret(clusterID, name, callback) {
  return (dispatch) => {
    return dispatch(fetchCreateSecret(clusterID, name, callback))
  }
}

export const GET_SECRETS_REQUEST = 'GET_SECRETS_REQUEST'
export const GET_SECRETS_SUCCESS = 'GET_SECRETS_SUCCESS'
export const GET_SECRETS_FAILURE = 'GET_SECRETS_FAILURE'

function fetchGetSecrets(clusterID, query) {
  let endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/secrets`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    clusterID,
    [FETCH_API]: {
      types: [ GET_SECRETS_REQUEST, GET_SECRETS_SUCCESS, GET_SECRETS_FAILURE ],
      endpoint,
      schema: {}
    }
  }
}

export function getSecrets(clusterID, query) {
  return (dispatch) => {
    return dispatch(fetchGetSecrets(clusterID, query))
  }
}

export const REMOVE_SECRETS_REQUEST = 'REMOVE_SECRETS_REQUEST'
export const REMOVE_SECRETS_SUCCESS = 'REMOVE_SECRETS_SUCCESS'
export const REMOVE_SECRETS_FAILURE = 'REMOVE_SECRETS_FAILURE'

function fetchRemoveSecrets(clusterID, names, callback) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/secrets/${names}`
  return {
    clusterID,
    [FETCH_API]: {
      types: [ REMOVE_SECRETS_REQUEST, REMOVE_SECRETS_SUCCESS, REMOVE_SECRETS_FAILURE ],
      endpoint,
      options: {
        method: 'DELETE',
      },
      schema: {}
    },
    callback,
  }
}

export function removeSecrets(clusterID, names, callback) {
  return (dispatch) => {
    return dispatch(fetchRemoveSecrets(clusterID, names, callback))
  }
}
