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
import { formatMonitorName } from '../common/tools'

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
        data: action.response.result.data,
        total: action.response.result.total
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

function serviceLoadBalances(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_SERVICE_LOADBALANCE_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_SERVICE_LOADBALANCE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.GET_SERVICE_LOADBALANCE_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function tcpUdpIngress(state = {}, action) {
  const { type, ingressType } = action
  switch (type) {
    case ActionTypes.GET_TCP_UDP_INGRESS_REQUEST:
      return {
        ...state,
        [ingressType]: Object.assign({}, state[ingressType], {
          isFetching: false,
          data: [],
        })
      }
    case ActionTypes.GET_TCP_UDP_INGRESS_SUCCESS:
      return {
        ...state,
        [ingressType]: Object.assign({}, state[ingressType], {
          isFetching: false,
          data: action.response.result.data,
        })
      }
    case ActionTypes.GET_TCP_UDP_INGRESS_FAILURE:
      return {
        ...state,
        [ingressType]: Object.assign({}, state[ingressType], {
          isFetching: false,
          data: [],
        })
      }
    default:
      return state
  }
}

function loadbalancePermission(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CHECK_LB_PERMISSION_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.CHECK_LB_PERMISSION_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.CHECK_LB_PERMISSION_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

function loadMonitorData(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_MONITOR_DATA_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes.GET_MONITOR_DATA_SUCCESS:
    const type = action.query && action.query.type
    const name = action.query && action.query.name
      return Object.assign({}, state, {
        isFetching: false,
        monitor: {
          ...state.monitor,
          [type]:{
            data: formatMonitorName(action.response.result.data, name),
            isFetching: false,
          }
        },
      })
    case ActionTypes.GET_MONITOR_DATA_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
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
    loadBalanceDetail: loadBalanceDetail(state.loadBalanceDetail, action),
    serviceLoadBalances: serviceLoadBalances(state.serviceLoadBalances, action),
    tcpUdpIngress: tcpUdpIngress(state.tcpUdpIngress, action),
    loadbalancePermission: loadbalancePermission(state.loadbalancePermission, action),
    monitorData: loadMonitorData(state.monitorData, action),
  }
}
