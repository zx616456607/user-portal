/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for user 3rd accounts
 * cluster
 * v0.1 - 2017-10-10
 * @author Baiyu
 */

import * as ActionTypes from '../../actions/openstack/lb'

export function cluster(state={}, action) {
  switch (action.type) {
    case ActionTypes.GET_OPENSTACK_CLUSTER_REQUEST:{
      return Object.assign({}, state, {
        isFetching: true
      })
    }
    case ActionTypes.GET_OPENSTACK_CLUSTER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        ...action.response.result
      })
    case ActionTypes.GET_OPENSTACK_CLUSTER_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    case ActionTypes.OPENSTACK_CLEAR_CLUSTER_LIST:
      return {
        isFetching: false
      }
    default:
      return state
  }
}

export function keypairs(state={}, action) {
  switch (action.type) {
    case ActionTypes.GET_OPENSTACK_KEYPAIR_REQUEST:{
      return Object.assign({}, state, {
        isFetching: true
      })
    }
    case ActionTypes.GET_OPENSTACK_KEYPAIR_SUCCESS:
      let keypairs = []
      if (Array.isArray(action.response.result.keypairs)) {
       keypairs = action.response.result.keypairs.map(item => item.keypair)
      }
      return Object.assign({}, state, {
        isFetching: false,
        keypairs
      })
    case ActionTypes.GET_OPENSTACK_KEYPAIR_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    case ActionTypes.OPENSTACK_CLEAR_KEYPAIR_LIST:
      return {}

    default:
      return state
  }
}