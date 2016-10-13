/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Redux actions for app manage
 * 
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const IMAGE_PUBLIC_LIST_REQUEST = 'IMAGE_PUBLIC_LIST_REQUEST'
export const IMAGE_PUBLIC_LIST_SUCCESS = 'IMAGE_PUBLIC_LIST_SUCCESS'
export const IMAGE_PUBLIC_LIST_FAILURE = 'IMAGE_PUBLIC_LIST_FAILURE'

// Fetches app list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPublicImageList(registry) {
  return {
    registry,
    [FETCH_API]: {
      types: [ IMAGE_PUBLIC_LIST_REQUEST, IMAGE_PUBLIC_LIST_SUCCESS, IMAGE_PUBLIC_LIST_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}`,
      schema: Schemas.REGISTRYS
    }
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadPublicImageList(registry) {
  return (dispatch, getState) => {
    return dispatch(fetchPublicImageList(registry))
  }
}

//this is get the image detail tag
export const IMAGE_GET_DETAILTAG_REQUEST = 'IMAGE_GET_DETAILTAG_REQUEST'
export const IMAGE_GET_DETAILTAG_SUCCESS = 'IMAGE_GET_DETAILTAG_SUCCESS'
export const IMAGE_GET_DETAILTAG_FAILURE = 'IMAGE_GET_DETAILTAG_FAILURE'

function fetchImageGetDetailTag(registry,fullName) {
  return {
    registry,
    [FETCH_API]: {
      types: [ IMAGE_GET_DETAILTAG_REQUEST, IMAGE_GET_DETAILTAG_SUCCESS, IMAGE_GET_DETAILTAG_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${fullName}/tags`,
      schema: Schemas.REGISTRYS
    }
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadImageDetailTag(registry,fullName) {
  return (dispatch, getState) => {
    return dispatch(fetchImageGetDetailTag(registry,fullName))
  }
}

//this is get the image detail tag config
export const IMAGE_GET_DETAILTAGCONFIG_REQUEST = 'IMAGE_GET_DETAILTAGCONFIG_REQUEST'
export const IMAGE_GET_DETAILTAGCONFIG_SUCCESS = 'IMAGE_GET_DETAILTAGCONFIG_SUCCESS'
export const IMAGE_GET_DETAILTAGCONFIG_FAILURE = 'IMAGE_GET_DETAILTAGCONFIG_FAILURE'

function fetchImageGetDetailTagConfig(registry,fullName,tag) {
  return {
    registry,
    [FETCH_API]: {
      types: [ IMAGE_GET_DETAILTAGCONFIG_REQUEST, IMAGE_GET_DETAILTAGCONFIG_SUCCESS, IMAGE_GET_DETAILTAGCONFIG_FAILURE ],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${fullName}/tags/${tag}/config`,
      schema: Schemas.REGISTRYS
    }
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadImageDetailTagConfig(registry,fullName,tag) {
  return (dispatch, getState) => {
    return dispatch(fetchImageGetDetailTagConfig( registry, fullName, tag))
  }
}


