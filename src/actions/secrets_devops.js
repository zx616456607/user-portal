/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for secrets by devops
 *
 * v0.1 - 2018-09-10
 * @author rensiwei
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'


export const GET_SECRETS_REQUEST = 'GET_SECRETS_REQUEST'
export const GET_SECRETS_SUCCESS = 'GET_SECRETS_SUCCESS'
export const GET_SECRETS_FAILURE = 'GET_SECRETS_FAILURE'

export function fetchSecrets(query, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        GET_SECRETS_REQUEST,
        GET_SECRETS_SUCCESS,
        GET_SECRETS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/secrets/clusters/${query.cluster_id}`,
      schema: {},
    },
    callback,
  }
}

export function getSecrets(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSecrets(query, callback))
  }
}

export const CREATE_SECRETS_REQUEST = 'CREATE_SECRETS_REQUEST'
export const CREATE_SECRETS_SUCCESS = 'CREATE_SECRETS_SUCCESS'
export const CREATE_SECRETS_FAILURE = 'CREATE_SECRETS_FAILURE'

export function fetchCreateSecrets(cluster_id, body, callback) {
  return {
    cluster: cluster_id,
    [FETCH_API]: {
      types: [
        CREATE_SECRETS_REQUEST,
        CREATE_SECRETS_SUCCESS,
        CREATE_SECRETS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/secrets/clusters/${cluster_id}`,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback,
  }
}

export function createSecrets(cluster_id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateSecrets(cluster_id, body, callback))
  }
}

export const DELETE_SECRETS_REQUEST = 'DELETE_SECRETS_REQUEST'
export const DELETE_SECRETS_SUCCESS = 'DELETE_SECRETS_SUCCESS'
export const DELETE_SECRETS_FAILURE = 'DELETE_SECRETS_FAILURE'

export function fetchDelSecret(cluster_id, body, callback) {
  return {
    [FETCH_API]: {
      types: [
        DELETE_SECRETS_REQUEST,
        DELETE_SECRETS_SUCCESS,
        DELETE_SECRETS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/secrets/clusters/${cluster_id}`,
      schema: {},
      options: {
        method: 'DELETE',
        body,
      },
    },
    callback,
  }
}

export function deleteSecret(cluster_id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDelSecret(cluster_id, body, callback))
  }
}


export const CREATE_SECRETS_CONFIG_REQUEST = 'CREATE_SECRETS_CONFIG_REQUEST'
export const CREATE_SECRETS_CONFIG_SUCCESS = 'CREATE_SECRETS_CONFIG_SUCCESS'
export const CREATE_SECRETS_CONFIG_FAILURE = 'CREATE_SECRETS_CONFIG_FAILURE'

export function fetchCreateSecretsConfig(secret_name, cluster_id, body, callback) {
  return {
    [FETCH_API]: {
      types: [
        CREATE_SECRETS_CONFIG_REQUEST,
        CREATE_SECRETS_CONFIG_SUCCESS,
        CREATE_SECRETS_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/secrets/${secret_name}/clusters/${cluster_id}/configs`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback,
  }
}

export function createSecretsConfig(secret_name, cluster_id, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateSecretsConfig(secret_name, cluster_id, body, callback))
  }
}

export const GET_SECRETS_CONFIG_REQUEST = 'GET_SECRETS_CONFIG_REQUEST'
export const GET_SECRETS_CONFIG_SUCCESS = 'GET_SECRETS_CONFIG_SUCCESS'
export const GET_SECRETS_CONFIG_FAILURE = 'GET_SECRETS_CONFIG_FAILURE'

export function fetchSecretsConfig(query, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        GET_SECRETS_CONFIG_REQUEST,
        GET_SECRETS_CONFIG_SUCCESS,
        GET_SECRETS_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/secrets/${query.secret_name}/clusters/${query.cluster_id}/configs/${query.config_name}`,
      schema: {},
    },
    callback,
  }
}

export function getSecretsConfig(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSecretsConfig(query, callback))
  }
}

export const DELETE_SECRETS_CONFIG_REQUEST = 'DELETE_SECRETS_CONFIG_REQUEST'
export const DELETE_SECRETS_CONFIG_SUCCESS = 'DELETE_SECRETS_CONFIG_SUCCESS'
export const DELETE_SECRETS_CONFIG_FAILURE = 'DELETE_SECRETS_CONFIG_FAILURE'

export function fetchDelSecretsConfig(query, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        DELETE_SECRETS_CONFIG_REQUEST,
        DELETE_SECRETS_CONFIG_SUCCESS,
        DELETE_SECRETS_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/secrets/${query.secret_name}/clusters/${query.cluster_id}/configs/${query.config_name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  }
}

export function deleteSecretsConfig(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDelSecretsConfig(query, callback))
  }
}

export const UPDATE_SECRETS_CONFIG_REQUEST = 'UPDATE_SECRETS_CONFIG_REQUEST'
export const UPDATE_SECRETS_CONFIG_SUCCESS = 'UPDATE_SECRETS_CONFIG_SUCCESS'
export const UPDATE_SECRETS_CONFIG_FAILURE = 'UPDATE_SECRETS_CONFIG_FAILURE'

export function fetchUpdateSecretsConfig(query, body, callback) {
  return {
    cluster: query.cluster_id,
    [FETCH_API]: {
      types: [
        UPDATE_SECRETS_CONFIG_REQUEST,
        UPDATE_SECRETS_CONFIG_SUCCESS,
        UPDATE_SECRETS_CONFIG_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/configmaps/${query.configmap_name}/clusters/${query.cluster_id}/configs/${query.config_name}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  }
}

export function updateSecretsConfig(query, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateSecretsConfig(query, body, callback))
  }
}


