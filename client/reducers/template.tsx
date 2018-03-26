/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app template
 *
 * v0.1 - 2018-03-22
 * @author zhangxuan
 */

import * as ActionTypes from '../actions/template';

function templates(state = {}, action) {
  switch (action.type) {
    case ActionTypes.APP_TEMPLATE_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.APP_TEMPLATE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      });
    case ActionTypes.APP_TEMPLATE_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

export default function appTemplates(state = {}, action) {
  return {
    templates: templates(state.templates, action),
  };
}
