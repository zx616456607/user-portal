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

// Fetches apps list from API unless it is cached.
// public image list 
export function loadPublicImageList(registry) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PUBLIC_LIST_REQUEST, IMAGE_PUBLIC_LIST_SUCCESS, IMAGE_PUBLIC_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}`,
      schema: Schemas.REGISTRYS
    }
  }
}

export const IMAGE_PRIVATE_LIST_REQUEST = 'IMAGE_PRIVATE_LIST_REQUEST'
export const IMAGE_PRIVATE_LIST_SUCCESS = 'IMAGE_PRIVATE_LIST_SUCCESS'
export const IMAGE_PRIVATE_LIST_FAILURE = 'IMAGE_PRIVATE_LIST_FAILURE'

// private image list
export function loadPrivateImageList() {
  return {
    [FETCH_API]: {
      types: [IMAGE_PRIVATE_LIST_REQUEST, IMAGE_PRIVATE_LIST_SUCCESS, IMAGE_PRIVATE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry`,
      schema: Schemas.REGISTRYS
    }
  }
}

export const DELETE_PRIVATE_IMAGE_REQUEST = 'DELETE_PRIVATE_IMAGE_REQUEST'
export const DELETE_PRIVATE_IMAGE_SUCCESS = 'DELETE_PRIVATE_IMAGE_SUCCESS'
export const DELETE_PRIVATE_IMAGE_FAILURE = 'DELETE_PRIVATE_IMAGE_FAILURE'
// delete private image
export function deleteImage(id, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_PRIVATE_IMAGE_REQUEST, DELETE_PRIVATE_IMAGE_SUCCESS, DELETE_PRIVATE_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${id}`,
      options: {
        method: 'DELETE',
        body: id
      },
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

//this is get the image detail tag
export const IMAGE_GET_DETAILTAG_REQUEST = 'IMAGE_GET_DETAILTAG_REQUEST'
export const IMAGE_GET_DETAILTAG_SUCCESS = 'IMAGE_GET_DETAILTAG_SUCCESS'
export const IMAGE_GET_DETAILTAG_FAILURE = 'IMAGE_GET_DETAILTAG_FAILURE'

function fetchImageGetDetailTag(registry, fullName, callback) {
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

export function getImageDetailInfo(obj, callback) {
  return {
    registry:obj.registry,
    [FETCH_API]: {
      types: [GET_IMAGEINFO_REQUEST, GET_IMAGEINFO_SUCCESS, GET_IMAGEINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${obj.fullName}/detailInfo`,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export const SET_IMAGE_STORE_REQUEST = 'SET_IMAGE_STORE_REQUEST'
export const SET_IMAGE_STORE_SUCCESS = 'SET_IMAGE_STORE_SUCCESS'
export const SET_IMAGE_STORE_FAILURE = 'SET_IMAGE_STORE_FAILURE'
// set image store 
export function imageStore(obj,callback) {
  return {
    [FETCH_API]: {
      types: [SET_IMAGE_STORE_REQUEST, SET_IMAGE_STORE_SUCCESS, SET_IMAGE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/update`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body: {name: obj.name, myfavourite: obj.myfavourite}
      },
    },
    callback
  }
}