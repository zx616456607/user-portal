/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * reducers for Backup
 *
 * v0.1 - 2018-07-12
 * @author zhouhaitao
 */
import {
  GET_BACKUPCHAIN_DETAIL_REQUEST,
  GET_BACKUPCHAIN_DETAIL_SUCCESS,
  GET_BACKUPCHAIN_DETAIL_FAILURE,
} from '../actions/backupChain'
function detail(state = {}, action: object) {
  switch (action.type) {
    case GET_BACKUPCHAIN_DETAIL_REQUEST:
      return {
        isFetching: true,
      }
    case GET_BACKUPCHAIN_DETAIL_SUCCESS:
      return {
        isFetching: false,
      }
    case GET_BACKUPCHAIN_DETAIL_FAILURE:
      return {
        isFetching: false,
      }
    default:
      return state
  }
}

export default function backupChain(state = {}, action) {
  return {
    detail : detail(state.detail, action),
  }
}
