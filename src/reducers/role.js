/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Reducer of role management
 *
 * v0.1 - 2017-07-10
 * @author Zhangcz
 */

import * as ActionTypes from '../actions/role'
import * as ActionTypesPermission from '../actions/permission'
import merge from 'lodash/merge'

function roleList(state = {}, action){
  switch(action.type){
    case ActionTypes.ROLE_LIST_REQUEST:
      return merge({}, state, {
        isFetching: true,
      })
    case ActionTypes.ROLE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data.data
      })
    case ActionTypes.ROLE_LIST_FAILURE:
      return merge({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function roleDetail(state = {}, action){
  let id = action.id
  switch(action.type){
    case ActionTypes.ROLE_GET_REQUEST:
      return merge({}, state, {
        [id]: {
          isFetching: true
        }
      })
    case ActionTypes.ROLE_GET_SUCCESS:
      return merge({}, state, {
        [id]: {
          isFetching: false,
          data: action.response.result.data.data
        }
      })
    case ActionTypes:ROLE_GET_FAILURE:
      return merge({}, state, {
        [id]: {
          isFetching: false
        }
      })
    default:
      return state
  }
}

function permissionList(state = {}, action) {
  switch(action.type){
    case ActionTypesPermission.PERMISSION_LIST_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypesPermission.PERMISSION_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data.data
      })
    case ActionTypesPermission.PERMISSION_LIST_FAILURE:
      return merge({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

export default function role(state = { roleList: {} }, action) {
  return {
    roleList: roleList(state.roleList, action),
    roleDetail: roleDetail(state.roleDetail, action),
    permissionList: permissionList(state.permissionList, action)
  }
}