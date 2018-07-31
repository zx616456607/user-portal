/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for SecurityGroup
 *
 * v0.1 - 2018-07-27
 * @author lvjunfeng
 */
import * as ActionTypes from '../actions/securityGroup';

function getSecurityGroupList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_SECURITY_GROUP_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.GET_SECURITY_GROUP_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      });
    case ActionTypes.GET_SECURITY_GROUP_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

export default function SecurityGroup(state= { }, action) {
  return {
    getSecurityGroupList: getSecurityGroupList(state.getSecurityGroupList, action),
  };
}
