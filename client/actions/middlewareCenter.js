/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for middleware center
 *
 * @author zhangxuan
 * @date 2018-09-10
 */

// import { FETCH_API } from '../../src/middleware/api';
// import { API_URL_PREFIX } from '../../src/constants';

export const SET_BPM_FORM_FIELDS = 'SET_BPM_FORM_FIELDS'

export const setBpmFormFields = (fields, callback) => {
  return {
    type: SET_BPM_FORM_FIELDS,
    fields,
    callback,
  }
}

export const CLEAR_BPM_FORM_FIELDS = 'CLEAR_BPM_FORM_FIELDS'

export const clearBpmFormFields = (fields, callback) => {
  return {
    type: CLEAR_BPM_FORM_FIELDS,
    callback,
  }
}
