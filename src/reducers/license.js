/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for license
 *
 * v0.1 - 2017-02-09
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/license'
import reducerFactory from './factory'

const options = { overwrite: true }

export default function license(state = {
  licenses: {},
  mergedLicense: {},
  platform: {},
}, action) {
  return {
    licenses: reducerFactory({
      REQUEST: ActionTypes.LICENSE_LIST_REQUEST,
      SUCCESS: ActionTypes.LICENSE_LIST_SUCCESS,
      FAILURE: ActionTypes.LICENSE_LIST_FAILURE
    }, state.licenses, action, options),
    mergedLicense: reducerFactory({
      REQUEST: ActionTypes.LICENSE_MERGED_REQUEST,
      SUCCESS: ActionTypes.LICENSE_MERGED_SUCCESS,
      FAILURE: ActionTypes.LICENSE_MERGED_FAILURE
    }, state.mergedLicense, action, options),
    platform: reducerFactory({
      REQUEST: ActionTypes.LICENSE_PLATFORM_REQUEST,
      SUCCESS: ActionTypes.LICENSE_PLATFORM_SUCCESS,
      FAILURE: ActionTypes.LICENSE_PLATFORM_FAILURE
    }, state.platform, action, options),
  }
}