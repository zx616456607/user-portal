/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Redux reducers for AIOps
 *
 * v0.1 - 2018-06-11
 * @author Zhangpc
 */
import * as ActionTypes from '../actions/aiops';

function modelsets(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_AI_MODELSETS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.GET_AI_MODELSETS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result,
      });
    case ActionTypes.GET_AI_MODELSETS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

export default function aiops(state = { modelsets: {} }, action) {
  return {
    modelsets: modelsets(state.modelsets, action),
  };
}
