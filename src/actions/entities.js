/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Entities actions
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { getCookie, setCookie } from '../common/tools'
import { USER_CURRENT_CONFIG } from '../../constants'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import { PROJECTS_LIST_SUCCESS, PROJECT_VISIBLE_CLUSTERS_GET_SUCCESS } from './project'

export const SET_CURRENT = 'SET_CURRENT'
// Resets the currently visible error message.
function _setCurrent(current, callback, _current) {
  current = Object.assign({}, cloneDeep(_current), current)
  const config = getCookie(USER_CURRENT_CONFIG) || ''
  let [ username, namespace, clusterID ] = config.split(',')
  if (current.space) {
    namespace = current.space.namespace
  }
  if (current.cluster) {
    clusterID = current.cluster.clusterID || ''
  }
  if (namespace) {
    const currentConfig = `${username},${namespace},${clusterID}`
    setCookie(USER_CURRENT_CONFIG, currentConfig)
  }
  return {
    current,
    type: SET_CURRENT,
    callback
  }
}

export function setCurrent(current, callback) {
  return (dispatch, getState) => {
    const _current = getState().entities.current
    return dispatch(_setCurrent(current, callback, _current))
  }
}

export function setListProjects(projects, callback) {
  return {
    response: {
      result: {
        data: {
          projects,
        }
      }
    },
    type: PROJECTS_LIST_SUCCESS,
    callback
  }
}

export function setProjectVisibleClusters(projectName, clusters, callback) {
  return {
    projectName,
    response: {
      result: {
        data: {
          clusters,
          listMeta: {},
        }
      }
    },
    type: PROJECT_VISIBLE_CLUSTERS_GET_SUCCESS,
    callback
  }
}

export const CHANGE_CLUSTER_BING_IPS_DOMAINS = 'CHANGE_CLUSTER_BING_IPS_DOMAINS'

export function changeClusterIPsAndDomains(ips, domains) {
  return {
    type: CHANGE_CLUSTER_BING_IPS_DOMAINS,
    ips,
    domains
  }
}

export const VERIFY_CAPTCHA_REQUEST = 'VERIFY_CAPTCHA_REQUEST'
export const VERIFY_CAPTCHA_SUCCESS = 'VERIFY_CAPTCHA_SUCCESS'
export const VERIFY_CAPTCHA_FAILURE = 'VERIFY_CAPTCHA_FAILURE'

function fetchVerifyCaptcha(captcha, callback) {
  return {
    captcha,
    [FETCH_API]: {
      types: [VERIFY_CAPTCHA_REQUEST, VERIFY_CAPTCHA_SUCCESS, VERIFY_CAPTCHA_FAILURE],
      endpoint: `/captcha/${captcha}/verify`,
      schema: {}
    },
    callback
  }
}

export function verifyCaptcha(captcha, callback) {
  return (dispatch) => {
    return dispatch(fetchVerifyCaptcha(captcha, callback))
  }
}

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

function fetchLogin(body, callback) {
  return {
    [FETCH_API]: {
      types: [LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE],
      endpoint: `/auth/users/verify`,
      options: {
        method: 'POST',
        body,
      },
      schema: {},
    },
    callback
  }
}

export function login(body, callback) {
  return (dispatch) => {
    return dispatch(fetchLogin(body, callback))
  }
}

export const LOGIN_USER_DETAIL_REQUEST = 'LOGIN_USER_DETAIL_REQUEST'
export const LOGIN_USER_DETAIL_SUCCESS = 'LOGIN_USER_DETAIL_SUCCESS'
export const LOGIN_USER_DETAIL_FAILURE = 'LOGIN_USER_DETAIL_FAILURE'

function fetchLoginUserDetail(callback) {
  return {
    [FETCH_API]: {
      types: [LOGIN_USER_DETAIL_REQUEST, LOGIN_USER_DETAIL_SUCCESS, LOGIN_USER_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/users/default`,
      schema: {},
    },
    callback
  }
}

export function loadLoginUserDetail(callback) {
  return (dispatch) => {
    return dispatch(fetchLoginUserDetail(callback))
  }
}

export const SET_SOCKETS = 'SET_SOCKETS'
// Resets the currently visible error message.
export function setSockets(sockets) {
  return {
    sockets,
    type: SET_SOCKETS
  }
}

export const SET_BACK_COLOR = 'SET_BACK_COLOR'
// set theme color
export function setBackColor(types) {
  return {
    type:SET_BACK_COLOR,
    types
  }
}