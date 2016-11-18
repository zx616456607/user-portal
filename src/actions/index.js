/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { getCookie, setCookie } from '../common/tools'
import { USER_CURRENT_CONFIG } from '../../constants'

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'
// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}

export const SET_CURRENT = 'SET_CURRENT'
// Resets the currently visible error message.
export function setCurrent(current) {
  const config = getCookie(USER_CURRENT_CONFIG)
  let [teamID, namespace, clusterID] = config.split(',')
  if (current.team) {
    teamID = current.team.teamID
  }
  if (current.space) {
    namespace = current.space.namespace
  }
  if (current.cluster) {
    clusterID = current.cluster.clusterID
  }
  setCookie(USER_CURRENT_CONFIG, `${teamID},${namespace},${clusterID}`)
  return {
    current,
    type: SET_CURRENT
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
      endpoint: `/users/default`,
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