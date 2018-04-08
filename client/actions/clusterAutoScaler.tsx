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

export const CREATE_APP_AUTOSCALER_REQUEST = 'CREATE_APP_AUTOSCALER_REQUEST';
export const CREATE_APP_AUTOSCALER_SUCCESS = 'CREATE_APP_AUTOSCALER_SUCCESS';
export const CREATE_APP_AUTOSCALER_FAILURE = 'CREATE_APP_AUTOSCALER_FAILURE';

const fetchCreateAutoScaler = (clusterID, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_AUTOSCALER_REQUEST,
        CREATE_APP_AUTOSCALER_SUCCESS,
        CREATE_APP_AUTOSCALER_FAILURE,
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

export const createAutoScaler = (clusterID: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateAutoScaler(clusterID, body, callback));

export const APP_AUTOSCALER_LIST_REQUEST = 'APP_AUTOSCALER_LIST_REQUEST';
export const APP_AUTOSCALER_LIST_SUCCESS = 'APP_AUTOSCALER_LIST_SUCCESS';
export const APP_AUTOSCALER_LIST_FAILURE = 'APP_AUTOSCALER_LIST_FAILURE';

const fetchAutoScalerList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_AUTOSCALER_LIST_REQUEST,
        APP_AUTOSCALER_LIST_SUCCESS,
        APP_AUTOSCALER_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/autoscaler/server?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getAutoScalerList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchAutoScalerList(query, callback));

export const DELETE_APP_AUTOSCALER_REQUEST = 'DELETE_APP_AUTOSCALER_REQUEST';
export const DELETE_APP_AUTOSCALER_SUCCESS = 'DELETE_APP_AUTOSCALER_SUCCESS';
export const DELETE_APP_AUTOSCALER_FAILURE = 'DELETE_APP_AUTOSCALER_FAILURE';

const fetchDeleteAutoScaler = (name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_APP_AUTOSCALER_REQUEST,
        DELETE_APP_AUTOSCALER_SUCCESS,
        DELETE_APP_AUTOSCALER_FAILURE,
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

export const deleteAutoScaler = (name: string, callback?: function) =>
  dispatch => dispatch(fetchDeleteAutoScaler(name, callback));

export const UPDATE_APP_AUTOSCALER_REQUEST = 'UPDATE_APP_AUTOSCALER_REQUEST';
export const UPDATE_APP_AUTOSCALER_SUCCESS = 'UPDATE_APP_AUTOSCALER_SUCCESS';
export const UPDATE_APP_AUTOSCALER_FAILURE = 'UPDATE_APP_AUTOSCALER_FAILURE';

const fetchUpdateAutoScaler = (clusterID, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_APP_AUTOSCALER_REQUEST,
        UPDATE_APP_AUTOSCALER_SUCCESS,
        UPDATE_APP_AUTOSCALER_FAILURE,
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

export const updateAutoScaler = (clusterID: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchUpdateAutoScaler(clusterID, body, callback));

// export const APP_AUTOSCALER_DETAIL_REQUEST = 'APP_AUTOSCALER_DETAIL_REQUEST';
// export const APP_AUTOSCALER_DETAIL_SUCCESS = 'APP_AUTOSCALER_DETAIL_SUCCESS';
// export const APP_AUTOSCALER_DETAIL_FAILURE = 'APP_AUTOSCALER_DETAIL_FAILURE';

// const fetchAppTemplateDetail = (name, callback) => {
//   return {
//     [FETCH_API]: {
//       types: [
//         APP_AUTOSCALER_DETAIL_REQUEST,
//         APP_AUTOSCALER_DETAIL_SUCCESS,
//         APP_AUTOSCALER_DETAIL_FAILURE,
//       ],
//       endpoint: `${API_URL_PREFIX}/templates/helm/${name}`,
//       schema: {},
//     },
//     callback,
//   };
// };

// export const getAppTemplateDetail = (name: string, callback?: function) =>
//   dispatch => dispatch(fetchAppTemplateDetail(name, callback));

// export const APP_AUTOSCALER_DEPLOY_CHECK_REQUEST = 'APP_AUTOSCALER_DEPLOY_CHECK_REQUEST';
// export const APP_AUTOSCALER_DEPLOY_CHECK_SUCCESS = 'APP_AUTOSCALER_DEPLOY_CHECK_SUCCESS';
// export const APP_AUTOSCALER_DEPLOY_CHECK_FAILURE = 'APP_AUTOSCALER_DEPLOY_CHECK_FAILURE';

// const fetchAppTemplateDeployCheck = (cluster, name, body, callback) => {
//   return {
//     [FETCH_API]: {
//       types: [
//         APP_AUTOSCALER_DEPLOY_CHECK_REQUEST,
//         APP_AUTOSCALER_DEPLOY_CHECK_SUCCESS,
//         APP_AUTOSCALER_DEPLOY_CHECK_FAILURE,
//       ],
//     },
//     callback,
//   };
// };

// export const appTemplateDeployCheck = (cluster: string, name: string, body: object, callback?: function) =>
//   dispatch => dispatch(fetchAppTemplateDeployCheck(cluster, name, body, callback));
