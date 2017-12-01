/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2017-11-17
 * @author zhangxuan
 */

import * as ActionTypes from '../actions/app_store'

function imageWithStatus(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.APP_IMAGE_STATUS_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.APP_IMAGE_STATUS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
        file_nick_name: action.response.result.fileNickName,
        icon: action.response.result.icon,
        description: action.response.result.description,
        classify_name: action.response.result.classifyName,
        status: action.response.result.status
      })
    case ActionTypes.APP_IMAGE_STATUS_FAILURE:
      return Object.assign({}, defaultState, {
        isFetching: false,
      })
    default:
      return state
  }
}

function imagePublishRecord(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.APP_STORE_LIST_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.APP_STORE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.APP_STORE_LIST_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function imageHotRecord(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.APP_STORE_HOT_LIST_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.APP_STORE_HOT_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.APP_STORE_HOT_LIST_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function imageCheckList(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.APP_STORE_IMAGE_LIST_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.APP_STORE_IMAGE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.APP_STORE_IMAGE_LIST_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default: 
      return state
  }
}

function imageApprovalList(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch(action.type) {
    case ActionTypes.IMAGE_APPROVAL_LIST_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.IMAGE_APPROVAL_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.IMAGE_APPROVAL_LIST_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}
export default function app_store(state = {}, action) {
  return {
    currentImageWithStatus: imageWithStatus(state.currentImageWithStatus, action),
    imagePublishRecord: imagePublishRecord(state.imagePublishRecord, action),
    imageHotRecord: imageHotRecord(state.imageHotRecord, action),
    imageCheckList: imageCheckList(state.imageCheckList, action),
    imageApprovalList: imageApprovalList(state.imageApprovalList, action)
  }
}