/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for user 3rd accounts
 *
 * v0.1 - 2017-07-28
 * @author ZhaoYanbei
 */

import * as ActionTypes from '../actions/tenant_overview'
import merge from 'lodash/merge'

function ovinfosList(state = {}, action){
  switch(action.type){
    case ActionTypes.TENANT_OVERVIEW_INFOS_REQUEST :
      return merge({}, state, {isFetching: true,})
    case ActionTypes.TENANT_OVERVIEW_INFOS_SUCCESS :
      return Object.assign({}, state, {
        isFetching: false,
        list: action.response.result.body.permission,
      })
    case ActionTypes.TENANT_OVERVIEW_INFOS_REQUEST :
      return merge({}, state, {isFetching: false})
    default:
      return state
  }
}

export default function tenantOverview(state = { ovinfosList: {} }, action) {
  return {
    ovinfosList: ovinfosList(state.ovinfosList, action)
  }
}
