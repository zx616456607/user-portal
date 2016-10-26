/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app center
 *
 * v0.1 - 2016-10-10
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/app_center'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import { cloneDeep } from 'lodash'


function publicImages(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageList: []
    }
  }
  switch (action.type) {
    case ActionTypes.IMAGE_PUBLIC_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.IMAGE_PUBLIC_LIST_SUCCESS:
      return merge({}, state, {
        [registry]: {
          isFetching: false,
          registry: action.response.result.registry,
          server: action.response.result.server,
          imageList: action.response.result.data || []
        }
      })
    case ActionTypes.IMAGE_PUBLIC_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    case ActionTypes.SET_IMAGE_STORE_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.SET_IMAGE_STORE_SUCCESS:
      // return Object.assign({}, state, {
      //   [registry]: {
      //     isFetching: false,
      //     registry: action.response.result.registry,
      //     imageInfo: action.response.result 
      //   }
      // })
      const oldState = cloneDeep(state)
      const fullName = action.name
      
      return state
    case ActionTypes.SET_IMAGE_STORE_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

function privateImages(state ={}, action) {
  const defaultState = {
      isFetching: false,
      imageList: []
  }
  switch (action.type) {
    case ActionTypes.IMAGE_PRIVATE_LIST_REQUEST:
      return merge({}, defaultState, state, {
         isFetching: true
      })
    case ActionTypes.IMAGE_PRIVATE_LIST_SUCCESS:
      return merge({}, state, {
          isFetching: false,
          imageList: action.response.result.data || []
      })
    case ActionTypes.IMAGE_PRIVATE_LIST_FAILURE:
      return merge({}, defaultState, state, {
         isFetching: false 
      })
    default:
      return state
  }
}

function deleteImage(state= {}, action) {
  switch (action.type) {
    case ActionTypes.DELETE_PRIVATE_IMAGE_REQUEST:
      return merge({}, state, {
         isFetching: true
      })
    case ActionTypes.DELETE_PRIVATE_IMAGE_SUCCESS:
      // return merge({}, state, {
      //     isFetching: false,
      //     imageList: action.response.result.data
      // })
      const oldState = cloneDeep(state)
      const Id = action.Id
      const imageList = action.imageList
      for (let i=0; i < imageList.length; i++) {
        if (imageList[i].id == Id) {
          imageList.splice(i,1)
        }
      }
      return oldState
    case ActionTypes.DELETE_PRIVATE_IMAGE_FAILURE:
      return merge({}, state, {
         isFetching: false 
      })
    default:
      return state
  }
}

export function images(state = { publicImages: {} }, action) {
  return {
    publicImages: publicImages(state.publicImages, action),
    privateImages:privateImages(state.privateImages, action),
    imagesInfo: imagesInfo(state.imagesInfo, action),
    deleteImage: deleteImage(state.deleteImage, action),
  }
}
//get image detail tag
function imageTag(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageList: []
    }
  }

  switch (action.type) {
    case ActionTypes.IMAGE_GET_DETAILTAG_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.IMAGE_GET_DETAILTAG_SUCCESS:
      const LATEST = 'latest'
      let data = merge([], action.response.result.data)
      const latestTagIndex = data.indexOf(LATEST)
      if (latestTagIndex > -1) {
        data.splice(latestTagIndex)
        data = ([LATEST]).concat(data)
      }
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          registry: action.response.result.registry,
          server: action.response.result.server,
          tag: data
        }
      })
    case ActionTypes.IMAGE_GET_DETAILTAG_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

export function getImageTag(state = { publicImages: {} }, action) {
  return {
    imageTag: imageTag(state.imageTag, action),
  }
}

//get iamge detail tag config
function imageTagConfig(state = {}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageList: []
    }
  }

  switch (action.type) {
    case ActionTypes.IMAGE_GET_DETAILTAGCONFIG_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.IMAGE_GET_DETAILTAGCONFIG_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          registry: action.response.result.registry,
          server: action.response.result.server,
          tag: action.response.result.tag || [],
          configList: action.response.result.data || []
        }
      })
    case ActionTypes.IMAGE_GET_DETAILTAGCONFIG_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}

export function getImageTagConfig(state = { publicImages: {} }, action) {
  return {
    imageTagConfig: imageTagConfig(state.imageTagConfig, action),
  }
}

function imagesInfo(state={}, action){
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageInfo: {dockerfile:''}
    }
  }
  switch (action.type) {
    case ActionTypes.GET_IMAGEINFO_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.GET_IMAGEINFO_SUCCESS:
      return Object.assign({}, state, {
        [registry]: {
          isFetching: false,
          registry: action.response.result.registry,
          imageInfo: action.response.result.data || null
        }
      })
    case ActionTypes.GET_IMAGEINFO_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}


function imageStore(state={}, action) {
  const registry = action.registry
  const defaultState = {
    [registry]: {
      isFetching: false,
      registry,
      imageInfo: {isFavourite: 0}
    }
  }
  switch (action.type) {
    case ActionTypes.SET_IMAGE_STORE_REQUEST:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: true }
      })
    case ActionTypes.SET_IMAGE_STORE_SUCCESS:
      // return Object.assign({}, state, {
      //   [registry]: {
      //     isFetching: false,
      //     registry: action.response.result.registry,
      //     imageInfo: action.response.result 
      //   }
      // })
      return state
    case ActionTypes.SET_IMAGE_STORE_FAILURE:
      return merge({}, defaultState, state, {
        [registry]: { isFetching: false }
      })
    default:
      return state
  }
}