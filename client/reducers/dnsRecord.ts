/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Redux reducers for DNS Record
 *
 * v0.1 - 2018-07-10
 * @author lvjunfeng
 */
import * as ActionTypes from '../actions/dnsRecord';

function getList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GETDNS_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.GETDNS_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result,
      });
    case ActionTypes.GETDNS_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

export default function getDnsList(state= { }, action) {
  return {
    getList: getList(state.getList, action),
  };
}
