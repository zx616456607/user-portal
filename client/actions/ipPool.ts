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


// macvlan
export const GET_MACVLAN_IPPOOLS_REQUEST = 'GET_MACVLAN_IPPOOLS_REQUEST';
export const GET_MACVLAN_IPPOOLS_SUCCESS = 'GET_MACVLAN_IPPOOLS_SUCCESS';
export const GET_MACVLAN_IPPOOLS_FAILURE = 'GET_MACVLAN_IPPOOLS_FAILURE';

const fetchMacvlanIPPool = (cluster, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_MACVLAN_IPPOOLS_REQUEST,
        GET_MACVLAN_IPPOOLS_SUCCESS,
        GET_MACVLAN_IPPOOLS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ippools`,
      schema: {},
    },
    callback,
  };
};

export const getMacvlanIPPool = (cluster, callback) =>
  dispatch => dispatch(fetchMacvlanIPPool(cluster, callback));

const CREATE_MACVLAN_IPPOOL_REQUEST = 'CREATE_MACVLAN_IPPOOL_REQUEST';
const CREATE_MACVLAN_IPPOOL_SUCCESS = 'CREATE_MACVLAN_IPPOOL_SUCCESS';
const CREATE_MACVLAN_IPPOOL_FAILURE = 'CREATE_MACVLAN_IPPOOL_FAILURE';

const fetchCreateIPPool = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_MACVLAN_IPPOOL_REQUEST,
        CREATE_MACVLAN_IPPOOL_SUCCESS,
        CREATE_MACVLAN_IPPOOL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ippools`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createMacvlanIPPool = (cluster, body, callback) =>
  dispatch => dispatch(fetchCreateIPPool(cluster, body, callback))

const DELETE_MACVLAN_IPPOOL_REQUEST = 'DELETE_MACVLAN_IPPOOL_REQUEST';
const DELETE_MACVLAN_IPPOOL_SUCCESS = 'DELETE_MACVLAN_IPPOOL_SUCCESS';
const DELETE_MACVLAN_IPPOOL_FAILURE = 'DELETE_MACVLAN_IPPOOL_FAILURE';

const fetchDeleteMacvlanIPPool = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_MACVLAN_IPPOOL_REQUEST,
        DELETE_MACVLAN_IPPOOL_SUCCESS,
        DELETE_MACVLAN_IPPOOL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ippools/${name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteMacvlanIPPool = (cluster, name, callback) =>
  dispatch => dispatch(fetchDeleteMacvlanIPPool(cluster, name, callback));

// IPAssignment
export const GET_IP_ASSIGNMENT_REQUEST = 'GET_IP_ASSIGNMENT_REQUEST';
export const GET_IP_ASSIGNMENT_SUCCESS = 'GET_IP_ASSIGNMENT_SUCCESS';
export const GET_IP_ASSIGNMENT_FAILURE = 'GET_IP_ASSIGNMENT_FAILURE';

const fetchMacvlanIPAssignment = (cluster, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_IP_ASSIGNMENT_REQUEST,
        GET_IP_ASSIGNMENT_SUCCESS,
        GET_IP_ASSIGNMENT_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ipassignments?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getIPAssignment = (cluster, query, callback) =>
  dispatch => dispatch(fetchMacvlanIPAssignment(cluster, query, callback));

const CREATE_PROJECT_IPPOOL_REQUEST = 'CREATE_PROJECT_IPPOOL_REQUEST';
const CREATE_PROJECT_IPPOOL_SUCCESS = 'CREATE_PROJECT_IPPOOL_SUCCESS';
const CREATE_PROJECT_IPPOOL_FAILURE = 'CREATE_PROJECT_IPPOOL_FAILURE';

const fetchCreateProjectPool = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_PROJECT_IPPOOL_REQUEST,
        CREATE_PROJECT_IPPOOL_SUCCESS,
        CREATE_PROJECT_IPPOOL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ipassignments`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createProjectPool = (cluster, body, callback) =>
  dispatch => dispatch(fetchCreateProjectPool(cluster, body, callback))

const DELETE_PROJECT_POOL_REQUEST = 'DELETE_PROJECT_POOL_REQUEST';
const DELETE_PROJECT_POOL_SUCCESS = 'DELETE_PROJECT_POOL_SUCCESS';
const DELETE_PROJECT_POOL_FAILURE = 'DELETE_PROJECT_POOL_FAILURE';

const fetchDeleteProjectPool = (cluster, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_PROJECT_POOL_REQUEST,
        DELETE_PROJECT_POOL_SUCCESS,
        DELETE_PROJECT_POOL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ipassignments/${name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteProjectPool = (cluster, name, callback) =>
  dispatch => dispatch(fetchDeleteProjectPool(cluster, name, callback));

// ipallocations
export const GET_IP_ALLOCATIONS_REQUEST = 'GET_IP_ALLOCATIONS_REQUEST';
export const GET_IP_ALLOCATIONS_SUCCESS = 'GET_IP_ALLOCATIONS_SUCCESS';
export const GET_IP_ALLOCATIONS_FAILURE = 'GET_IP_ALLOCATIONS_FAILURE';

const fetchMacvlanIPAllocations = (cluster, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_IP_ALLOCATIONS_REQUEST,
        GET_IP_ALLOCATIONS_SUCCESS,
        GET_IP_ALLOCATIONS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ipallocations?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getIPAllocations = (cluster, query, callback) =>
  dispatch => dispatch(fetchMacvlanIPAllocations(cluster, query, callback));

const UPDATE_DEFAULT_ASSIGNMENT_REQUEST = 'UPDATE_DEFAULT_ASSIGNMENT_REQUEST';
const UPDATE_DEFAULT_ASSIGNMENT_SUCCESS = 'UPDATE_DEFAULT_ASSIGNMENT_SUCCESS';
const UPDATE_DEFAULT_ASSIGNMENT_FAILURE = 'UPDATE_DEFAULT_ASSIGNMENT_FAILURE';

const fetchUpdateDefaultAssignment = (cluster, name, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_DEFAULT_ASSIGNMENT_REQUEST,
        UPDATE_DEFAULT_ASSIGNMENT_SUCCESS,
        UPDATE_DEFAULT_ASSIGNMENT_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/networking/macvlan/ipassignments/${name}/default?${toQuerystring(query)}`,
      schema: {},
      options: {
        method: 'PUT',
        // body,
      },
    },
    callback,
  };
};

export const updateDefaultAssignment = (cluster, name, query, callback) =>
  dispatch => dispatch(fetchUpdateDefaultAssignment(cluster, name, query, callback));
