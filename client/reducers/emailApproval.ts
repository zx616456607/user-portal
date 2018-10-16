/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Redux reducers for emailApproval
 *
 * v0.1 - 2018-10-10
 * @author lvjunfeng
 */
import * as ActionTypes from '../actions/emailApprocal';

function getStatus(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_EMAIL_APPROVAL_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.GET_EMAIL_APPROVAL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        approvalStatus: action.response.result,
      });
    case ActionTypes.GET_EMAIL_APPROVAL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

export default function getEmailApproval(state= { }, action) {
  return {
    approvalStatus: getStatus(state.approvalStatus, action),
  };
}
