/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app template
 *
 * v0.1 - 2018-04-09
 * @author rsw
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
function getClusterList(state = {}, action) {
  let res = null;
  switch (action.type) {
    case ActionTypes.APP_CLUSTER_LIST_REQUEST:
      res = Object.assign({}, state, {
        isFetching: true,
      });
      return res;
    case ActionTypes.APP_CLUSTER_LIST_SUCCESS:
      res = Object.assign({}, state, {
        isFetching: false,
        clusterList: action.response.result.data,
      });
      return res;
    case ActionTypes.APP_CLUSTER_LIST_FAILURE:
      res = Object.assign({}, state, {
        isFetching: false,
      });
      return res;
    default:
      return state;
  }
}
function getNewCluster(state = {}, action) {
  // todo
  let res = null;
  switch (action.type) {
    case ActionTypes.APP_CLUSTER_LIST_REQUEST:
      res = Object.assign({}, state, {
        isFetching: true,
      });
      return res;
    case ActionTypes.APP_CLUSTER_LIST_SUCCESS:
      res = Object.assign({}, state, {
        isFetching: false,
        clusterList: action.response.result.data,
      });
      return res;
    case ActionTypes.APP_CLUSTER_LIST_FAILURE:
      res = Object.assign({}, state, {
        isFetching: false,
      });
      return res;
    default:
      return state;
  }
}

export default function appAutoScaler(state = {}, action) {
  return {
    getServerList: getServerList(state.getServerList, action),
    getClusterList: getClusterList(state.getClusterList, action),
    getNewCluster: getNewCluster(state.getNewCluster, action),
  };
}
