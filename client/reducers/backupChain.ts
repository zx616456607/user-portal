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
  GET_BACKUPCHAIN_REQUEST,
  GET_BACKUPCHAIN_SUCCESS,
  GET_BACKUPCHAIN_FAILURE,
} from '../actions/backupChain'

function chains(state = {}, action: any) {
    switch (action.type) {
        case GET_BACKUPCHAIN_REQUEST:
            return {
                isFetching: true,
            }
        case GET_BACKUPCHAIN_SUCCESS:
            const data = action.response.result.database.items
            return {
                isFetching: false,
                data,
            }
        case GET_BACKUPCHAIN_FAILURE:
            return {
                isFetching: false,
            }
        default:
            return state
    }
}

function detail(state = {}, action: object) {
  switch (action.type) {
    case GET_BACKUPCHAIN_DETAIL_REQUEST:
      return {
        isFetching: true,
      }
      case GET_BACKUPCHAIN_DETAIL_SUCCESS:
        const newData = action.payload
        return {
          isFetching: false,
          ...state,
          ...newData,
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
    chains: chains(state.chains, action),
    detail : detail(state.detail, action),
  }
}
