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
import { toQuerystring, encodeImageFullname } from '../common/tools'

export const IMAGE_PRIVATE_LIST_REQUEST = 'IMAGE_PRIVATE_LIST_REQUEST'
export const IMAGE_PRIVATE_LIST_SUCCESS = 'IMAGE_PRIVATE_LIST_SUCCESS'
export const IMAGE_PRIVATE_LIST_FAILURE = 'IMAGE_PRIVATE_LIST_FAILURE'

export function loadPrivateImageList(registry, callback) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PRIVATE_LIST_REQUEST, IMAGE_PRIVATE_LIST_SUCCESS, IMAGE_PRIVATE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/private`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

export const IMAGE_PUBLIC_LIST_REQUEST = 'IMAGE_PUBLIC_LIST_REQUEST'
export const IMAGE_PUBLIC_LIST_SUCCESS = 'IMAGE_PUBLIC_LIST_SUCCESS'
export const IMAGE_PUBLIC_LIST_FAILURE = 'IMAGE_PUBLIC_LIST_FAILURE'

// Fetches app list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.

// Fetches apps list from API unless it is cached.
// public image list
export function loadPublicImageList(registry, serverType = null, callback) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PUBLIC_LIST_REQUEST, IMAGE_PUBLIC_LIST_SUCCESS, IMAGE_PUBLIC_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}`,
      schema: Schemas.REGISTRYS
    },
    serverType,
    callback
  }
}

export function searchPublicImages(registry, image) {
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_PUBLIC_LIST_REQUEST, IMAGE_PUBLIC_LIST_SUCCESS, IMAGE_PUBLIC_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}?q=${image}`,
      schema: Schemas.REGISTRYS
    }
  }
}

export const IMAGE_PUBLIC_TYPE = 'IMAGE_PUBLIC_TYPE'

export function publicFilterServer(registry, server) {
  return {
    type: IMAGE_PUBLIC_TYPE,
    registry,
    server
  }
}

export const IMAGE_SEARCH_PRIVATE = "IMAGE_SEARCH_PRIVATE"

export function searchPrivateImages(condition) {
  return {
    type: IMAGE_SEARCH_PRIVATE,
    condition
  }
}

export const IMAGE_SEARCH_FAVORITE = "IMAGE_SEARCH_FAVORITE"
export function searchFavoriteImages(condition) {
  return {
    type: IMAGE_SEARCH_FAVORITE,
    condition
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

// Other image  table
export function LoadOtherImage(callback) {
  return {
    [FETCH_API]: {
      types: [IMAGE_OTHER_REQUEST, IMAGE_OTHER_SUCCESS, IMAGE_OTHER_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry`,
      schema: Schemas.REGISTRYS
    },
    callback
  }
}

export function dispatchLoadOtherImage(id, query, callback) {
  return (dispatch) => {
    return dispatch(LoadOtherImage(id, query, callback))
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
    id,
    callback
  }
}

export function dispatchGetOtherImageList(id, callback) {
  return (dispatch) => {
    return dispatch(getOtherImageList(id, callback))
  }
}

export const SEARCH_DOCKERHUB_REPOS_REQUEST = 'SEARCH_DOCKERHUB_REPOS_REQUEST'
export const SEARCH_DOCKERHUB_REPOS_SUCCESS = 'SEARCH_DOCKERHUB_REPOS_SUCCESS'
export const SEARCH_DOCKERHUB_REPOS_FAILURE = 'SEARCH_DOCKERHUB_REPOS_FAILURE'

