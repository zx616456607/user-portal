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

export const CREATE_SYSTEM_NOTICE_REQUEST = 'CREATE_SYSTEM_NOTICE_REQUEST';
export const CREATE_SYSTEM_NOTICE_SUCCESS = 'CREATE_SYSTEM_NOTICE_SUCCESS';
export const CREATE_SYSTEM_NOTICE_FAILURE = 'CREATE_SYSTEM_NOTICE_FAILURE';

const fetchCreateSystemNotice = (body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_SYSTEM_NOTICE_REQUEST,
        CREATE_SYSTEM_NOTICE_SUCCESS,
        CREATE_SYSTEM_NOTICE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/announcements`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createSystemNotice = (body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateSystemNotice(body, callback));

export const GET_SYSTEM_NOTICE_REQUEST = 'GET_SYSTEM_NOTICE_REQUEST';
export const GET_SYSTEM_NOTICE_SUCCESS = 'GET_SYSTEM_NOTICE_SUCCESS';
export const GET_SYSTEM_NOTICE_FAILURE = 'GET_SYSTEM_NOTICE_FAILURE';

const fetchGetSystemNotice = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_SYSTEM_NOTICE_REQUEST,
        GET_SYSTEM_NOTICE_SUCCESS,
        GET_SYSTEM_NOTICE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/announcements/${query.id}`,
      schema: {},
    },
    callback,
  };
};

export const getSystemNotice = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchGetSystemNotice(query, callback));

export const DELETE_SYSTEM_NOTICE_REQUEST = 'DELETE_SYSTEM_NOTICE_REQUEST';
export const DELETE_SYSTEM_NOTICE_SUCCESS = 'DELETE_SYSTEM_NOTICE_SUCCESS';
export const DELETE_SYSTEM_NOTICE_FAILURE = 'DELETE_SYSTEM_NOTICE_FAILURE';

const fetchDeleteSystemNotice = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_SYSTEM_NOTICE_REQUEST,
        DELETE_SYSTEM_NOTICE_SUCCESS,
        DELETE_SYSTEM_NOTICE_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/announcements/${query.id}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteSystemNotice = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchDeleteSystemNotice(query, callback));

export const GET_SYSTEM_NOTICES_REQUEST = 'GET_SYSTEM_NOTICES_REQUEST';
export const GET_SYSTEM_NOTICES_SUCCESS = 'GET_SYSTEM_NOTICES_SUCCESS';
export const GET_SYSTEM_NOTICES_FAILURE = 'GET_SYSTEM_NOTICES_FAILURE';

const fetchSystemNoticeList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_SYSTEM_NOTICES_REQUEST,
        GET_SYSTEM_NOTICES_SUCCESS,
        GET_SYSTEM_NOTICES_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/announcements?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getSystemNoticeList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchSystemNoticeList(query, callback));

export const GET_MY_ORDER_REQUEST = 'GET_MY_ORDER_REQUEST'
export const GET_MY_ORDER_SUCCESS = 'GET_MY_ORDER_SUCCESS'
export const GET_MY_ORDER_FAILURE = 'GET_MY_ORDER_FAILURE'

const fetchMyOrderList = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_MY_ORDER_REQUEST,
        GET_MY_ORDER_SUCCESS,
        GET_MY_ORDER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/my-order?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
  };
};

export const getMyOrderList = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchMyOrderList(query, callback));

export const CREATE_WORK_ORDER_REQUEST = 'CREATE_WORK_ORDER_REQUEST';
export const CREATE_WORK_ORDER_SUCCESS = 'CREATE_WORK_ORDER_SUCCESS';
export const CREATE_WORK_ORDER_FAILURE = 'CREATE_WORK_ORDER_FAILURE';

const fetchCreateWorkOrder = (body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_WORK_ORDER_REQUEST,
        CREATE_WORK_ORDER_SUCCESS,
        CREATE_WORK_ORDER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const createWorkOrder = (body: object, callback?: function) =>
  dispatch => dispatch(fetchCreateWorkOrder(body, callback));

export const GET_MY_ORDER_DETAILS_REQUEST = 'GET_MY_ORDER_DETAILS_REQUEST'
export const GET_MY_ORDER_DETAILS_SUCCESS = 'GET_MY_ORDER_DETAILS_SUCCESS'
export const GET_MY_ORDER_DETAILS_FAILURE = 'GET_MY_ORDER_DETAILS_FAILURE'

const fetchMyOrderDetails = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_MY_ORDER_DETAILS_REQUEST,
        GET_MY_ORDER_DETAILS_SUCCESS,
        GET_MY_ORDER_DETAILS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/my-order/${query.id}`,
      schema: {},
    },
    callback,
  };
};

export const getMyOrderDetails = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchMyOrderDetails(query, callback));

export const GET_MY_ORDER_MESSAGES_REQUEST = 'GET_MY_ORDER_MESSAGES_REQUEST'
export const GET_MY_ORDER_MESSAGES_SUCCESS = 'GET_MY_ORDER_MESSAGES_SUCCESS'
export const GET_MY_ORDER_MESSAGES_FAILURE = 'GET_MY_ORDER_MESSAGES_FAILURE'

const fetchMyOrderMessages = (query, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_MY_ORDER_MESSAGES_REQUEST,
        GET_MY_ORDER_MESSAGES_SUCCESS,
        GET_MY_ORDER_MESSAGES_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/my-order/${query.id}/messages`,
      schema: {},
    },
    callback,
  };
};

export const getMyOrderMessages = (query?: object, callback?: function) =>
  dispatch => dispatch(fetchMyOrderMessages(query, callback));

export const ADD_MY_ORDER_MESSAGES_REQUEST = 'ADD_MY_ORDER_MESSAGES_REQUEST'
export const ADD_MY_ORDER_MESSAGES_SUCCESS = 'ADD_MY_ORDER_MESSAGES_SUCCESS'
export const ADD_MY_ORDER_MESSAGES_FAILURE = 'ADD_MY_ORDER_MESSAGES_FAILURE'

const fetchAddMyOrderMessages = (id, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        ADD_MY_ORDER_MESSAGES_REQUEST,
        ADD_MY_ORDER_MESSAGES_SUCCESS,
        ADD_MY_ORDER_MESSAGES_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/my-order/${id}/messages`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const addMyOrderMessages = (id?: string, body?: object, callback?: function) =>
  dispatch => dispatch(fetchAddMyOrderMessages(id, body, callback));

export const CHANGE_MY_ORDER_STATUS_REQUEST = 'CHANGE_MY_ORDER_STATUS_REQUEST'
export const CHANGE_MY_ORDER_STATUS_SUCCESS = 'CHANGE_MY_ORDER_STATUS_SUCCESS'
export const CHANGE_MY_ORDER_STATUS_FAILURE = 'CHANGE_MY_ORDER_STATUS_FAILURE'

const fetchChangeOrderStatus = (id, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CHANGE_MY_ORDER_STATUS_REQUEST,
        CHANGE_MY_ORDER_STATUS_SUCCESS,
        CHANGE_MY_ORDER_STATUS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/workorders/my-order/${id}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const changeMyOrderStatus = (id?: string, body?: object, callback?: function) =>
  dispatch => dispatch(fetchChangeOrderStatus(id, body, callback));
