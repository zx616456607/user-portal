/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for integration cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import * as ActionTypes from '../actions/integration'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import { cloneDeep } from 'lodash'

function getAllIntegration(state = {}, action) {
  const defaultState = {
    integrations: []
  }
  switch (action.type) {
    case ActionTypes.GET_ALL_INTEGRATION_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_ALL_INTEGRATION_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        integrations: action.response.result.result.data.vsphere || []
      })
    case ActionTypes.GET_ALL_INTEGRATION_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export function integration(state = { integration: {} }, action) {
  return {
    getAllIntegration: getAllIntegration(state.getAllIntegration, action),
  }
}