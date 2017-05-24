/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for personalized
 *
 * v0.1 - 2017-05-19
 * @author Baiyu
 */
import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const GET_PERSONALIZED_REQUEST = 'GET_PERSONALIZED_REQUEST'
export const GET_PERSONALIZED_SUCCESS = 'GET_PERSONALIZED_SUCCESS'
export const GET_PERSONALIZED_FAILURE = 'GET_PERSONALIZED_FAILURE'

function fetchPersonalized(callback) {
  return {
    [FETCH_API]: {
      types: [GET_PERSONALIZED_REQUEST, GET_PERSONALIZED_SUCCESS, GET_PERSONALIZED_FAILURE],
      endpoint: '/oem/info',
      schema: {}
    },
    callback
  }
}

export function getPersonalized(callback) {
  return (dispatch) => {
    dispatch(fetchPersonalized(callback))
  }
}

export const SET_BACK_COLOR = 'SET_BACK_COLOR'

export function setBackColor(types) {
  return {
    type:SET_BACK_COLOR,
    types
  }
}

export const SET_COPYRIGHT_REQUEST = 'SET_COPYRIGHT_REQUEST'
export const SET_COPYRIGHT_SUCCESS = 'SET_COPYRIGHT_SUCCESS'
export const SET_COPYRIGHT_FAILURE = 'SET_COPYRIGHT_FAILURE'

function fetchCopyright(body,callback) {
  return {
    [FETCH_API]: {
      types: [SET_COPYRIGHT_REQUEST, SET_COPYRIGHT_SUCCESS, SET_COPYRIGHT_FAILURE],
      endpoint: `${API_URL_PREFIX}/oem/info`,
      options:{
        method:'PUT',
        body:body
      },
      schema: {}
    },
    callback
  }
}

export function isCopyright (body, callback) {
  return (dispatch) => {
    return dispatch(fetchCopyright(body, callback))
  }
}

export const UPDATE_LOGO_REQUEST = 'UPDATE_LOGO_REQUEST'
export const UPDATE_LOGO_SUCCESS = 'UPDATE_LOGO_SUCCESS'
export const UPDATE_LOGO_FAILURE = 'UPDATE_LOGO_FAILURE'

function fetchUpdateLogo(body,callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_LOGO_REQUEST, UPDATE_LOGO_SUCCESS, UPDATE_LOGO_FAILURE],
      endpoint: `${API_URL_PREFIX}/oem/logo`,
      options:{
        method: 'PUT',
        noContentType: true,
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function updateLogo(body,callback) {
  return (dispatch)=> {
    return dispatch(fetchUpdateLogo(body,callback))
  }
}

export const GET_DEFAULT_INFO_REQUEST = 'GET_DEFAULT_INFO_REQUEST'
export const GET_DEFAULT_INFO_SUCCESS = 'GET_DEFAULT_INFO_SUCCESS'
export const GET_DEFAULT_INFO_FAILURE = 'GET_DEFAULT_INFO_FAILURE'

function fetchDefaultInfo(type,callback) {
  return {
    [FETCH_API]: {
      types: [GET_DEFAULT_INFO_REQUEST, GET_DEFAULT_INFO_SUCCESS, GET_DEFAULT_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/oem/${type}/default`,
      options:{
        method: 'PUT'
      },
      schema: {}
    },
    callback
  }
}

export function restoreDefault(type,callback) {
  return (dispatch)=> {
    return dispatch(fetchDefaultInfo(type,callback))
  }
}