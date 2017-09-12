/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Apm reducers for redux
 *
 * 2017-09-12
 * @author zhangpc
 */

import * as ActionTypes from '../actions/apm'

export const apmList = (state = {}, action) => {
  const { type, clusterID } = action
  switch (type) {
    case ActionTypes.APMS_REQUEST:
      return {
        ...state,
        [clusterID]: Object.assign({}, state[clusterID], {
          isFetching: true,
        }),
      }
    case ActionTypes.APMS_SUCCESS:
      return {
        ...state,
        [clusterID]: Object.assign({}, state[clusterID], {
          isFetching: false,
          apms: action.response.result.data.apms,
        }),
      }
    case ActionTypes.APMS_FAILURE:
      return {
        ...state,
        [clusterID]: Object.assign({}, state[clusterID], {
          isFetching: false,
        }),
      }
    default:
      return state
  }
}
