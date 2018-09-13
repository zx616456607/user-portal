/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for middleware center
 *
 * @author zhangxuan
 * @date 2018-09-10
 */

import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools';

export const SET_BPM_FORM_FIELDS = 'SET_BPM_FORM_FIELDS'

export const setBpmFormFields = (fields, callback) => {
  return {
    type: SET_BPM_FORM_FIELDS,
    fields,
    callback,
  }
}

export const CLEAR_BPM_FORM_FIELDS = 'CLEAR_BPM_FORM_FIELDS'

export const clearBpmFormFields = (fields, callback) => {
  return {
    type: CLEAR_BPM_FORM_FIELDS,
    callback,
  }
}

export const SET_CURRENT_APP = 'SET_CURRENT_APP'

export const setCurrentApp = app => ({
  type: SET_CURRENT_APP,
  app,
})

export const GET_MIDDLEWARE_APP_CLASSIFIES_REQUEST = 'GET_MIDDLEWARE_APP_CLASSIFIES_REQUEST'
export const GET_MIDDLEWARE_APP_CLASSIFIES_SUCCESS = 'GET_MIDDLEWARE_APP_CLASSIFIES_SUCCESS'
export const GET_MIDDLEWARE_APP_CLASSIFIES_FAILURE = 'GET_MIDDLEWARE_APP_CLASSIFIES_FAILURE'

const fetchAppClassifies = () => ({
  [FETCH_API]: {
    types: [
      GET_MIDDLEWARE_APP_CLASSIFIES_REQUEST,
      GET_MIDDLEWARE_APP_CLASSIFIES_SUCCESS,
      GET_MIDDLEWARE_APP_CLASSIFIES_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/appcenters/groups`,
    schema: {},
  },
})

export const getAppClassifies = () =>
  dispatch => dispatch(fetchAppClassifies())

export const GET_MIDDLEWARE_APPS_REQUEST = 'GET_MIDDLEWARE_APPS_REQUEST'
export const GET_MIDDLEWARE_APPS_SUCCESS = 'GET_MIDDLEWARE_APPS_SUCCESS'
export const GET_MIDDLEWARE_APPS_FAILURE = 'GET_MIDDLEWARE_APPS_FAILURE'

const fetchMiddlewareApps = query => ({
  [FETCH_API]: {
    types: [
      GET_MIDDLEWARE_APPS_REQUEST,
      GET_MIDDLEWARE_APPS_SUCCESS,
      GET_MIDDLEWARE_APPS_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/appcenters?${toQuerystring(query)}`,
    schema: {},
  },
})

export const getMiddlewareApps = query =>
  dispatch => dispatch(fetchMiddlewareApps(query))

export const CREATE_MIDDLEWARE_APP_REQUEST = 'CREATE_MIDDLEWARE_APP_REQUEST'
export const CREATE_MIDDLEWARE_APP_SUCCESS = 'CREATE_MIDDLEWARE_APP_SUCCESS'
export const CREATE_MIDDLEWARE_APP_FAILURE = 'CREATE_MIDDLEWARE_APP_FAILURE'

const fetchCreateMiddlewareApp = (cluster, body) => ({
  [FETCH_API]: {
    types: [
      CREATE_MIDDLEWARE_APP_REQUEST,
      CREATE_MIDDLEWARE_APP_SUCCESS,
      CREATE_MIDDLEWARE_APP_FAILURE,
    ],
    schema: {},
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters`,
    options: {
      headers: {
        'Content-Type': 'text/plain',
      },
      method: 'POST',
      body,
    },
  },
})

export const createMiddlewareApp = (cluster, body) =>
  dispatch => dispatch(fetchCreateMiddlewareApp(cluster, body))

export const CHECK_APP_CLUSTER_NAME_REQUEST = 'CHECK_APP_CLUSTER_NAME_REQUEST'
export const CHECK_APP_CLUSTER_NAME_SUCCESS = 'CHECK_APP_CLUSTER_NAME_SUCCESS'
export const CHECK_APP_CLUSTER_NAME_FAILURE = 'CHECK_APP_CLUSTER_NAME_FAILURE'

const fetchCheckAppClusterName = (cluster, name, callback) => ({
  [FETCH_API]: {
    types: [
      CHECK_APP_CLUSTER_NAME_REQUEST,
      CHECK_APP_CLUSTER_NAME_SUCCESS,
      CHECK_APP_CLUSTER_NAME_FAILURE,
    ],
    endpoint: `${API_URL_PREFIX}/clusters/${cluster}/appcenters/${name}/exist`,
    schema: {},
  },
  callback,
})

export const checkAppClusterName = (cluster, name, callback) =>
  dispatch => dispatch(fetchCheckAppClusterName(cluster, name, callback))
