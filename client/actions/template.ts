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

const fetchCreateTemplate = (clusterID, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_TEMPLATE_REQUEST,
        CREATE_APP_TEMPLATE_SUCCESS,
        CREATE_APP_TEMPLATE_FAILURE,
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

export const createTemplate = (clusterID: string, body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateTemplate(clusterID, body, callback));

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

const fetchDeleteAppTemplete = (name, version, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_APP_TEMPLATE_REQUEST,
        DELETE_APP_TEMPLATE_SUCCESS,
        DELETE_APP_TEMPLATE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/${name}/versions/${version}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteAppTemplate = (name: string, version: string, callback?: function) =>
  dispatch => dispatch(fetchDeleteAppTemplete(name, version, callback));

export const APP_TEMPLATE_DETAIL_REQUEST = 'APP_TEMPLATE_DETAIL_REQUEST';
export const APP_TEMPLATE_DETAIL_SUCCESS = 'APP_TEMPLATE_DETAIL_SUCCESS';
export const APP_TEMPLATE_DETAIL_FAILURE = 'APP_TEMPLATE_DETAIL_FAILURE';

const fetchAppTemplateDetail = (name, version, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_TEMPLATE_DETAIL_REQUEST,
        APP_TEMPLATE_DETAIL_SUCCESS,
        APP_TEMPLATE_DETAIL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/${name}/versions/${version}`,
      schema: {},
    },
    callback,
  };
};

export const getAppTemplateDetail = (name: string, version: string, callback?: function) =>
  dispatch => dispatch(fetchAppTemplateDetail(name, version, callback));

export const APP_TEMPLATE_DEPLOY_CHECK_REQUEST = 'APP_TEMPLATE_DEPLOY_CHECK_REQUEST';
export const APP_TEMPLATE_DEPLOY_CHECK_SUCCESS = 'APP_TEMPLATE_DEPLOY_CHECK_SUCCESS';
export const APP_TEMPLATE_DEPLOY_CHECK_FAILURE = 'APP_TEMPLATE_DEPLOY_CHECK_FAILURE';

const fetchAppTemplateDeployCheck = (cluster, name, version, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_TEMPLATE_DEPLOY_CHECK_REQUEST,
        APP_TEMPLATE_DEPLOY_CHECK_SUCCESS,
        APP_TEMPLATE_DEPLOY_CHECK_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/${name}/versions/${version}/clusters/${cluster}`,
      schema: {},
    },
    callback,
  };
};

export const appTemplateDeployCheck = (cluster: string, name: string, version, callback?) =>
  dispatch => dispatch(fetchAppTemplateDeployCheck(cluster, name, version, callback));

const APP_TEMPLATE_DEPLOY_REQUEST = 'APP_TEMPLATE_DEPLOY_REQUEST';
const APP_TEMPLATE_DEPLOY_SUCCESS = 'APP_TEMPLATE_DEPLOY_SUCCESS';
const APP_TEMPLATE_DEPLOY_FAILURE = 'APP_TEMPLATE_DEPLOY_FAILURE';

const fetchAppTemplateDeploy = (cluster, name, version, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_TEMPLATE_DEPLOY_REQUEST,
        APP_TEMPLATE_DEPLOY_SUCCESS,
        APP_TEMPLATE_DEPLOY_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/${name}/versions/${version}/clusters/${cluster}`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const appTemplateDeploy = (cluster, name, version, body, callback) =>
  dispatch => dispatch(fetchAppTemplateDeploy(cluster, name, version, body, callback));

export const REMOVE_APP_TEMPLATE_DEPLOY_CHECK = 'REMOVE_APP_TEMPLATE_DEPLOY_CHECK';

export const removeAppTemplateDeployCheck = (callback) => {
  return {
    type: REMOVE_APP_TEMPLATE_DEPLOY_CHECK,
    callback,
  };
};

const APP_TEMPLATE_NAME_CHECK_REQUEST = 'APP_TEMPLATE_NAME_CHECK_REQUEST';
const APP_TEMPLATE_NAME_CHECK_SUCCESS = 'APP_TEMPLATE_NAME_CHECK_SUCCESS';
const APP_TEMPLATE_NAME_CHECK_FAILURE = 'APP_TEMPLATE_NAME_CHECK_FAILURE';

const fetchAppTemplateNameCheck = (name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        APP_TEMPLATE_NAME_CHECK_REQUEST,
        APP_TEMPLATE_NAME_CHECK_SUCCESS,
        APP_TEMPLATE_NAME_CHECK_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/${name}`,
      schema: {},
    },
    callback,
  };
};

export const appTemplateNameCheck = (name, callback) =>
  dispatch => dispatch(fetchAppTemplateNameCheck(name, callback));

const HELM_IS_PREPARE_REQUEST = 'HELM_IS_PREPARE_REQUEST'
const HELM_IS_PREPARE_SUCCESS = 'HELM_IS_PREPARE_SUCCESS'
const HELM_IS_PREPARE_FAILURE = 'HELM_IS_PREPARE_FAILURE'

const fetchHelmIsPrePare = (cluster, callback) => {
  return {
    [FETCH_API]: {
      types: [
        HELM_IS_PREPARE_REQUEST,
        HELM_IS_PREPARE_SUCCESS,
        HELM_IS_PREPARE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/templates/helm/prepare/clusters/${cluster}`,
      schema: {},
    },
    callback,
  };
};

export const checkHelmIsPrepare = (cluster, callback) =>
  dispatch => dispatch(fetchHelmIsPrePare(cluster, callback));

export const CHART_REPO_IS_PREPARE_REQUEST = 'CHART_REPO_IS_PREPARE_REQUEST'
export const CHART_REPO_IS_PREPARE_SUCCESS = 'CHART_REPO_IS_PREPARE_SUCCESS'
export const CHART_REPO_IS_PREPARE_FAILURE = 'CHART_REPO_IS_PREPARE_FAILURE'

const fetchChartRepoIsPrepare = callback => ({
  [FETCH_API]: {
    types: [
      CHART_REPO_IS_PREPARE_REQUEST,
      CHART_REPO_IS_PREPARE_SUCCESS,
      CHART_REPO_IS_PREPARE_FAILURE,
    ],
    schema: {},
    endpoint: `${API_URL_PREFIX}/templates/helm/prepare/chart_repo`,
  },
  callback,
});

export const checkChartRepoIsPrepare = callback =>
  dispatch => dispatch(fetchChartRepoIsPrepare(callback))
