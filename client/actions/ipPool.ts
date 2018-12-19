/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for ippoolconfig
 *
 * v0.1 - 2018-11-09
 * @author lvjunfeng
 */

import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools';

export const GET_IPPOOL_LIST_REQUEST = 'GET_IPPOOL_LIST_REQUEST';
export const GET_IPPOOL_LIST_SUCCESS = 'GET_IPPOOL_LIST_SUCCESS';
export const GET_IPPOOL_LIST_FAILURE = 'GET_IPPOOL_LIST_FAILURE';

const fetchIPPoolList = (cluster, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_IPPOOL_LIST_REQUEST,
        GET_IPPOOL_LIST_SUCCESS,
        GET_IPPOOL_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/pools?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getIPPoolList = (cluster, query, callback) =>
  dispatch => dispatch(fetchIPPoolList(cluster, query, callback));

const CREATE_IPPOOL_REQUEST = 'CREATE_IPPOOL_REQUEST';
const CREATE_IPPOOL_SUCCESS = 'CREATE_IPPOOL_SUCCESS';
const CREATE_IPPOOL_FAILURE = 'CREATE_IPPOOL_FAILURE';

const fetchIPPool = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_IPPOOL_REQUEST,
        CREATE_IPPOOL_SUCCESS,
        CREATE_IPPOOL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/pool`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createIPPool = (cluster, body, callback) =>
  dispatch => dispatch(fetchIPPool(cluster, body, callback));

const DELETE_IPPOOL_REQUEST = 'DELETE_IPPOOL_REQUEST';
const DELETE_IPPOOL_SUCCESS = 'DELETE_IPPOOL_SUCCESS';
const DELETE_IPPOOL_FAILURE = 'DELETE_IPPOOL_FAILURE';

const fetchDeleteIPPool = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_IPPOOL_REQUEST,
        DELETE_IPPOOL_SUCCESS,
        DELETE_IPPOOL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/pool-delete`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const deleteIPPool = (cluster, body, callback) =>
  dispatch => dispatch(fetchDeleteIPPool(cluster, body, callback));

const GET_IPPOOL_EXIST_REQUEST = 'GET_IPPOOL_EXIST_REQUEST';
const GET_IPPOOL_EXIST_SUCCESS = 'GET_IPPOOL_EXIST_SUCCESS';
const GET_IPPOOL_EXIST_FAILURE = 'GET_IPPOOL_EXIST_FAILURE';

const fetchIPPoolExist = (cluster, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_IPPOOL_EXIST_REQUEST,
        GET_IPPOOL_EXIST_SUCCESS,
        GET_IPPOOL_EXIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/is-pool-exist?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getIPPoolExist = (cluster, query, callback) =>
  dispatch => dispatch(fetchIPPoolExist(cluster, query, callback));

const GET_IPPOOL_INUSE_REQUEST = 'GET_IPPOOL_INUSE_REQUEST';
const GET_IPPOOL_INUSE_SUCCESS = 'GET_IPPOOL_INUSE_SUCCESS';
const GET_IPPOOL_INUSE_FAILURE = 'GET_IPPOOL_INUSE_FAILURE';

const fetchIPPoolInUse = (cluster, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_IPPOOL_INUSE_REQUEST,
        GET_IPPOOL_INUSE_SUCCESS,
        GET_IPPOOL_INUSE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/is-pool-in-use?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getIPPoolInUse = (cluster, query, callback) =>
  dispatch => dispatch(fetchIPPoolInUse(cluster, query, callback));
