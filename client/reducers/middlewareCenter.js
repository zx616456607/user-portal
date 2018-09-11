/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Redux reducers for middleware center
 *
 * @author zhangxuan
 * @date 2018-09-10
 */

import * as ActionTypes from '../actions/middlewareCenter'

function appConfigs(state = {}, action) {
  switch (action.type) {
    case ActionTypes.SET_BPM_FORM_FIELDS:
      return Object.assign({}, state, {
        ...action.fields,
      })
    case ActionTypes.CLEAR_BPM_FORM_FIELDS:
      return {}
    default:
      return state
  }
}

export default function middlewareCenter(state = {}, action) {
  return {
    appConfigs: appConfigs(state.appConfigs, action),
  }
}
