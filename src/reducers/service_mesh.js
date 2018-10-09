/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * service_mesh.js page
 *
 * @author zhangtao
 * @date Sunday September 30th 2018
 */
import * as ActionTypes from '../actions/serviceMesh'

export function rebootShining(state = {}, action) {
  switch (action.type) {
    case ActionTypes.SERVICEMESH_REBOOT_SHINING:
      return Object.assign({}, state, {
        shiningFlag: action.shiningFlag
      })
    default:
      return state
  }
}