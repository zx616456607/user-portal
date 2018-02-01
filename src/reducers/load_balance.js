/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for load balance
 *
 * v0.1 - 2018-01-30
 * @author zhangxuan
 */

import * as ActionTypes from '../actions/load_balance'

function loadBalanceIPList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.LOAD_BALANCE_IP_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.LOAD_BALANCE_IP_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        ...action.response.result
      })
    case ActionTypes.LOAD_BALANCE_IP_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function loadBalanceList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.LOAD_BALANCE_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.LOAD_BALANCE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.LOAD_BALANCE_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default: 
      return state
  }
}

function loadBalanceDetail(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_LOAD_BALANCE_DETAIL_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_LOAD_BALANCE_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.GET_LOAD_BALANCE_DETAIL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export default function loadBalance (state = {
  loadBalanceIPList,
  loadBalanceList
}, action) {
  return {
    loadBalanceIPList: loadBalanceIPList(state.loadBalanceIPList, action),
    loadBalanceList: loadBalanceList(state.loadBalanceList, action),
    loadBalanceDetail: loadBalanceDetail(state.loadBalanceDetail, action)
  }
}