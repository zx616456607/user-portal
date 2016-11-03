/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016-11-03
 * @author mengyuan
 */

import * as ActionTypes from '../actions/open_api'
import reducerFactory from './factory'

export default function openApi(state = {
  token: {
    namespace:"",
    token:"",
  }
 }, action) {
  return {
    token: reducerFactory({
      REQUEST: ActionTypes.TOKEN_REQUEST,
      SUCCESS: ActionTypes.TOKEN_SUCCESS,
      FAILURE: ActionTypes.TOKEN_FAILURE
    }, state.token, action)
  }
}