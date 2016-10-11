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
        [registry]: {isFetching: true}
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
        [registry]: {isFetching: false}
      })
    default:
      return state
  }
}

export function images(state = { publicImages: {} }, action) {
  return {
    publicImages: publicImages(state.publicImages, action),
  }
}