function fetchSearchDockerhubRepos(id, query, callback) {
  let endpoint = `${API_URL_PREFIX}/docker-registry/${id}/images/search`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    id,
    [FETCH_API]: {
      types: [SEARCH_DOCKERHUB_REPOS_REQUEST, SEARCH_DOCKERHUB_REPOS_SUCCESS, SEARCH_DOCKERHUB_REPOS_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

export function searchDockerhubRepos(id, query, callback) {
  return (dispatch) => {
    return dispatch(fetchSearchDockerhubRepos(id, query, callback))
  }
}

export const GET_DOCKER_REGISTRY_NAMESPACES_REQUEST = 'GET_DOCKER_REGISTRY_NAMESPACES_REQUEST'
export const GET_DOCKER_REGISTRY_NAMESPACES_SUCCESS = 'GET_DOCKER_REGISTRY_NAMESPACES_SUCCESS'
export const GET_DOCKER_REGISTRY_NAMESPACES_FAILURE = 'GET_DOCKER_REGISTRY_NAMESPACES_FAILURE'

function fetchRegistryNamespaces(id, callback) {
  let endpoint = `${API_URL_PREFIX}/docker-registry/${id}/namespaces`
  return {
    id,
    [FETCH_API]: {
      types: [GET_DOCKER_REGISTRY_NAMESPACES_REQUEST, GET_DOCKER_REGISTRY_NAMESPACES_SUCCESS, GET_DOCKER_REGISTRY_NAMESPACES_FAILURE],
      endpoint,
      schema: {}
    },
    callback,
  }
}

export function getRegistryNamespaces(id, callback) {
  return (dispatch) => {
    return dispatch(fetchRegistryNamespaces(id, callback))
  }
}

export const SEARCH_OTHER_LIST_REQUEST = 'SEARCH_OTHER_LIST_REQUEST'
// Search Other image list getOtherImageList
export function SearchOtherImage(image,id) {
  return {
    type: SEARCH_OTHER_LIST_REQUEST,
    image,
    id
  }
}

export const DELETE_OTHER_IMAGE_REQUEST = 'DELETE_OTHER_IMAGE_REQUEST'
export const DELETE_OTHER_IMAGE_SUCCESS = 'DELETE_OTHER_IMAGE_SUCCESS'
export const DELETE_OTHER_IMAGE_FAILURE = 'DELETE_OTHER_IMAGE_FAILURE'
// delete Other image
export function DeleteOtherImage(id, callback) {
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

export const GET_OTHER_IMAGE_TAGS_REQUEST = 'GET_OTHER_IMAGE_TAGS_REQUEST'
export const GET_OTHER_IMAGE_TAGS_SUCCESS = 'GET_OTHER_IMAGE_TAGS_SUCCESS'
export const GET_OTHER_IMAGE_TAGS_FAILURE = 'GET_OTHER_IMAGE_TAGS_FAILURE'

export function getOtherImageTag(obj, callback) {
  return {
    fullname: obj.imageName,
    registry: obj.registry,
    [FETCH_API]: {
      types: [GET_OTHER_IMAGE_TAGS_REQUEST, GET_OTHER_IMAGE_TAGS_SUCCESS, GET_OTHER_IMAGE_TAGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.id}/images/${encodeImageFullname(obj.imageName)}/tags`,
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
  let urlFullName = encodeImageFullname(fullName)
  return {
    registry,
    fullName,
    [FETCH_API]: {
      types: [IMAGE_GET_DETAILTAG_REQUEST, IMAGE_GET_DETAILTAG_SUCCESS, IMAGE_GET_DETAILTAG_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${urlFullName}/tags`,
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
function fetchImageGetDetailTagConfig(registry, fullName, tag, callback) {
  let urlFullName = encodeImageFullname(fullName)
  return {
    registry,
    [FETCH_API]: {
      types: [IMAGE_GET_DETAILTAGCONFIG_REQUEST, IMAGE_GET_DETAILTAGCONFIG_SUCCESS, IMAGE_GET_DETAILTAGCONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/${urlFullName}/tags/${tag}/configs`,
      schema: Schemas.REGISTRYS
    },
    callback,
    tag
  }
}

export function loadImageDetailTagConfig(registry, fullName, tag, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchImageGetDetailTagConfig(registry, fullName, tag, callback))
  }
}

export const GET_OTHER_TAG_CONFIG_REQUEST = 'GET_OTHER_TAG_CONFIG_REQUEST'
export const GET_OTHER_TAG_CONFIG_SUCCESS = 'GET_OTHER_TAG_CONFIG_SUCCESS'
export const GET_OTHER_TAG_CONFIG_FAILURE = 'GET_OTHER_TAG_CONFIG_FAILURE'
export function loadOtherDetailTagConfig(obj, callback) {
  let urlFullName = encodeImageFullname(obj.fullname)
  return {
    [FETCH_API]: {
      types: [GET_OTHER_TAG_CONFIG_REQUEST, GET_OTHER_TAG_CONFIG_SUCCESS, GET_OTHER_TAG_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/docker-registry/${obj.imageId}/images/${urlFullName}/tags/${obj.imageTag}`,
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
  let urlFullName = encodeImageFullname(obj.fullName)
  return {
    registry: obj.registry,
    [FETCH_API]: {
      types: [GET_IMAGEINFO_REQUEST, GET_IMAGEINFO_SUCCESS, GET_IMAGEINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlFullName}/detailInfo`,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export const GET_CHECK_IMAGE_REQUEST = 'GET_CHECK_IMAGE_REQUEST'
export const GET_CHECK_IMAGE_SUCCESS = 'GET_CHECK_IMAGE_SUCCESS'
export const GET_CHECK_IMAGE_FAILURE = 'GET_CHECK_IMAGE_FAILURE'

function fetchCheckImage(obj, callback) {
  let urlImage = encodeImageFullname(obj.image)
  return {
    [FETCH_API]: {
      types: [GET_CHECK_IMAGE_REQUEST, GET_CHECK_IMAGE_SUCCESS, GET_CHECK_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/repositories/${urlImage}/tags`,
      schema: {}
    },
    registry: obj.registry,
    callback
  }
}

export function checkImage(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCheckImage(obj, callback))
  }
}

export const DELETE_PRIVATE_IMAGE_REQUEST = 'DELETE_PRIVATE_IMAGE_REQUEST'
export const DELETE_PRIVATE_IMAGE_SUCCESS = 'DELETE_PRIVATE_IMAGE_SUCCESS'
export const DELETE_PRIVATE_IMAGE_FAILURE = 'DELETE_PRIVATE_IMAGE_FAILURE'

function fetchDeletePrivateImage(obj, callback) {
  let urlImage = encodeImageFullname(obj.image)
  return {
    [FETCH_API]: {
      types: [DELETE_PRIVATE_IMAGE_REQUEST, DELETE_PRIVATE_IMAGE_SUCCESS, DELETE_PRIVATE_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'DELETE',
      }
    },
    image: obj.image,
    registry: obj.registry,
    callback
  }
}

export function deleteImage(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeletePrivateImage(obj, callback))
  }
}

export const UPDATA_IMAGE_INFO_REQUEST = 'UPDATA_IMAGE_INFO_REQUEST'
export const UPDATA_IMAGE_INFO_SUCCESS = 'UPDATA_IMAGE_INFO_SUCCESS'
export const UPDATA_IMAGE_INFO_FAILURE = 'UPDATA_IMAGE_INFO_FAILURE'

function fetchUpdateImageInfo(obj, callback) {
  let urlImage = encodeImageFullname(obj.image)
  return {
    [FETCH_API]: {
      types: [UPDATA_IMAGE_INFO_REQUEST, UPDATA_IMAGE_INFO_SUCCESS, UPDATA_IMAGE_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: obj.body
      }
    },
    image: obj.image,
    registry: obj.registry,
    callback
  }
}

export function updateImageinfo(obj, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateImageInfo(obj, callback))
  }
}

export const SET_IMAGE_STORE_REQUEST = 'SET_IMAGE_STORE_REQUEST'
export const SET_IMAGE_STORE_SUCCESS = 'SET_IMAGE_STORE_SUCCESS'
export const SET_IMAGE_STORE_FAILURE = 'SET_IMAGE_STORE_FAILURE'
// set image store 收藏镜像
export function imageStore(obj, callback) {
  let urlImage = encodeImageFullname(obj.image)
  return {
    [FETCH_API]: {
      types: [SET_IMAGE_STORE_REQUEST, SET_IMAGE_STORE_SUCCESS, SET_IMAGE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: {
          myfavourite: obj.isFavourite,
        }
      }
    },
    registry: obj.registry,
    isFavourite: obj.isFavourite,
    callback
  }
}
// set image store 设置镜像 公开 or 私有
export function imageSwitch(obj, callback) {
  let urlImage = encodeImageFullname(obj.image)
  return {
    [FETCH_API]: {
      types: [SET_IMAGE_STORE_REQUEST, SET_IMAGE_STORE_SUCCESS, SET_IMAGE_STORE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${obj.registry}/${urlImage}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: {
          isPrivate: obj.isPrivate
        }
      }
    },
    registry: obj.registry,
    isPrivate: obj.isPrivate,
    callback
  }
}

export const GET_IMAGE_FOCK_REQUEST = "GET_IMAGE_FOCK_REQUEST"
export const GET_IMAGE_FOCK_SUCCESS = "GET_IMAGE_FOCK_SUCCESS"
export const GET_IMAGE_FOCK_FAILURE = "GET_IMAGE_FOCK_FAILURE"

// -------------------------- 我的收藏  ------------------------------------------
export function loadFavouriteList(registry, callback) {
  return {
    registry,
    [FETCH_API]: {
      types: [GET_IMAGE_FOCK_REQUEST, GET_IMAGE_FOCK_SUCCESS, GET_IMAGE_FOCK_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/favourite`,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

// --------------------------  编排中心   ---------------------------------- ------
export const CREATE_STACK_REQUEST = 'CREATE_STACK_REQUEST'
export const CREATE_STACK_SUCCESS = 'CREATE_STACK_SUCCESS'
export const CREATE_STACK_FAILURE = 'CREATE_STACK_FAILURE'
export function createStack(obj, callback) {
  return {
    registry: obj.registry,
    [FETCH_API]: {
      types: [CREATE_STACK_REQUEST, CREATE_STACK_SUCCESS, CREATE_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body: {
          'is_public': obj.is_public,
          'content': obj.content,
          'name': obj.name,
          'description': obj.description
        }
      }
    },
    callback
  }
}

export const GET_PRIVATE_STACK_REQUEST = 'GET_PRIVATE_STACK_REQUEST'
export const GET_PRIVATE_STACK_SUCCESS = 'GET_PRIVATE_STACK_SUCCESS'
export const GET_PRIVATE_STACK_FAILURE = 'GET_PRIVATE_STACK_FAILURE'
//filter=owned private templates  filter=dbservice is database cluster
function fetchLoadTemplates(registry, query, callback) {

  let filter = 'owned'
  let url = `${API_URL_PREFIX}/templates?filter=${filter}`;
  if (typeof query !== 'string') {
    url = `${API_URL_PREFIX}/templates?${toQuerystring(query)}`
  }else if(typeof query === 'string'){
    url = `${API_URL_PREFIX}/templates?filter=${query}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [GET_PRIVATE_STACK_REQUEST, GET_PRIVATE_STACK_SUCCESS, GET_PRIVATE_STACK_FAILURE],
      endpoint: url,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export function loadMyStack(registry, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchLoadTemplates(registry, query, callback))
  }
}

export const GET_PUBLIC_STACK_REQUEST = 'GET_PUBLIC_STACK_REQUEST'
export const GET_PUBLIC_STACK_SUCCESS = 'GET_PUBLIC_STACK_SUCCESS'
export const GET_PUBLIC_STACK_FAILURE = 'GET_PUBLIC_STACK_FAILURE'

function fetchLoadStack(registry,query) {
  let url = `${API_URL_PREFIX}/templates`;
  if( query && query.from !== 0 ){
    url = `${API_URL_PREFIX}/templates?${toQuerystring(query)}`
  }
  return {
    registry,
    [FETCH_API]: {
      types: [GET_PUBLIC_STACK_REQUEST, GET_PUBLIC_STACK_SUCCESS, GET_PUBLIC_STACK_FAILURE],
      endpoint: url,
      schema: Schemas.REGISTRYS,
    }
  }
}

export function loadStack(registry,query) {
  return (dispatch, getState) => {
    return dispatch(fetchLoadStack(registry,query))
  }
}

export const SEARCH_PRIVATE_STACK_LIST = 'SEARCH_PRIVATE_STACK_LIST'
export const SEARCH_PUBLIC_STACK_LIST = 'SEARCH_PUBLIC_STACK_LIST'
function fetchSearchStack(obj) {
  let type = SEARCH_PRIVATE_STACK_LIST
  if (obj.stackType === 'public-stack') {
    type = SEARCH_PUBLIC_STACK_LIST
  }
  return {
    type,
    registry: obj.registry,
    imageName: obj.imageName
  }
}

export function searchStack(obj) {
  return (dispatch, getState) => {
    return dispatch(fetchSearchStack(obj))
  }
}

export const DELETE_PRIVATE_STACK_REQUEST = 'DELETE_PRIVATE_STACK_REQUEST'
export const DELETE_PRIVATE_STACK_SUCCESS = 'DELETE_PRIVATE_STACK_SUCCESS'
export const DELETE_PRIVATE_STACK_FAILURE = 'DELETE_PRIVATE_STACK_FAILURE'

export function deleteMyStack(obj, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_PRIVATE_STACK_REQUEST, DELETE_PRIVATE_STACK_SUCCESS, DELETE_PRIVATE_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates/${obj.id}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'DELETE',
      }
    },
    callback,
    registry: obj.registry,
    id: obj.id
  }
}

export const UPDATE_PRIVATE_STACK_REQUEST = 'UPDATE_PRIVATE_STACK_REQUEST'
export const UPDATE_PRIVATE_STACK_SUCCESS = 'UPDATE_PRIVATE_STACK_SUCCESS'
export const UPDATE_PRIVATE_STACK_FAILURE = 'UPDATE_PRIVATE_STACK_FAILURE'

export function updateStack(obj, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_PRIVATE_STACK_REQUEST, UPDATE_PRIVATE_STACK_SUCCESS, UPDATE_PRIVATE_STACK_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates/${obj.id}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'PUT',
        body: {
          'is_public': obj.is_public,
          'content': obj.content,
          'name': obj.name,
          'description': obj.description
        }
      }
    },
    obj,
    callback,
    registry: obj.registry,
    id: obj.id
  }
}

