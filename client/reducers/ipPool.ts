/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Redux reducers for IPPool
 *
 * v0.1 - 2018-11-08
 * @author lvjunfeng
 */

import * as ActionTypes from '../actions/ipPool';

function getPoolList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_IPPOOL_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.GET_IPPOOL_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      });
    case ActionTypes.GET_IPPOOL_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

export default function getIPPoolList(state= { }, action) {
  return {
    getIPPoolList: getPoolList(state.getIPPoolList, action),
  };
}
