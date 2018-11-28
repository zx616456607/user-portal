/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for clusterAutoScaler
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

const fetchCreateServer = (body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_SERVER_REQUEST,
        CREATE_APP_SERVER_SUCCESS,
        CREATE_APP_SERVER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/server`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createServer = (body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateServer(body, callback));

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
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/server?${toQuerystring(query)}`,
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

const fetchDeleteServer = (id, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_APP_SERVER_REQUEST,
        DELETE_APP_SERVER_SUCCESS,
        DELETE_APP_SERVER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/server/${id}?${toQuerystring(query)}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteServer = (id: string, query?: object, callback?: function) =>
  dispatch => dispatch(fetchDeleteServer(id, query, callback));

export const UPDATE_APP_SERVER_REQUEST = 'UPDATE_APP_SERVER_REQUEST';
export const UPDATE_APP_SERVER_SUCCESS = 'UPDATE_APP_SERVER_SUCCESS';
export const UPDATE_APP_SERVER_FAILURE = 'UPDATE_APP_SERVER_FAILURE';

const fetchUpdateServer = (id, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_APP_SERVER_REQUEST,
        UPDATE_APP_SERVER_SUCCESS,
        UPDATE_APP_SERVER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/server/${id}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const updateServer = (id: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchUpdateServer(id, body, callback));

export const APP_CLUSTER_LIST_REQUEST = 'APP_CLUSTER_LIST_REQUEST';
export const APP_CLUSTER_LIST_SUCCESS = 'APP_CLUSTER_LIST_SUCCESS';
export const APP_CLUSTER_LIST_FAILURE = 'APP_CLUSTER_LIST_FAILURE';

const fetchAutoScalerClusterList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_CLUSTER_LIST_REQUEST,
        APP_CLUSTER_LIST_SUCCESS,
        APP_CLUSTER_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/cluster?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getAutoScalerClusterList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchAutoScalerClusterList(query, callback));

export const APP_PROVIDER_STATUS_REQUEST = 'APP_PROVIDER_STATUS_REQUEST';
export const APP_PROVIDER_STATUS_SUCCESS = 'APP_PROVIDER_STATUS_SUCCESS';
export const APP_PROVIDER_STATUS_FAILURE = 'APP_PROVIDER_STATUS_FAILURE';

const fetchProviderStatus = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_PROVIDER_STATUS_REQUEST,
        APP_PROVIDER_STATUS_SUCCESS,
        APP_PROVIDER_STATUS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/providerstatus?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getProviderStatus = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchProviderStatus(query, callback));

export const APP_RESOURCE_NAME_CHECK_REQUEST = 'APP_RESOURCE_NAME_CHECK_REQUEST';
export const APP_RESOURCE_NAME_CHECK_SUCCESS = 'APP_RESOURCE_NAME_CHECK_SUCCESS';
export const APP_RESOURCE_NAME_CHECK_FAILURE = 'APP_RESOURCE_NAME_CHECK_FAILURE';

const fetchCheckServerName = (name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_RESOURCE_NAME_CHECK_REQUEST,
        APP_RESOURCE_NAME_CHECK_SUCCESS,
        APP_RESOURCE_NAME_CHECK_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/${name}`,
      schema: {},
    },
    callback,
  };
};

export const checkServerName = (name?: string, callback?: function) =>
  dispatch => dispatch(fetchCheckServerName(name, callback));

export const APP_AUTOSCALERAPP_LIST_REQUEST = 'APP_AUTOSCALERAPP_LIST_REQUEST';
export const APP_AUTOSCALERAPP_LIST_SUCCESS = 'APP_AUTOSCALERAPP_LIST_SUCCESS';
export const APP_AUTOSCALERAPP_LIST_FAILURE = 'APP_AUTOSCALERAPP_LIST_FAILURE';

const fetchAutoScalerAppList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_AUTOSCALERAPP_LIST_REQUEST,
        APP_AUTOSCALERAPP_LIST_SUCCESS,
        APP_AUTOSCALERAPP_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/app?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getAutoScalerAppList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchAutoScalerAppList(query, callback));

export const APP_AUTOSCALERLOG_LIST_REQUEST = 'APP_AUTOSCALERLOG_LIST_REQUEST';
export const APP_AUTOSCALERLOG_LIST_SUCCESS = 'APP_AUTOSCALERLOG_LIST_SUCCESS';
export const APP_AUTOSCALERLOG_LIST_FAILURE = 'APP_AUTOSCALERLOG_LIST_FAILURE';

const fetchAutoScalerLogList = (query, callback) => {
    return {
      [FETCH_API]: {
        types: [
          APP_AUTOSCALERLOG_LIST_REQUEST,
          APP_AUTOSCALERLOG_LIST_SUCCESS,
          APP_AUTOSCALERLOG_LIST_FAILURE,
        ],
        endpoint: `${API_URL_PREFIX}/clusters/autoscaler/app/log?${toQuerystring(query)}`,
        schema: {},
      },
      callback,
    };
  };

export const getAutoScalerLogList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchAutoScalerLogList(query, callback));

export const APP_AUTOSCALERRES_LIST_REQUEST = 'APP_AUTOSCALERRES_LIST_REQUEST';
export const APP_AUTOSCALERRES_LIST_SUCCESS = 'APP_AUTOSCALERRES_LIST_SUCCESS';
export const APP_AUTOSCALERRES_LIST_FAILURE = 'APP_AUTOSCALERRES_LIST_FAILURE';

const fetchAutoScalerResList = (id, query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_AUTOSCALERRES_LIST_REQUEST,
        APP_AUTOSCALERRES_LIST_SUCCESS,
        APP_AUTOSCALERRES_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/resource/${id}?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getAutoScalerResList = (id?: string, query?: object, callback?: function) =>
  dispatch => dispatch(fetchAutoScalerResList(id, query, callback));

export const CREATE_APP_AUTOSCALER_REQUEST = 'CREATE_APP_AUTOSCALER_REQUEST';
export const CREATE_APP_AUTOSCALER_SUCCESS = 'CREATE_APP_AUTOSCALER_SUCCESS';
export const CREATE_APP_AUTOSCALER_FAILURE = 'CREATE_APP_AUTOSCALER_FAILURE';

const fetchCreateApp = (body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_AUTOSCALER_REQUEST,
        CREATE_APP_AUTOSCALER_SUCCESS,
        CREATE_APP_AUTOSCALER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/app`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createApp = (body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateApp(body, callback));

export const DELETE_APP_AUTOSCALER_REQUEST = 'DELETE_APP_AUTOSCALER_REQUEST';
export const DELETE_APP_AUTOSCALER_SUCCESS = 'DELETE_APP_AUTOSCALER_SUCCESS';
export const DELETE_APP_AUTOSCALER_FAILURE = 'DELETE_APP_AUTOSCALER_FAILURE';

const fetchDeleteApp = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_APP_AUTOSCALER_REQUEST,
        DELETE_APP_AUTOSCALER_SUCCESS,
        DELETE_APP_AUTOSCALER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/app?${toQuerystring(query)}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteApp = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchDeleteApp(query, callback));

export const UPDATE_APP_AUTOSCALER_REQUEST = 'UPDATE_APP_AUTOSCALER_REQUEST';
export const UPDATE_APP_AUTOSCALER_SUCCESS = 'UPDATE_APP_AUTOSCALER_SUCCESS';
export const UPDATE_APP_AUTOSCALER_FAILURE = 'UPDATE_APP_AUTOSCALER_FAILURE';

const fetchUpdateApp = (body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_APP_AUTOSCALER_REQUEST,
        UPDATE_APP_AUTOSCALER_SUCCESS,
        UPDATE_APP_AUTOSCALER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/autoscaler/app`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const updateApp = (body: object, callback?: function) =>
  dispatch => dispatch(fetchUpdateApp(body, callback));

export const STATUS_APP_AUTOSCALER_REQUEST = 'STATUS_APP_AUTOSCALER_REQUEST';
export const STATUS_APP_AUTOSCALER_SUCCESS = 'STATUS_APP_AUTOSCALER_SUCCESS';
export const STATUS_APP_AUTOSCALER_FAILURE = 'STATUS_APP_AUTOSCALER_FAILURE';

const fetchChangeAppStatus = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        STATUS_APP_AUTOSCALER_REQUEST,
        STATUS_APP_AUTOSCALER_SUCCESS,
        STATUS_APP_AUTOSCALER_FAILURE,
      ],
      endpoint:
        `${API_URL_PREFIX}/clusters/autoscaler/app/status?${toQuerystring(query)}`,
      schema: {},
      options: {
        method: 'GET',
      },
    },
    callback,
  };
};

export const changeAppStatus = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchChangeAppStatus(query, callback));

export const APP_CLUSTER_MAXNODES_REQUEST = 'APP_CLUSTER_MAXNODES_REQUEST';
export const APP_CLUSTER_MAXNODES_SUCCESS = 'APP_CLUSTER_MAXNODES_SUCCESS';
export const APP_CLUSTER_MAXNODES_FAILURE = 'APP_CLUSTER_MAXNODES_FAILURE';

const fetchClusterMaxNodes = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_CLUSTER_MAXNODES_REQUEST,
        APP_CLUSTER_MAXNODES_SUCCESS,
        APP_CLUSTER_MAXNODES_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${query.cluster}/licenses?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getClusterMaxNodes = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchClusterMaxNodes(query, callback))
