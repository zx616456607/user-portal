/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for cluster overview
 *
 * v0.1 - 2016-12-07
 * @author mengyuan
 */

import * as ActionTypes from '../actions/consumption'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function detail(state = {
  detail: {},
 }, action) {
  return {
    detail: reducerFactory({
      REQUEST: ActionTypes.CONSUMPTION_DETAIL_REQUEST,
      SUCCESS: ActionTypes.CONSUMPTION_DETAIL_SUCCESS,
      FAILURE: ActionTypes.CONSUMPTION_DETAIL_FAILURE,
    }, state.detail, action, option),
  }
}