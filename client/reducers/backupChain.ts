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

function chains(state = {}, action:object) {
    switch (action.type) {
        case GET_BACKUPCHAIN_REQUEST:
            return {
                isFetching: true,
            }
        case GET_BACKUPCHAIN_SUCCESS:
            const data = [
                    {
                        name: 'xxx备份链',
                        id: 1,
                        capacity: '100GB',
                        pointNum: 3,
                        creattTime: '2018-07-11T17:34:54+08:00',
                    },
                    {
                        name: 'fdsfds备份链',
                        id: 2,
                        capacity: '100GB',
                        pointNum: 6,
                        creattTime: '2018-07-11T17:34:54+08:00',
                    },
                ]
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
        return {
        isFetching: false,
          ...state,
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
