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
import isEmpty from 'lodash/isEmpty';

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

function templateDetail(state = {}, action) {
  switch (action.type) {
    case ActionTypes.APP_TEMPLATE_DETAIL_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.APP_TEMPLATE_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      });
    case ActionTypes.APP_TEMPLATE_DETAIL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

function formatDeployCheck(data) {
  if (isEmpty(data)) {
    return;
  }
  const newData = [];
  for (let [key, value] of Object.entries(data)) {
    newData.push({
      name: key,
      content: value,
    });
  }
  return newData;
}

function templateDeployCheck(state = {}, action) {
  switch (action.type) {
    case ActionTypes.APP_TEMPLATE_DEPLOY_CHECK_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.APP_TEMPLATE_DEPLOY_CHECK_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: formatDeployCheck(action.response.result.data),
      });
    case ActionTypes.APP_TEMPLATE_DEPLOY_CHECK_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case ActionTypes.REMOVE_APP_TEMPLATE_DEPLOY_CHECK:
      return {};
    default:
      return state;
  }
}

function chartRepoConfig(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CHART_REPO_IS_PREPARE_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.CHART_REPO_IS_PREPARE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      })
    case ActionTypes.CHART_REPO_IS_PREPARE_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      })
    default:
      return state
  }
}

export default function appTemplates(state = {}, action) {
  return {
    templates: templates(state.templates, action),
    templateDetail: templateDetail(state.templateDetail, action),
    templateDeployCheck: templateDeployCheck(state.templateDeployCheck, action),
    chartRepoConfig: chartRepoConfig(state.chartRepoConfig, action),
  };
}
