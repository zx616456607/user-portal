/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for emailApproval
 *
 * v0.1 - 2018-10-10
 * @author lvjunfeng
 */

import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';

export const GET_EMAIL_APPROVAL_REQUEST = 'GET_EMAIL_APPROVAL_REQUEST';
export const GET_EMAIL_APPROVAL_SUCCESS = 'GET_EMAIL_APPROVAL_SUCCESS';
export const GET_EMAIL_APPROVAL_FAILURE = 'GET_EMAIL_APPROVAL_FAILURE';

const fetchEmailApproval = (stageId, stageBuildId, token, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_EMAIL_APPROVAL_REQUEST,
        GET_EMAIL_APPROVAL_SUCCESS,
        GET_EMAIL_APPROVAL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/emailapproval/${stageId}/${stageBuildId}/status?token=${token}`,
      schema: {},
    },
    callback,
  };
};

export const getEmailApproval = (stageId, stageBuildId, token, callback) =>
  dispatch => dispatch(fetchEmailApproval(stageId, stageBuildId, token, callback));

const POST_EMAIL_APPROVAL_REQUEST = 'POST_EMAIL_APPROVAL_REQUEST';
const POST_EMAIL_APPROVAL_SUCCESS = 'POST_EMAIL_APPROVAL_SUCCESS';
const POST_EMAIL_APPROVAL_FAILURE = 'POST_EMAIL_APPROVAL_FAILURE';

const updateApproval = (stageId, stageBuildId, type, token, body, callback) => {
  return {
    [FETCH_API]: {
      types: [
        POST_EMAIL_APPROVAL_REQUEST,
        POST_EMAIL_APPROVAL_SUCCESS,
        POST_EMAIL_APPROVAL_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/devops/emailapproval/${stageId}/${stageBuildId}/${type}?token=${token}`,
      schema: {},
      options: {
        method: 'POST',
        body,
      },
    },
    callback,
  };
};

export const updateApprovalStatus = (stageId, stageBuildId, type, token, body, callback) =>
  dispatch => dispatch(updateApproval(stageId, stageBuildId, type, token, body, callback));
