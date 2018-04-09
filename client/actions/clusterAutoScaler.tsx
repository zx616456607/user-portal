/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for template
 *
 * v0.1 - 2018-04-08
 * @author rensiwei
 */

import { FETCH_API, Schemas } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools';

export const CREATE_APP_SERVER_REQUEST = 'CREATE_APP_SERVER_REQUEST';
export const CREATE_APP_SERVER_SUCCESS = 'CREATE_APP_SERVER_SUCCESS';
export const CREATE_APP_SERVER_FAILURE = 'CREATE_APP_SERVER_FAILURE';

const fetchCreateServer = (clusterID, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_SERVER_REQUEST,
        CREATE_APP_SERVER_SUCCESS,
        CREATE_APP_SERVER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/clusters/${clusterID}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const createServer = (clusterID: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateServer(clusterID, body, callback));

export const APP_SERVER_LIST_REQUEST = 'APP_SERVER_LIST_REQUEST';
export const APP_SERVER_LIST_SUCCESS = 'APP_SERVER_LIST_SUCCESS';
export const APP_SERVER_LIST_FAILURE = 'APP_SERVER_LIST_FAILURE';

const fetchServerList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_SERVER_LIST_REQUEST,
        APP_SERVER_LIST_SUCCESS,
        APP_SERVER_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/autoscaler/server?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getServerList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchServerList(query, callback));

export const DELETE_APP_SERVER_REQUEST = 'DELETE_APP_SERVER_REQUEST';
export const DELETE_APP_SERVER_SUCCESS = 'DELETE_APP_SERVER_SUCCESS';
export const DELETE_APP_SERVER_FAILURE = 'DELETE_APP_SERVER_FAILURE';

const fetchDeleteServer = (name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_APP_SERVER_REQUEST,
        DELETE_APP_SERVER_SUCCESS,
        DELETE_APP_SERVER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/${name}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteServer = (name: string, callback?: function) =>
  dispatch => dispatch(fetchDeleteServer(name, callback));

export const UPDATE_APP_SERVER_REQUEST = 'UPDATE_APP_SERVER_REQUEST';
export const UPDATE_APP_SERVER_SUCCESS = 'UPDATE_APP_SERVER_SUCCESS';
export const UPDATE_APP_SERVER_FAILURE = 'UPDATE_APP_SERVER_FAILURE';

const fetchUpdateServer = (clusterID, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_APP_SERVER_REQUEST,
        UPDATE_APP_SERVER_SUCCESS,
        UPDATE_APP_SERVER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const updateServer = (clusterID: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchUpdateServer(clusterID, body, callback));

export const APP_CLUSTER_LIST_REQUEST = 'APP_CLUSTER_LIST_REQUEST';
export const APP_CLUSTER_LIST_SUCCESS = 'APP_CLUSTER_LIST_SUCCESS';
export const APP_CLUSTER_LIST_FAILURE = 'APP_CLUSTER_LIST_FAILURE';

const fetchClusterList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_CLUSTER_LIST_REQUEST,
        APP_CLUSTER_LIST_SUCCESS,
        APP_CLUSTER_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/autoscaler/cluster?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getClusterList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchClusterList(query, callback));

// todo
// export const setOpenKeys = (state) => {
//   return {
//     type: 'SET_OPENKEYS',
//     state
//   }
// }
// export const APP_SERVER_DETAIL_REQUEST = 'APP_SERVER_DETAIL_REQUEST';
// export const APP_SERVER_DETAIL_SUCCESS = 'APP_SERVER_DETAIL_SUCCESS';
// export const APP_SERVER_DETAIL_FAILURE = 'APP_SERVER_DETAIL_FAILURE';

// const fetchAppTemplateDetail = (name, callback) => {
//   return {
//     [FETCH_API]: {
//       types: [
//         APP_SERVER_DETAIL_REQUEST,
//         APP_SERVER_DETAIL_SUCCESS,
//         APP_SERVER_DETAIL_FAILURE,
//       ],
//       endpoint: `${API_URL_PREFIX}/templates/helm/${name}`,
//       schema: {},
//     },
//     callback,
//   };
// };

// export const getAppTemplateDetail = (name: string, callback?: function) =>
//   dispatch => dispatch(fetchAppTemplateDetail(name, callback));

// export const APP_SERVER_DEPLOY_CHECK_REQUEST = 'APP_SERVER_DEPLOY_CHECK_REQUEST';
// export const APP_SERVER_DEPLOY_CHECK_SUCCESS = 'APP_SERVER_DEPLOY_CHECK_SUCCESS';
// export const APP_SERVER_DEPLOY_CHECK_FAILURE = 'APP_SERVER_DEPLOY_CHECK_FAILURE';

// const fetchAppTemplateDeployCheck = (cluster, name, body, callback) => {
//   return {
//     [FETCH_API]: {
//       types: [
//         APP_SERVER_DEPLOY_CHECK_REQUEST,
//         APP_SERVER_DEPLOY_CHECK_SUCCESS,
//         APP_SERVER_DEPLOY_CHECK_FAILURE,
//       ],
//     },
//     callback,
//   };
// };

// export const appTemplateDeployCheck = (cluster: string, name: string, body: object, callback?: function) =>
//   dispatch => dispatch(fetchAppTemplateDeployCheck(cluster, name, body, callback));