export const GET_PRIVATE_STACK_INFO_REQUEST = 'GET_PRIVATE_STACK_INFO_REQUEST'
export const GET_PRIVATE_STACK_INFO_SUCCESS = 'GET_PRIVATE_STACK_INFO_SUCCESS'
export const GET_PRIVATE_STACK_INFO_FAILURE = 'GET_PRIVATE_STACK_INFO_FAILURE'

function fetchStackDetail(id, callback) {
  return {
    [FETCH_API]: {
      types: [GET_PRIVATE_STACK_INFO_REQUEST, GET_PRIVATE_STACK_INFO_SUCCESS, GET_PRIVATE_STACK_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates/${id}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'GET',
      }
    },
    callback
  }
}

export function loadStackDetail(id, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStackDetail(id, callback))
  }
}

export const GET_APP_STORE_LIST_REQUEST = 'GET_APP_STORE_LIST_REQUEST'
export const GET_APP_STORE_LIST_SUCCESS = 'GET_APP_STORE_LIST_SUCCESS'
export const GET_APP_STORE_LIST_FAILURE = 'GET_APP_STORE_LIST_FAILURE'

function fetchAppStore(registry, callback) {
  return {
    [FETCH_API]: {
      types: [GET_APP_STORE_LIST_REQUEST, GET_APP_STORE_LIST_SUCCESS, GET_APP_STORE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/templates?filter=appstore`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'GET',
      }
    },
    registry,
    callback
  }
}

export function loadAppStore(registry, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAppStore(registry, callback))
  }
}

export const GET_ENTERPRISE_APP_CENTER_BIND_REQUEST = 'GET_ENTERPRISE_APP_CENTER_BIND_REQUEST'
export const GET_ENTERPRISE_APP_CENTER_BIND_SUCCESS = 'GET_ENTERPRISE_APP_CENTER_BIND_SUCCESS'
export const GET_ENTERPRISE_APP_CENTER_BIND_FAILURE = 'GET_ENTERPRISE_APP_CENTER_BIND_FAILURE'

function fetchAppCenterBindUser(callback) {
  return {
    [FETCH_API]: {
      types: [GET_ENTERPRISE_APP_CENTER_BIND_REQUEST, GET_ENTERPRISE_APP_CENTER_BIND_SUCCESS, GET_ENTERPRISE_APP_CENTER_BIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/tenx-hubs`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'GET',
      }
    },
    callback
  }
}

