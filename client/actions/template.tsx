/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for template
 *
 * v0.1 - 2018-03-22
 * @author zhangxuan
 */

import { FETCH_API, Schemas } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools';

export const CREATE_APP_TEMPLATE_REQUEST = 'CREATE_APP_TEMPLATE_REQUEST';
export const CREATE_APP_TEMPLATE_SUCCESS = 'CREATE_APP_TEMPLATE_SUCCESS';
export const CREATE_APP_TEMPLATE_FAILURE = 'CREATE_APP_TEMPLATE_FAILURE';

const fetchCreateTemplate = (cluster, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_TEMPLATE_REQUEST,
        CREATE_APP_TEMPLATE_SUCCESS,
        CREATE_APP_TEMPLATE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/clusters/${cluster}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const createTemplate = (cluster: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateTemplate(cluster, body, callback));

export const APP_TEMPLATE_LIST_REQUEST = 'APP_TEMPLATE_LIST_REQUEST';
export const APP_TEMPLATE_LIST_SUCCESS = 'APP_TEMPLATE_LIST_SUCCESS';
export const APP_TEMPLATE_LIST_FAILURE = 'APP_TEMPLATE_LIST_FAILURE';

const fetchTemplateList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_TEMPLATE_LIST_REQUEST,
        APP_TEMPLATE_LIST_SUCCESS,
        APP_TEMPLATE_LIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getTemplateList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchTemplateList(query, callback));

export const DELETE_APP_TEMPLATE_REQUEST = 'DELETE_APP_TEMPLATE_REQUEST';
export const DELETE_APP_TEMPLATE_SUCCESS = 'DELETE_APP_TEMPLATE_SUCCESS';
export const DELETE_APP_TEMPLATE_FAILURE = 'DELETE_APP_TEMPLATE_FAILURE';

const fetchDeleteAppTemplete = (name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_APP_TEMPLATE_REQUEST,
        DELETE_APP_TEMPLATE_SUCCESS,
        DELETE_APP_TEMPLATE_FAILURE,
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

export const deleteAppTemplate = (name: string, callback?: function) =>
  dispatch => dispatch(fetchDeleteAppTemplete(name, callback));

export const APP_TEMPLATE_DETAIL_REQUEST = 'APP_TEMPLATE_DETAIL_REQUEST';
export const APP_TEMPLATE_DETAIL_SUCCESS = 'APP_TEMPLATE_DETAIL_SUCCESS';
export const APP_TEMPLATE_DETAIL_FAILURE = 'APP_TEMPLATE_DETAIL_FAILURE';

const fetchAppTemplateDetail = (name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_TEMPLATE_DETAIL_REQUEST,
        APP_TEMPLATE_DETAIL_SUCCESS,
        APP_TEMPLATE_DETAIL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/${name}`,
      schema: {},
    },
    callback,
  };
};

export const getAppTemplateDetail = (name: string, callback?: function) =>
  dispatch => dispatch(fetchAppTemplateDetail(name, callback));

export const APP_TEMPLATE_DEPLOY_CHECK_REQUEST = 'APP_TEMPLATE_DEPLOY_CHECK_REQUEST';
export const APP_TEMPLATE_DEPLOY_CHECK_SUCCESS = 'APP_TEMPLATE_DEPLOY_CHECK_SUCCESS';
export const APP_TEMPLATE_DEPLOY_CHECK_FAILURE = 'APP_TEMPLATE_DEPLOY_CHECK_FAILURE';

const fetchAppTemplateDeployCheck = (cluster, name, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_TEMPLATE_DEPLOY_CHECK_REQUEST,
        APP_TEMPLATE_DEPLOY_CHECK_SUCCESS,
        APP_TEMPLATE_DEPLOY_CHECK_FAILURE,
      ],
    },
    callback,
  };
};

export const appTemplateDeployCheck = (cluster: string, name: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchAppTemplateDeployCheck(cluster, name, body, callback));
