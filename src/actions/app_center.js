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

export const IMAGE_PRIVATE_LIST_REQUEST = 'IMAGE_PRIVATE_LIST_REQUEST'
export const IMAGE_PRIVATE_LIST_SUCCESS = 'IMAGE_PRIVATE_LIST_SUCCESS'
export const IMAGE_PRIVATE_LIST_FAILURE = 'IMAGE_PRIVATE_LIST_FAILURE'

export function loadPrivateImageList(registry) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PRIVATE_LIST_REQUEST, IMAGE_PRIVATE_LIST_SUCCESS, IMAGE_PRIVATE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/private`,
      schema: Schemas.REGISTRYS
    }
  }
}

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

export const ADD_OTHER_STORE_REQUEST = 'ADD_OTHER_STORE_REQUEST'
export const ADD_OTHER_STORE_SUCCESS = 'ADD_OTHER_STORE_SUCCESS'
export const ADD_OTHER_STORE_FAILURE = 'ADD_OTHER_STORE_FAILURE'
// add Other image
export function addOtherStore(obj, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_OTHER_STORE_REQUEST, ADD_OTHER_STORE_SUCCESS, ADD_OTHER_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.registryName}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body: obj
      }
    },
    callback
  }
}

export const IMAGE_OTHER_REQUEST = 'IMAGE_OTHER_REQUEST'
export const IMAGE_OTHER_SUCCESS = 'IMAGE_OTHER_SUCCESS'
export const IMAGE_OTHER_FAILURE = 'IMAGE_OTHER_FAILURE'

// Other image title
export function loadOtherImage(callback) {
  return {
    [FETCH_API]: {
      types: [IMAGE_OTHER_REQUEST, IMAGE_OTHER_SUCCESS, IMAGE_OTHER_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

export const GET_OTHER_LIST_REQUEST = 'GET_OTHER_LIST_REQUEST'
export const GET_OTHER_LIST_SUCCESS = 'GET_OTHER_LIST_SUCCESS'
export const GET_OTHER_LIST_FAILURE = 'GET_OTHER_LIST_FAILURE'

// Other image list getOtherImageList
export function getOtherImageList(id, callback) {
  return {
    [FETCH_API]: {
      types: [GET_OTHER_LIST_REQUEST, GET_OTHER_LIST_SUCCESS, GET_OTHER_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${id}/images`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

export const DELETE_OTHER_IMAGE_REQUEST = 'DELETE_OTHER_IMAGE_REQUEST'
export const DELETE_OTHER_IMAGE_SUCCESS = 'DELETE_OTHER_IMAGE_SUCCESS'
export const DELETE_OTHER_IMAGE_FAILURE = 'DELETE_OTHER_IMAGE_FAILURE'
// delete Other image
export function deleteOtherImage(id, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_OTHER_IMAGE_REQUEST, DELETE_OTHER_IMAGE_SUCCESS, DELETE_OTHER_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${id}`,
      options: {
        method: 'DELETE',
        body: id
      },
      schema: Schemas.REGISTRYS
    },
    callback,
    id
  }
}

// export function getImageOtherInfo(obj, callback) {

// }

export const GET_OTHER_IMAGE_TAGS_REQUEST = 'GET_OTHER_IMAGE_TAGS_REQUEST'
export const GET_OTHER_IMAGE_TAGS_SUCCESS = 'GET_OTHER_IMAGE_TAGS_SUCCESS'
export const GET_OTHER_IMAGE_TAGS_FAILURE = 'GET_OTHER_IMAGE_TAGS_FAILURE'

export function getOtherImageTag(obj) {
  return {
    registry: obj.registry,
    [FETCH_API]: {
      types: [GET_OTHER_IMAGE_TAGS_REQUEST, GET_OTHER_IMAGE_TAGS_SUCCESS, GET_OTHER_IMAGE_TAGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.id}/images/${obj.imageName}/tags`,
      schema: Schemas.REGISTRYS
    }
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

// Fetches apps list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadImageDetailTagConfig(registry, fullName, tag) {
  // return (dispatch, getState) => {
  //   return dispatch(fetchImageGetDetailTagConfig(registry, fullName, tag, callback))
  // }
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_GET_DETAILTAGCONFIG_REQUEST, IMAGE_GET_DETAILTAGCONFIG_SUCCESS, IMAGE_GET_DETAILTAGCONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${fullName}/tags/${tag}/configs`,
      schema: Schemas.REGISTRYS
    }
  }
}

export const GET_OTHER_TAG_CONFIG_REQUEST = 'GET_OTHER_TAG_CONFIG_REQUEST'
export const GET_OTHER_TAG_CONFIG_SUCCESS = 'GET_OTHER_TAG_CONFIG_SUCCESS'
export const GET_OTHER_TAG_CONFIG_FAILURE = 'GET_OTHER_TAG_CONFIG_FAILURE'
export function loadOtherDetailTagConfig(obj, callback) {
  return {
    [FETCH_API]: {
      types: [GET_OTHER_TAG_CONFIG_REQUEST, GET_OTHER_TAG_CONFIG_SUCCESS, GET_OTHER_TAG_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.imageId}/images/${obj.fullname}/tags/${obj.imageTag}`,
      schema: Schemas.REGISTRYS
    },
    tag: obj.imageTag,
    callback
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
// set image store 收藏镜像
export function imageStore(obj,callback) {
  return {
    [FETCH_API]: {
      types: [SET_IMAGE_STORE_REQUEST, SET_IMAGE_STORE_SUCCESS, SET_IMAGE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${obj.image}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: {myfavourite: obj.myfavourite}
      },
    },
    registry:obj.registry,
    myfavourite: obj.myfavourite,
    callback
  }
}

export const GET_IMAGE_FOCK_REQUEST = "GET_IMAGE_FOCK_REQUEST"
export const GET_IMAGE_FOCK_SUCCESS = "GET_IMAGE_FOCK_SUCCESS"
export const GET_IMAGE_FOCK_FAILURE = "GET_IMAGE_FOCK_FAILURE"

// -------------------------- 我的收藏  ------------------------------------------
export function loadFavouriteList(registry) {
  return {
    registry,
    [FETCH_API]: {
      types: [GET_IMAGE_FOCK_REQUEST, GET_IMAGE_FOCK_SUCCESS, GET_IMAGE_FOCK_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/favourite`,
      schema: Schemas.REGISTRYS,
    }
  }
}
