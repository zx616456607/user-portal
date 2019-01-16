/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for user 3rd accounts
 *
 * v0.1 - 2017-02-08
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/vm_wrap'
import merge from 'lodash/merge'

function vminfosList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.VM_WRAP_VMINFOS_REQUEST:
      return merge({}, state, {
        isFetching: true,
      })
    case ActionTypes.VM_WRAP_VMINFOS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        list: action.response.result.results,
        total: action.response.result.count,
      })
    case ActionTypes.VM_WRAP_VMINFOS_FAILURE:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

export default function vmWrap(state = { vminfosList: {} }, action) {
  return {
    vminfosList: vminfosList(state.vminfosList, action),
  }
}
