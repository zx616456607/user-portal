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
      types: [IMAGE_PUBLIC_LIST_REQUEST, IMAGE_PUBLIC_LIST_SUCCESS, IMAGE_PUBLIC_LIST_FAILURE],
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

function fetchImageGetDetailTag(registry, fullName, callback) {
  console.log(fullName, 'in fullName')
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_GET_DETAILTAG_REQUEST, IMAGE_GET_DETAILTAG_SUCCESS, IMAGE_GET_DETAILTAG_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${fullName}/tags`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadImageDetailTag(registry, fullName, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchImageGetDetailTag(registry, fullName, callback))
  }
}

//this is get the image detail tag config
export const IMAGE_GET_DETAILTAGCONFIG_REQUEST = 'IMAGE_GET_DETAILTAGCONFIG_REQUEST'
export const IMAGE_GET_DETAILTAGCONFIG_SUCCESS = 'IMAGE_GET_DETAILTAGCONFIG_SUCCESS'
export const IMAGE_GET_DETAILTAGCONFIG_FAILURE = 'IMAGE_GET_DETAILTAGCONFIG_FAILURE'

function fetchImageGetDetailTagConfig(registry, fullName, tag, callback) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_GET_DETAILTAGCONFIG_REQUEST, IMAGE_GET_DETAILTAGCONFIG_SUCCESS, IMAGE_GET_DETAILTAGCONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${fullName}/tags/${tag}/configs`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadImageDetailTagConfig(registry, fullName, tag, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchImageGetDetailTagConfig(registry, fullName, tag, callback))
  }
}

//this is get the image info(docker and attribute)
export const GET_IMAGEINFO_REQUEST = 'GET_IMAGEINFO_REQUEST'
export const GET_IMAGEINFO_SUCCESS = 'GET_IMAGEINFO_SUCCESS'
export const GET_IMAGEINFO_FAILURE = 'GET_IMAGEINFO_FAILURE'

export function getImageDetailInfo(registry, fullName) {
  return {
    registry,
    fullName,
    [FETCH_API]: {
      types: [GET_IMAGEINFO_REQUEST, GET_IMAGEINFO_SUCCESS, GET_IMAGEINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${fullName}/detailInfo`,
      schema: Schemas.REGISTRYS
    }
  }
}

