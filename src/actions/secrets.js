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
import { toQuerystring } from '../common/tools'

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

function fetchGetSecrets(clusterID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/secrets`
  const newQuery = Object.assign({}, query)
  if (query) {
    delete query.headers
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    clusterID,
    [FETCH_API]: {
      types: [ GET_SECRETS_REQUEST, GET_SECRETS_SUCCESS, GET_SECRETS_FAILURE ],
      endpoint,
      schema: {},
      options: {
        headers: newQuery.headers
      }
    },
    callback
  }
}

export function getSecrets(clusterID, query, callback) {
  return (dispatch) => {
    return dispatch(fetchGetSecrets(clusterID, query, callback))
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

export const ADD_KEY_INTO_SECRET_REQUEST = 'ADD_KEY_INTO_SECRET_REQUEST'
export const ADD_KEY_INTO_SECRET_SUCCESS = 'ADD_KEY_INTO_SECRET_SUCCESS'
export const ADD_KEY_INTO_SECRET_FAILURE = 'ADD_KEY_INTO_SECRET_FAILURE'

function fetchAddKeyIntoSecret(clusterID, name, body, callback) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/secrets/${name}/entries`
  return {
    clusterID,
    [FETCH_API]: {
      types: [ ADD_KEY_INTO_SECRET_REQUEST, ADD_KEY_INTO_SECRET_SUCCESS, ADD_KEY_INTO_SECRET_FAILURE ],
      endpoint,
      options: {
        method: 'POST',
        body,
      },
      schema: {}
    },
    callback,
  }
}

export function addKeyIntoSecret(clusterID, name, body, callback) {
  return (dispatch) => {
    return dispatch(fetchAddKeyIntoSecret(clusterID, name, body, callback))
  }
}

export const UPDATE_KEY_INTO_SECRET_REQUEST = 'UPDATE_KEY_INTO_SECRET_REQUEST'
export const UPDATE_KEY_INTO_SECRET_SUCCESS = 'UPDATE_KEY_INTO_SECRET_SUCCESS'
export const UPDATE_KEY_INTO_SECRET_FAILURE = 'UPDATE_KEY_INTO_SECRET_FAILURE'

function fetchUpdateKeyIntoSecret(clusterID, name, body, callback) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/secrets/${name}/entries`
  return {
    clusterID,
    [FETCH_API]: {
      types: [ UPDATE_KEY_INTO_SECRET_REQUEST, UPDATE_KEY_INTO_SECRET_SUCCESS, UPDATE_KEY_INTO_SECRET_FAILURE ],
      endpoint,
      options: {
        method: 'PUT',
        body,
      },
      schema: {}
    },
    callback,
  }
}

export function updateKeyIntoSecret(clusterID, name, body, callback) {
  return (dispatch) => {
    return dispatch(fetchUpdateKeyIntoSecret(clusterID, name, body, callback))
  }
}

export const REMOVE_KEY_FROM_SECRET_REQUEST = 'REMOVE_KEY_FROM_SECRET_REQUEST'
export const REMOVE_KEY_FROM_SECRET_SUCCESS = 'REMOVE_KEY_FROM_SECRET_SUCCESS'
export const REMOVE_KEY_FROM_SECRET_FAILURE = 'REMOVE_KEY_FROM_SECRET_FAILURE'

function fetchRemoveKeyFromSecret(clusterID, name, key, callback) {
  const endpoint = `${API_URL_PREFIX}/clusters/${clusterID}/secrets/${name}/entries/${key}`
  return {
    clusterID,
    [FETCH_API]: {
      types: [ REMOVE_KEY_FROM_SECRET_REQUEST, REMOVE_KEY_FROM_SECRET_SUCCESS, REMOVE_KEY_FROM_SECRET_FAILURE ],
      endpoint,
      options: {
        method: 'DELETE',
      },
      schema: {}
    },
    callback,
  }
}

export function removeKeyFromSecret(clusterID, name, key, callback) {
  return (dispatch) => {
    return dispatch(fetchRemoveKeyFromSecret(clusterID, name, key, callback))
  }
}