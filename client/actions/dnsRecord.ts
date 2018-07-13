/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for dns
 *
 * v0.1 - 2018-07-10
 * @author lvjunfeng
 */
import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';

const CREATE_DNS_REQUEST = 'CREATE_DNS_REQUEST';
const CREATE_DNS_SUCCESS = 'CREATE_DNS_SUCCESS';
const CREATE_DNS_FAILURE = 'CREATE_DNS_FAILURE';

const fetchServiceDns = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_DNS_REQUEST,
        CREATE_DNS_SUCCESS,
        CREATE_DNS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/endpoints`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createServiceDns = (cluster, body, callback) =>
  dispatch => dispatch(fetchServiceDns(cluster, body, callback));

export const GETDNS_LIST_REQUEST = 'GETDNS_LIST_REQUEST';
export const GETDNS_LIST_SUCCESS = 'GETDNS_LIST_SUCCESS';
export const GETDNS_LIST_FAILURE = 'GETDNS_LIST_FAILURE';

const fetchDnsList = (cluster, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GETDNS_LIST_REQUEST,
        GETDNS_LIST_SUCCESS,
        GETDNS_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/endpoints`,
      schema: {},
    },
    callback,
  };
};

export const getDnsList = (cluster, callback) =>
  dispatch => dispatch(fetchDnsList(cluster, callback));

const GETDNS_DETAIL_REQUEST = 'GETDNS_DETAIL_REQUEST';
const GETDNS_DETAIL_SUCCESS = 'GETDNS_DETAIL_SUCCESS';
const GETDNS_DETAIL_FAILURE = 'GETDNS_DETAIL_FAILURE';

const fetchDnsItemDetail = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GETDNS_DETAIL_REQUEST,
        GETDNS_DETAIL_SUCCESS,
        GETDNS_DETAIL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/endpoints/${name}`,
      schema: {},
    },
    callback,
  };
};

export const getDnsItemDetail = (cluster, name, callback) =>
  dispatch => dispatch(fetchDnsItemDetail(cluster, name, callback));

const DELETE_DNS_REQUEST = 'DELETE_DNS_REQUEST';
const DELETE_DNS_SUCCESS = 'DELETE_DNS_SUCCESS';
const DELETE_DNS_FAILURE = 'DELETE_DNS_FAILURE';

const fetchDeleteDnsItem = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_DNS_REQUEST,
        DELETE_DNS_SUCCESS,
        DELETE_DNS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/endpoints/${name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteDnsItem = (cluster, name, callback) =>
  dispatch => dispatch(fetchDeleteDnsItem(cluster, name, callback));

const CHANGE_DNS_REQUEST = 'CHANGE_DNS_REQUEST';
const CHANGE_DNS_SUCCESS = 'CHANGE_DNS_SUCCESS';
const CHANGE_DNS_FAILURE = 'CHANGE_DNS_FAILURE';

const fetchChangeItem = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CHANGE_DNS_REQUEST,
        CHANGE_DNS_SUCCESS,
        CHANGE_DNS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/endpoints`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const changeDnsItem = (cluster, body, callback) =>
  dispatch => dispatch(fetchChangeItem(cluster, body, callback));
