/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for app detail topology
 *
 * v0.1 - 2018-08-14
 * @author lvjunfeng
 */
import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';

const GET_TOPOLOGY_POD_REQUEST = 'GET_TOPOLOGY_POD_REQUEST';
const GET_TOPOLOGY_POD_SUCCESS = 'GET_TOPOLOGY_POD_SUCCESS';
const GET_TOPOLOGY_POD_FAILURE = 'GET_TOPOLOGY_POD_FAILURE';

const fetchTopologyList = (cluster, appname, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_TOPOLOGY_POD_REQUEST,
        GET_TOPOLOGY_POD_SUCCESS,
        GET_TOPOLOGY_POD_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appname}/topology-pods`,
      schema: {},
    },
    callback,
  };
};

export const getTopologyPodList = (cluster, appname, callback) =>
  dispatch => dispatch(fetchTopologyList(cluster, appname, callback));

// CID-88553dfba3c8/apps/ddd/topology-services?1534217977691
const GET_TOPOLOGY_SERVICE_REQUEST = 'GET_TOPOLOGY_SERVICE_REQUEST';
const GET_TOPOLOGY_SERVICE_SUCCESS = 'GET_TOPOLOGY_SERVICE_SUCCESS';
const GET_TOPOLOGY_SERVICE_FAILURE = 'GET_TOPOLOGY_SERVICE_FAILURE';

const fetchTopologyServiceList = (cluster, appname, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_TOPOLOGY_SERVICE_REQUEST,
        GET_TOPOLOGY_SERVICE_SUCCESS,
        GET_TOPOLOGY_SERVICE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appname}/topology-services`,
      schema: {},
    },
    callback,
  };
};

export const getTopologyServiceList = (cluster, appname, callback) =>
  dispatch => dispatch(fetchTopologyServiceList(cluster, appname, callback))
