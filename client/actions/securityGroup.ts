/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for SecurityGroup
 *
 * v0.1 - 2018-07-27
 * @author lvjunfeng
 */
import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';

const CREATE_SECURITY_GROUP_REQUEST = 'CREATE_SECURITY_GROUP_REQUEST';
const CREATE_SECURITY_GROUP_SUCCESS = 'CREATE_SECURITY_GROUP_SUCCESS';
const CREATE_SECURITY_GROUP_FAILURE = 'CREATE_SECURITY_GROUP_FAILURE';

const fetchSecurityGroup = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_SECURITY_GROUP_REQUEST,
        CREATE_SECURITY_GROUP_SUCCESS,
        CREATE_SECURITY_GROUP_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createSecurityGroup = (cluster, body, callback) =>
  dispatch => dispatch(fetchSecurityGroup(cluster, body, callback));

export const GET_SECURITY_GROUP_LIST_REQUEST = 'GET_SECURITY_GROUP_LIST_REQUEST';
export const GET_SECURITY_GROUP_LIST_SUCCESS = 'GET_SECURITY_GROUP_LIST_SUCCESS';
export const GET_SECURITY_GROUP_LIST_FAILURE = 'GET_SECURITY_GROUP_LIST_FAILURE';

const fetchSecurityGroupList = (cluster, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_SECURITY_GROUP_LIST_REQUEST,
        GET_SECURITY_GROUP_LIST_SUCCESS,
        GET_SECURITY_GROUP_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy`,
      schema: {},
    },
    callback,
  };
};

export const getSecurityGroupList = (cluster, callback) =>
  dispatch => dispatch(fetchSecurityGroupList(cluster, callback));

const GET_SECURITY_GROUP_DETAIL_REQUEST = 'GET_SECURITY_GROUP_DETAIL_REQUEST';
const GET_SECURITY_GROUP_DETAIL_SUCCESS = 'GET_SECURITY_GROUP_DETAIL_SUCCESS';
const GET_SECURITY_GROUP_DETAIL_FAILURE = 'GET_SECURITY_GROUP_DETAIL_FAILURE';

const fetchSecurityGroupDetail = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_SECURITY_GROUP_DETAIL_REQUEST,
        GET_SECURITY_GROUP_DETAIL_SUCCESS,
        GET_SECURITY_GROUP_DETAIL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy/${name}`,
      schema: {},
    },
    callback,
  };
};

export const getfSecurityGroupDetail = (cluster, name, callback) =>
  dispatch => dispatch(fetchSecurityGroupDetail(cluster, name, callback));

const DELETE_SECURITY_GROUP_REQUEST = 'DELETE_SECURITY_GROUP_REQUEST';
const DELETE_SECURITY_GROUP_SUCCESS = 'DELETE_SECURITY_GROUP_SUCCESS';
const DELETE_SECURITY_GROUP_FAILURE = 'DELETE_SECURITY_GROUP_FAILURE';

const fetchDeleteSecurityGroup = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_SECURITY_GROUP_REQUEST,
        DELETE_SECURITY_GROUP_SUCCESS,
        DELETE_SECURITY_GROUP_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy/${name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteSecurityGroup = (cluster, name, callback) =>
  dispatch => dispatch(fetchDeleteSecurityGroup(cluster, name, callback));

const UPDATE_SECURITY_GROUP_REQUEST = 'UPDATE_SECURITY_GROUP_REQUEST';
const UPDATE_SECURITY_GROUP_SUCCESS = 'UPDATE_SECURITY_GROUP_SUCCESS';
const UPDATE_SECURITY_GROUP_FAILURE = 'UPDATE_SECURITY_GROUP_FAILURE';

const fetchUpdateSecurityGroup = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_SECURITY_GROUP_REQUEST,
        UPDATE_SECURITY_GROUP_SUCCESS,
        UPDATE_SECURITY_GROUP_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const updateSecurityGroup = (cluster, body, callback) =>
  dispatch => dispatch(fetchUpdateSecurityGroup(cluster, body, callback));
