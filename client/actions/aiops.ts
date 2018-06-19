/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Redux actions for AIOps
 *
 * v0.1 - 2018-06-11
 * @author Zhangpc
 */

import { arrayOf } from 'normalizr';
import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools';

export const GET_AI_MODELSETS_REQUEST = 'GET_AI_MODELSETS_REQUEST';
export const GET_AI_MODELSETS_SUCCESS = 'GET_AI_MODELSETS_SUCCESS';
export const GET_AI_MODELSETS_FAILURE = 'GET_AI_MODELSETS_FAILURE';

const fetchAIModelsets = (cluster, query) => {
  return {
    [FETCH_API]: {
      types: [
        GET_AI_MODELSETS_REQUEST,
        GET_AI_MODELSETS_SUCCESS,
        GET_AI_MODELSETS_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/ai/clusters/${cluster}/modelsets?${toQuerystring(query)}`,
      schema: arrayOf({}),
    },
  };
};

export const getAIModelsets = (cluster: string, query?: object) =>
  dispatch => dispatch(fetchAIModelsets(cluster, query));
