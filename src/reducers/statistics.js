/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-15
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/statistics'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function user(state = {
  appStatus: [],
  serviceStatus: [],
  podStatus: []
 }, action) {
  return {
    appStatus: reducerFactory({
      REQUEST: ActionTypes.APP_STATUS_REQUEST,
      SUCCESS: ActionTypes.APP_STATUS_SUCCESS,
      FAILURE: ActionTypes.APP_STATUS_FAILURE
    }, state.appStatus, action, option),
    serviceStatus: reducerFactory({
      REQUEST: ActionTypes.SERVICE_STATUS_REQUEST,
      SUCCESS: ActionTypes.SERVICE_STATUS_SUCCESS,
      FAILURE: ActionTypes.SERVICE_STATUS_FAILURE
    }, state.serviceStatus, action, option),
    podStatus: reducerFactory({
      REQUEST: ActionTypes.POD_STATUS_REQUEST,
      SUCCESS: ActionTypes.POD_STATUS_SUCCESS,
      FAILURE: ActionTypes.POD_STATUS_FAILURE
    }, state.podStatus, action, option)
  }
}