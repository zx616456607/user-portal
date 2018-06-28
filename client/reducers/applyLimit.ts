/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * Redux reducers for applyLimit
 *
 * @author zhangtao
 * @date Wednesday June 20th 2018
 */
import * as ActionTypes from '../actions/applyLimit';
import isEmpty from 'lodash/isEmpty';

// 资源配额申请记录
function resourcequoteRecord(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CHECK_APPLYRECORD_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        total: 0,
      });
    case ActionTypes.CHECK_APPLYRECORD_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data.records,
        total: action.response.result.data.total,
      });
    case ActionTypes.CHECK_APPLYRECORD_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

// 资源配额详情
function resourcequotaDetail(state = {}, action) {
  switch (action.type) {
    case ActionTypes.CHECK_RESOURCEQUOTA_DETAIL_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case ActionTypes.CHECK_RESOURCEQUOTA_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data,
      });
    case ActionTypes.CHECK_RESOURCEQUOTA_DETAIL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}



export default function applyLimit(state = {}, action) {
  return {
    resourcequoteRecord: resourcequoteRecord(state.resourcequoteRecord, action),
    resourcequotaDetail: resourcequotaDetail(state.resourcequotaDetail, action),
  };
}