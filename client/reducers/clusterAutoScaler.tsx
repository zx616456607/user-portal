/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for clusterAutoScaler
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */

import * as ActionTypes from '../actions/clusterAutoScaler';

function getServerList(state = {}, action) {
  let res = null;
  switch (action.type) {
    case ActionTypes.APP_SERVER_LIST_REQUEST:
      res = Object.assign({}, state, {
        isFetching: true,
      });
      return res;
    case ActionTypes.APP_SERVER_LIST_SUCCESS:
      res = Object.assign({}, state, {
        isFetching: false,
        serverList: action.response.result.data,
      });
      return res;
    case ActionTypes.APP_SERVER_LIST_FAILURE:
      res = Object.assign({}, state, {
        isFetching: false,
      });
      return res;
    default:
      return state;
  }
}
function getAutoScalerClusterList(state = {}, action) {
  let res = null;
  switch (action.type) {
    case ActionTypes.APP_CLUSTER_LIST_REQUEST:
      res = Object.assign({}, state, {
        isModalFetching: true,
      });
      return res;
    case ActionTypes.APP_CLUSTER_LIST_SUCCESS:
      res = Object.assign({}, state, {
        isModalFetching: false,
        clusterList: action.response.result.data,
      });
      return res;
    case ActionTypes.APP_CLUSTER_LIST_FAILURE:
      res = Object.assign({}, state, {
        isModalFetching: false,
      });
      return res;
    default:
      return state;
  }
}

function getAppList(state = {}, action) {
  let res = null;
  switch (action.type) {
    case ActionTypes.APP_AUTOSCALERAPP_LIST_REQUEST:
      res = Object.assign({}, state, {
        isTab1Fetching: true,
      });
      return res;
    case ActionTypes.APP_AUTOSCALERAPP_LIST_SUCCESS:
      res = Object.assign({}, state, {
        isTab1Fetching: false,
        appList: action.response.result.data,
      });
      return res;
    case ActionTypes.APP_AUTOSCALERAPP_LIST_FAILURE:
      res = Object.assign({}, state, {
        isTab1Fetching: false,
      });
      return res;
    default:
      return state;
  }
}

function getLogList(state = {}, action) {
  let res = null;
  switch (action.type) {
    case ActionTypes.APP_AUTOSCALERLOG_LIST_REQUEST:
      res = Object.assign({}, state, {
        isLogFetching: true,
      });
      return res;
    case ActionTypes.APP_AUTOSCALERLOG_LIST_SUCCESS:
      res = Object.assign({}, state, {
        isLogFetching: false,
        logList: action.response.result.data,
      });
      return res;
    case ActionTypes.APP_AUTOSCALERLOG_LIST_FAILURE:
      res = Object.assign({}, state, {
        isLogFetching: false,
      });
      return res;
    default:
      return state;
  }
}

function getResList(state = {}, action) {
  let res = null;
  switch (action.type) {
    case ActionTypes.APP_AUTOSCALERRES_LIST_REQUEST:
      res = Object.assign({}, state, {
        isResFetching: true,
      });
      return res;
    case ActionTypes.APP_AUTOSCALERRES_LIST_SUCCESS:
      res = Object.assign({}, state, {
        isResFetching: false,
        resList: action.response.result.data,
      });
      return res;
    case ActionTypes.APP_AUTOSCALERRES_LIST_FAILURE:
      res = Object.assign({}, state, {
        isResFetching: false,
      });
      return res;
    default:
      return state;
  }
}

export default function appAutoScaler(state = {}, action) {
  return {
    getServerList: getServerList(state.getServerList, action),
    getAutoScalerClusterList: getAutoScalerClusterList(state.getAutoScalerClusterList, action),
    getAppList: getAppList(state.getAppList, action),
    getLogList: getLogList(state.getLogList, action),
    getResList: getResList(state.getResList, action),
  };
}