export function getAppCenterBindUser(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAppCenterBindUser(callback))
  }
}

export const POST_ENTERPRISE_APP_CENTER_BIND_REQUEST = 'POST_ENTERPRISE_APP_CENTER_BIND_REQUEST'
export const POST_ENTERPRISE_APP_CENTER_BIND_SUCCESS = 'POST_ENTERPRISE_APP_CENTER_BIND_SUCCESS'
export const POST_ENTERPRISE_APP_CENTER_BIND_FAILURE = 'POST_ENTERPRISE_APP_CENTER_BIND_FAILURE'

function postAppCenterBindUser(body, callback) {
  return {
    [FETCH_API]: {
      types: [POST_ENTERPRISE_APP_CENTER_BIND_REQUEST, POST_ENTERPRISE_APP_CENTER_BIND_SUCCESS, POST_ENTERPRISE_APP_CENTER_BIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/tenx-hubs`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body: body
      }
    },
    callback
  }
}

export function AppCenterBindUser(body, callback) {
  return (dispatch, getState) => {
    return dispatch(postAppCenterBindUser(body, callback))
  }
}

export const DEL_ENTERPRISE_APP_CENTER_BIND_REQUEST = 'DEL_ENTERPRISE_APP_CENTER_BIND_REQUEST'
export const DEL_ENTERPRISE_APP_CENTER_BIND_SUCCESS = 'DEL_ENTERPRISE_APP_CENTER_BIND_SUCCESS'
export const DEL_ENTERPRISE_APP_CENTER_BIND_FAILURE = 'DEL_ENTERPRISE_APP_CENTER_BIND_FAILURE'

function delAppCenterBindUser(callback) {
  return {
    [FETCH_API]: {
      types: [DEL_ENTERPRISE_APP_CENTER_BIND_REQUEST, DEL_ENTERPRISE_APP_CENTER_BIND_SUCCESS, DEL_ENTERPRISE_APP_CENTER_BIND_FAILURE],
      endpoint: `${API_URL_PREFIX}/tenx-hubs`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'DELETE',
      }
    },
    callback
  }
}

export function deleteAppCenterBindUser(callback) {
  return (dispatch, getState) => {
    return dispatch(delAppCenterBindUser(callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_SCANSTATUS_REQUEST = 'GET_IMAGE_MIRRORSAFETY_SCANSTATUS_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_SCANSTATUS_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_SCANSTATUS_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_SCANSTATUS_FAILURE = 'GET_IMAGE_MIRRORSAFETY_SCANSTATUS_FAILURE'

function fetchMirrorSafetyScanStatus(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_SCANSTATUS_REQUEST, GET_IMAGE_MIRRORSAFETY_SCANSTATUS_SUCCESS, GET_IMAGE_MIRRORSAFETY_SCANSTATUS_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/scan-status?imageName=${body.imageName}&tag=${body.tag}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyScanStatus(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyScanStatus(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_SCAN_REQUEST = 'GET_IMAGE_MIRRORSAFETY_SCAN_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_SCAN_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_SCAN_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_SCAN_FAILURE = 'GET_IMAGE_MIRRORSAFETY_SCAN_FAILURE'

function fetchMirrorSafetyScan(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_SCAN_REQUEST, GET_IMAGE_MIRRORSAFETY_SCAN_SUCCESS, GET_IMAGE_MIRRORSAFETY_SCAN_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/scan`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body
      }
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyScan(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyScan(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_LAYERINFO_REQUEST = 'GET_IMAGE_MIRRORSAFETY_LAYERINFO_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_LAYERINFO_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_LAYERINFO_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_LAYERINFO_FAILURE = 'GET_IMAGE_MIRRORSAFETY_LAYERINFO_FAILURE'

function fetchMirrorSafetyLayerinfo(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_LAYERINFO_REQUEST, GET_IMAGE_MIRRORSAFETY_LAYERINFO_SUCCESS, GET_IMAGE_MIRRORSAFETY_LAYERINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/layer-info?imageName=${body.imageName}&tag=${body.tag}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyLayerinfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyLayerinfo(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_LYINSINFO_REQUEST = 'GET_IMAGE_MIRRORSAFETY_LYINSINFO_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_LYINSINFO_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_LYINSINFO_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_LYINSINFO_FAILURE = 'GET_IMAGE_MIRRORSAFETY_LYINSINFO_FAILURE'

function fetchMirrorSafetyLyinsinfo(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_LYINSINFO_REQUEST, GET_IMAGE_MIRRORSAFETY_LYINSINFO_SUCCESS, GET_IMAGE_MIRRORSAFETY_LYINSINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/lyins-info?blob_sum=${body.blob_sum}&full_name=${body.full_name}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyLyinsinfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyLyinsinfo(body, callback))
  }
}

export const GET_IMAGE_MIRRORSAFETY_CLAIRINFO_REQUEST = 'GET_IMAGE_MIRRORSAFETY_CLAIRINFO_REQUEST'
export const GET_IMAGE_MIRRORSAFETY_CLAIRINFO_SUCCESS = 'GET_IMAGE_MIRRORSAFETY_CLAIRINFO_SUCCESS'
export const GET_IMAGE_MIRRORSAFETY_CLAIRINFO_FAILURE = 'GET_IMAGE_MIRRORSAFETY_CLAIRINFO_FAILURE'

function fetchMirrorSafetyChairinfo(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_IMAGE_MIRRORSAFETY_CLAIRINFO_REQUEST, GET_IMAGE_MIRRORSAFETY_CLAIRINFO_SUCCESS, GET_IMAGE_MIRRORSAFETY_CLAIRINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/images/clair-info?blob_sum=${body.blob_sum}&full_name=${body.full_name}`,
      schema: Schemas.REGISTRYS,
    },
    imageName:body.imageName,
    tag:body.tag,
    callback
  }
}

export function loadMirrorSafetyChairinfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchMirrorSafetyChairinfo(body, callback))
  }
}

export const GET_WRAP_MANAGE_LIST_REQUEST = 'GET_WRAP_MANAGE_LIST_REQUEST'
export const GET_WRAP_MANAGE_LIST_SUCCESS = 'GET_WRAP_MANAGE_LIST_SUCCESS'
export const GET_WRAP_MANAGE_LIST_FAILURE = 'GET_WRAP_MANAGE_LIST_FAILURE'

function fetchWrapManageList(query,callback) {
  let endpointUrl = `${API_URL_PREFIX}/pkg`
  const newQuery = Object.assign({}, query)
  if (query) {
    delete query.headers
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_WRAP_MANAGE_LIST_REQUEST, GET_WRAP_MANAGE_LIST_SUCCESS, GET_WRAP_MANAGE_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: Schemas.REGISTRYS,
      options: {
        headers: newQuery.headers
      }
    },
    callback
  }
}

export function wrapManageList(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchWrapManageList(query, callback))
  }
}

export const GET_REGISTRY_TEMPLATE_REQUEST = 'GET_REGISTRY_TEMPLATE_REQUEST'
export const GET_REGISTRY_TEMPLATE_SUCCESS = 'GET_REGISTRY_TEMPLATE_SUCCESS'
export const GET_REGISTRY_TEMPLATE_FAILURE = 'GET_REGISTRY_TEMPLATE_FAILURE'

export function getImageTemplate(registry, callback) {
  return {
    [FETCH_API]: {
      types: [GET_REGISTRY_TEMPLATE_REQUEST, GET_REGISTRY_TEMPLATE_SUCCESS, GET_REGISTRY_TEMPLATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/${registry}/template`,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export const DEL_WRAP_MANAGE_LIST_REQUEST = 'DEL_WRAP_MANAGE_LIST_REQUEST'
export const DEL_WRAP_MANAGE_LIST_SUCCESS = 'DEL_WRAP_MANAGE_LIST_SUCCESS'
export const DEL_WRAP_MANAGE_LIST_FAILURE = 'DEL_WRAP_MANAGE_LIST_FAILURE'

function fetchDelwrapManage(body, callback) {
  return {
    [FETCH_API]: {
      types: [DEL_WRAP_MANAGE_LIST_REQUEST, DEL_WRAP_MANAGE_LIST_SUCCESS, DEL_WRAP_MANAGE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/batch-delete`,
      options:{
        method: 'POST',
        body: body
      },
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export function deleteWrapManage(body, callback) {
  return (dispatch)=> {
    return dispatch(fetchDelwrapManage(body, callback))
  }
}

const UPLOAD_WRAP_REQUEST = 'UPLOAD_WRAP_REQUEST'
const UPLOAD_WRAP_SUCCESS = 'UPLOAD_WRAP_SUCCESS'
const UPLOAD_WRAP_FAILURE = 'UPLOAD_WRAP_FAILURE'

function fetchUploadWrap(query,body,callback) {
  return {
    [FETCH_API]: {
      types: [UPLOAD_WRAP_REQUEST, UPLOAD_WRAP_SUCCESS, UPLOAD_WRAP_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/remote?${toQuerystring(query)}`,
      schema: Schemas.REGISTRYS,
      options:{
        method:'POST',
        body
      }

    },
    callback
  }
}

export function uploadWrap(query, body, callback) {
  return (dispatch) => {
    return dispatch(fetchUploadWrap(query, body, callback))
  }
}


export const CHECK_WRAP_MANAGE_REQUEST = 'CHECK_WRAP_MANAGE_REQUEST'
export const CHECK_WRAP_MANAGE_SUCCESS = 'CHECK_WRAP_MANAGE_SUCCESS'
export const CHECK_WRAP_MANAGE_FAILURE = 'CHECK_WRAP_MANAGE_FAILURE'

function fetchCheckWrapManage(query,callback) {
  let endpointUrl = `${API_URL_PREFIX}/pkg`
  if (query) {
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CHECK_WRAP_MANAGE_REQUEST, CHECK_WRAP_MANAGE_SUCCESS, CHECK_WRAP_MANAGE_FAILURE],
      endpoint: endpointUrl,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export function checkWrapName(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCheckWrapManage(query, callback))
  }
}

export const AUDIT_WRAP_REQUEST = 'AUDIT_WRAP_REQUEST'
export const AUDIT_WRAP_SUCCESS = 'AUDIT_WRAP_SUCCESS'
export const AUDIT_WRAP_FAILURE = 'AUDIT_WRAP_FAILURE'

function fetchAuditWrap(pkgID, body, callback) {
  return {
    [FETCH_API]: {
      types: [AUDIT_WRAP_REQUEST,AUDIT_WRAP_SUCCESS,AUDIT_WRAP_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/${pkgID}/audit`,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback
  }
}

export function auditWrap(pkgID, body, callback) {
  return dispatch => dispatch(fetchAuditWrap(pkgID, body, callback))
}

export const PUBLISH_WRAP_REQUEST = 'PUBLISH_WRAP_REQUEST'
export const PUBLISH_WRAP_SUCCESS = 'PUBLISH_WRAP_SUCCESS'
export const PUBLISH_WRAP_FAILURE = 'PUBLISH_WRAP_FAILURE'

function fetchPublishWrap(pkgID, body, callback) {
  return {
    [FETCH_API]: {
      types: [PUBLISH_WRAP_REQUEST,PUBLISH_WRAP_SUCCESS,PUBLISH_WRAP_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/${pkgID}/publish`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function publishWrap(pkgID, body, callback) {
  return dispatch => dispatch(fetchPublishWrap(pkgID, body, callback))
}

export const WRAP_DETAIL_REQUEST = 'WRAP_DETAIL_REQUEST'
export const WRAP_DETAIL_SUCCESS = 'WRAP_DETAIL_SUCCESS'
export const WRAP_DETAIL_FAILURE = 'WRAP_DETAIL_FAILURE'

function fetchWrapDetail(pkgID, callback) {
  return {
    [FETCH_API]: {
      types: [WRAP_DETAIL_REQUEST,WRAP_DETAIL_SUCCESS,WRAP_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/${pkgID}/detail`,
      schema: {},
    },
    callback
  }
}

export function getWrapDetail(pkgID, callback) {
  return dispatch => dispatch(fetchWrapDetail(pkgID, callback))
}

export const UPDATE_WRAP_DETAIL_REQUEST = 'UPDATE_WRAP_DETAIL_REQUEST'
export const UPDATE_WRAP_DETAIL_SUCCESS = 'UPDATE_WRAP_DETAIL_SUCCESS'
export const UPDATE_WRAP_DETAIL_FAILURE = 'UPDATE_WRAP_DETAIL_FAILURE'

function editWrapDetail(pkgID, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_WRAP_DETAIL_REQUEST,UPDATE_WRAP_DETAIL_SUCCESS,UPDATE_WRAP_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/${pkgID}/detail`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function updateWrapDetail(pkgID, body, callback) {
  return dispatch => dispatch(editWrapDetail(pkgID, body, callback))
}

export const PASS_WRAP_PUBLISH_REQUEST = 'PASS_WRAP_PUBLISH_REQUEST'
export const PASS_WRAP_PUBLISH_SUCCESS = 'PASS_WRAP_PUBLISH_SUCCESS'
export const PASS_WRAP_PUBLISH_FAILURE = 'PASS_WRAP_PUBLISH_FAILURE'

function fetchPassWrapPublish(id, body, callback) {
  return {
    [FETCH_API]: {
      types: [PASS_WRAP_PUBLISH_REQUEST,PASS_WRAP_PUBLISH_SUCCESS,PASS_WRAP_PUBLISH_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/publish/${id}/pass`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function passWrapPublish(id, body, callback) {
  return dispatch => dispatch(fetchPassWrapPublish(id, body, callback))
}

export const REFUSE_WRAP_PUBLISH_REQUEST = 'REFUSE_WRAP_PUBLISH_REQUEST'
export const REFUSE_WRAP_PUBLISH_SUCCESS = 'REFUSE_WRAP_PUBLISH_SUCCESS'
export const REFUSE_WRAP_PUBLISH_FAILURE = 'REFUSE_WRAP_PUBLISH_FAILURE'

function fetchRefuseWrapPublish(id, body, callback) {
  return {
    [FETCH_API]: {
      types: [REFUSE_WRAP_PUBLISH_REQUEST,REFUSE_WRAP_PUBLISH_SUCCESS,REFUSE_WRAP_PUBLISH_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/publish/${id}/refuse`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function refuseWrapPublish(id, body, callback) {
  return dispatch => dispatch(fetchRefuseWrapPublish(id, body, callback))
}

export const OFFSHELF_WRAP_REQUEST = 'OFFSHELF_WRAP_REQUEST'
export const OFFSHELF_WRAP_SUCCESS = 'OFFSHELF_WRAP_SUCCESS'
export const OFFSHELF_WRAP_FAILURE = 'OFFSHELF_WRAP_FAILURE'

function fetchOffShelfWrap(id, body, callback) {
  return {
    [FETCH_API]: {
      types: [OFFSHELF_WRAP_REQUEST,OFFSHELF_WRAP_SUCCESS,OFFSHELF_WRAP_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/store/${id}/status`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function offShelfWrap(id, body, callback) {
  return dispatch => dispatch(fetchOffShelfWrap(id, body, callback))
}

export const GET_WRAP_PUBLISH_LIST_REQUEST = 'GET_WRAP_PUBLISH_LIST_REQUEST'
export const GET_WRAP_PUBLISH_LIST_SUCCESS = 'GET_WRAP_PUBLISH_LIST_SUCCESS'
export const GET_WRAP_PUBLISH_LIST_FAILURE = 'GET_WRAP_PUBLISH_LIST_FAILURE'

function fetchWrapPublishList(query,callback) {
  let endpointUrl = `${API_URL_PREFIX}/pkg/publish`
  if (query) {
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_WRAP_PUBLISH_LIST_REQUEST, GET_WRAP_PUBLISH_LIST_SUCCESS, GET_WRAP_PUBLISH_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export function getWrapPublishList(query, callback) {
  return dispatch => dispatch(fetchWrapPublishList(query, callback))
}

export const GET_WRAP_STORE_LIST_REQUEST = 'GET_WRAP_STORE_LIST_REQUEST'
export const GET_WRAP_STORE_LIST_SUCCESS = 'GET_WRAP_STORE_LIST_SUCCESS'
export const GET_WRAP_STORE_LIST_FAILURE = 'GET_WRAP_STORE_LIST_FAILURE'

function fetchWrapStoreList(query,callback) {
  let endpointUrl = `${API_URL_PREFIX}/pkg/store`
  if (query) {
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_WRAP_STORE_LIST_REQUEST, GET_WRAP_STORE_LIST_SUCCESS, GET_WRAP_STORE_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export function getWrapStoreList(query, callback) {
  return dispatch => dispatch(fetchWrapStoreList(query, callback))
}

export const GET_WRAP_STORE_HOT_LIST_REQUEST = 'GET_WRAP_STORE_HOT_LIST_REQUEST'
export const GET_WRAP_STORE_HOT_LIST_SUCCESS = 'GET_WRAP_STORE_HOT_LIST_SUCCESS'
export const GET_WRAP_STORE_HOT_LIST_FAILURE = 'GET_WRAP_STORE_HOT_LIST_FAILURE'

function fetchWrapStoreHotList(callback) {
  let endpointUrl = `${API_URL_PREFIX}/pkg/store`
  let query = {
    from: 0,
    size: 10,
    sort_by: 'download_times',
    sort_order: 'desc'
  }
  if (query) {
    endpointUrl += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_WRAP_STORE_HOT_LIST_REQUEST, GET_WRAP_STORE_HOT_LIST_SUCCESS, GET_WRAP_STORE_HOT_LIST_FAILURE],
      endpoint: endpointUrl,
      schema: Schemas.REGISTRYS,
    },
    callback
  }
}

export function getWrapStoreHotList(callback) {
  return dispatch => dispatch(fetchWrapStoreHotList(callback))
}

export const GET_WRAP_GROUP_LIST_REQUEST ='GET_WRAP_GROUP_LIST_REQUEST'
export const GET_WRAP_GROUP_LIST_SUCCESS ='GET_WRAP_GROUP_LIST_SUCCESS'
export const GET_WRAP_GROUP_LIST_FAILURE ='GET_WRAP_GROUP_LIST_FAILURE'

function fetchWrapGroupList(callback) {
  return {
    [FETCH_API]: {
      types: [GET_WRAP_GROUP_LIST_REQUEST,GET_WRAP_GROUP_LIST_SUCCESS,GET_WRAP_GROUP_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/group`,
      schema: {}
    },
    callback
  }
}

export function getWrapGroupList(callback) {
  return dispatch => dispatch(fetchWrapGroupList(callback))
}


// 修改/删除 镜像商店分类标签
export const PUT_UPDATE_WRAP_GROUP_REQUEST = 'PUT_UPDATE_WRAP_GROUP_REQUEST'
export const PUT_UPDATE_WRAP_GROUP_SUCCESS = 'PUT_UPDATE_WRAP_GROUP_SUCCESS'
export const PUT_UPDATE_WRAP_GROUP_FALIURE = 'PUT_UPDATE_WRAP_GROUP_FALIURE'

function fetchUpdateWrapGroup(body, callback) {
  return {
    [FETCH_API]: {
      types: [
        PUT_UPDATE_WRAP_GROUP_REQUEST,
        PUT_UPDATE_WRAP_GROUP_SUCCESS,
        PUT_UPDATE_WRAP_GROUP_FALIURE,
      ],
      endpoint: `${API_URL_PREFIX}/pkg/group/update`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function updateWrapGroup(body, callback) {
  return dispatch => dispatch(fetchUpdateWrapGroup(body, callback))
}

// 获取镜像分类标签详情
export const GET_WRAP_GROUP_DETAIL_LIST_REQUEST = 'GET_WRAP_GROUP_DETAIL_LIST_REQUEST'
export const GET_WRAP_GROUP_DETAIL_LIST_SUCCESS = 'GET_WRAP_GROUP_DETAIL_LIST_SUCCESS'
export const GET_WRAP_GROUP_DETAIL_LIST_FALIURE = 'GET_WRAP_GROUP_DETAIL_LIST_FALIURE'

function fetchGetWrapGroupDetailList(callback) {
  return {
    [FETCH_API]: {
      types: [
        GET_WRAP_GROUP_DETAIL_LIST_REQUEST,
        GET_WRAP_GROUP_DETAIL_LIST_SUCCESS,
        GET_WRAP_GROUP_DETAIL_LIST_FALIURE,
      ],
      endpoint: `${API_URL_PREFIX}/pkg/group/detail`,
      schema: {},
    },
    callback
  }
}

export function getWrapGroupDetailList(callback) {
  return dispatch => dispatch(fetchGetWrapGroupDetailList(callback))
}

export const DELETE_WRAP_DOCS_REQUEST = 'DELETE_WRAP_DOCS_REQUEST'
export const DELETE_WRAP_DOCS_SUCCESS = 'DELETE_WRAP_DOCS_SUCCESS'
export const DELETE_WRAP_DOCS_FAILURE = 'DELETE_WRAP_DOCS_FAILURE'

function fetchDeleteWrapDocs(id, body, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_WRAP_DOCS_REQUEST,DELETE_WRAP_DOCS_SUCCESS,DELETE_WRAP_DOCS_FAILURE],
      endpoint: `${API_URL_PREFIX}/pkg/${id}/docs/batch-delete`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function deleteWrapDocs(id, body, callback) {
  return dispatch => dispatch(fetchDeleteWrapDocs(id, body, callback))
}

const UPDATE_PACKAGE_REQUEST = 'UPDATE_PACKAGE_REQUEST'
const UPDATE_PACKAGE_SUCCESS = 'UPDATE_PACKAGE_SUCCESS'
const UPDATE_PACKAGE_FAILURE = 'UPDATE_PACKAGE_FAILURE'

function fetchUpdatePkg(id, query, body, callback) {
  return {
    [FETCH_API]: {
      types: [ UPDATE_PACKAGE_REQUEST, UPDATE_PACKAGE_SUCCESS, UPDATE_PACKAGE_FAILURE ],
      endpoint: `${API_URL_PREFIX}/pkg/${id}/remote?${toQuerystring(query)}`,
      schema: Schemas.REGISTRYS,
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  }
}

export function updatePkg(id, query, body, callback) {
  return dispatch => {
    return dispatch(fetchUpdatePkg(id, query, body, callback))
  }
}

// const UPDATE_UPLOAD_PACKAGE_REQUEST = 'UPDATE_UPLOAD_PACKAGE_REQUEST'
// const UPDATE_UPLOAD_PACKAGE_SUCCESS = 'UPDATE_UPLOAD_PACKAGE_SUCCESS'
// const UPDATE_UPLOAD_PACKAGE_FAILURE = 'UPDATE_UPLOAD_PACKAGE_FAILURE'

// function fetchUpdateByLocalPkg(id, query, body, callback) {
//   return {
//     [FETCH_API]: {
//       types: [ UPDATE_UPLOAD_PACKAGE_REQUEST, UPDATE_UPLOAD_PACKAGE_SUCCESS, UPDATE_UPLOAD_PACKAGE_FAILURE ],
//       endpoint: `${API_URL_PREFIX}/pkg/${id}/local?${toQuerystring(query)}`,
//       schema: Schemas.REGISTRYS,
//       options: {
//         method: 'POST',
//         body,
//       },
//     },
//     callback,
//   }
// }

// export function updateByLocalPkg(id, query, body, callback) {
//   return dispatch => {
//     return dispatch(fetchUpdateByLocalPkg(id, query, body, callback))
//   }
// }
