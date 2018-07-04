/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 *
 * Redux actions for template
 *
 * @author zhangtao
 * @date Wednesday June 20th 2018
 */

import { FETCH_API, Schemas } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools';

// 申请配额 // POST
export const APPLAY_RESOURCEQUOTA_REQUEST = 'APPLAY_RESOURCEQUOTA_REQUEST';
export const APPLAY_RESOURCEQUOTA_SUCCESS = 'APPLAY_RESOURCEQUOTA_SUCCESS';
export const APPLAY_RESOURCEQUOTA_FAILURE = 'APPLAY_RESOURCEQUOTA_FAILURE';

const fetchApplayResourcequota = (query, body, callback) => {
  const teamspace = query && query.header && query.header.teamspace
  let options = {
    method: 'POST',
    body,
  }
  if ( teamspace ) {
    options.headers = { teamspace }
  }
  return {
    [FETCH_API]: {
      types: [
        APPLAY_RESOURCEQUOTA_REQUEST,
        APPLAY_RESOURCEQUOTA_SUCCESS,
        APPLAY_RESOURCEQUOTA_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/resourcequota/apply`,
      schema: {},
      options,
    },
    callback,
  };
};

export const applayResourcequota = ( query: object, body: object, callback?: function ) =>
  dispatch => dispatch(fetchApplayResourcequota(query, body, callback));

// 查看申请记录 //get
export const CHECK_APPLYRECORD_REQUEST = 'CHECK_APPLYRECORD_REQUEST';
export const CHECK_APPLYRECORD_SUCCESS = 'CHECK_APPLYRECORD_SUCCESS';
export const CHECK_APPLYRECORD_FAILURE = 'CHECK_APPLYRECORD_FAILURE';

const fetchCheckApplyRecord = (query, callback) => {
  const noreducer = query.noreducer
  if (noreducer ) {
    delete query.noreducer
  }
  return {
    [FETCH_API]: {
      types: [
        CHECK_APPLYRECORD_REQUEST,
        CHECK_APPLYRECORD_SUCCESS,
        CHECK_APPLYRECORD_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/resourcequota/apply?${toQuerystring(query)}`,
      schema: {},
    },
    callback,
    noreducer,
  };
};

export const checkApplyRecord = ( query, callback?: function ) =>
  dispatch => dispatch(fetchCheckApplyRecord( query, callback));

// 删除审批记录
export const DELETE_RESOURCEQUOTA_REQUEST = 'DELETE_RESOURCEQUOTA_REQUEST';
export const DELETE_RESOURCEQUOTA_SUCCESS = 'DELETE_RESOURCEQUOTA_SUCCESS';
export const DELETE_RESOURCEQUOTA_FAILURE = 'DELETE_RESOURCEQUOTA_FAILURE';

const fetchDeleteResourcequota = (id: number, callback) => {
  return {
    [FETCH_API]: {
      types: [
        DELETE_RESOURCEQUOTA_REQUEST,
        DELETE_RESOURCEQUOTA_SUCCESS,
        DELETE_RESOURCEQUOTA_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/resourcequota/apply/${id}`,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  };
};

export const deleteResourcequota = ( id: number, callback?: function ) =>
  dispatch => dispatch(fetchDeleteResourcequota(id, callback))

// 更新审批状态 // PUT
export const UPDATE_RESOURCEQUOTA_REQUEST = 'UPDATE_RESOURCEQUOTA_REQUEST';
export const UPDATE_RESOURCEQUOTA_SUCCESS = 'UPDATE_RESOURCEQUOTA_SUCCESS';
export const UPDATE_RESOURCEQUOTA_FAILURE = 'UPDATE_RESOURCEQUOTA_FAILURE';

const fetchUpdateResourcequota = (id: number, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        UPDATE_RESOURCEQUOTA_REQUEST,
        UPDATE_RESOURCEQUOTA_SUCCESS,
        UPDATE_RESOURCEQUOTA_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/resourcequota/apply/${id}`,
      schema: {},
      options: {
        method: 'PUT',
        body,
      },
    },
    callback,
  };
};

export const updateResourcequota = ( id: number, body, callback?: function ) =>
  dispatch => dispatch(fetchUpdateResourcequota(id, body, callback))

// 查看审批详情
export const CHECK_RESOURCEQUOTA_DETAIL_REQUEST = 'CHECK_RESOURCEQUOTA_DETAIL_REQUEST';
export const CHECK_RESOURCEQUOTA_DETAIL_SUCCESS = 'CHECK_RESOURCEQUOTA_DETAIL_SUCCESS';
export const CHECK_RESOURCEQUOTA_DETAIL_FAILURE = 'CHECK_RESOURCEQUOTA_DETAIL_FAILURE';

const fetchCheckResourcequotaDetail = (id: number, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CHECK_RESOURCEQUOTA_DETAIL_REQUEST,
        CHECK_RESOURCEQUOTA_DETAIL_SUCCESS,
        CHECK_RESOURCEQUOTA_DETAIL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/resourcequota/apply/${id}`,
      schema: {},
      options: {
        method: 'GET',
      },
    },
    callback,
  };
};

export const checkResourcequotaDetail = ( id: number, callback?: function ) =>
  dispatch => dispatch(fetchCheckResourcequotaDetail(id, callback))

// 检查申请记录是否已存在
export const CHECK_RESOURCEQUOTA_RECORD_EXIST_REQUEST = 'CHECK_RESOURCEQUOTA_RECORD_EXIST_REQUEST';
export const CHECK_RESOURCEQUOTA_RECORD_EXIST_SUCCESS = 'CHECK_RESOURCEQUOTA_RECORD_EXIST_SUCCESS';
export const CHECK_RESOURCEQUOTA_RECORD_EXIST_FAILURE = 'CHECK_RESOURCEQUOTA_RECORD_EXIST_FAILURE';

const fetchCheckResourcequotaExist = (callback) => {
  return {
    [FETCH_API]: {
      types: [
        CHECK_RESOURCEQUOTA_RECORD_EXIST_REQUEST,
        CHECK_RESOURCEQUOTA_RECORD_EXIST_SUCCESS,
        CHECK_RESOURCEQUOTA_RECORD_EXIST_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/resourcequota/apply/checkApplyExist`,
      schema: {},
      options: {
        method: 'GET',
      },
    },
    callback,
  };
};

export const checkResourcequotaExist = ( callback?: function ) =>
  dispatch => dispatch(fetchCheckResourcequotaExist(callback))

