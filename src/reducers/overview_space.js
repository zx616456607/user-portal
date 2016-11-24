/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/overview_space'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function overviewSpace(state = {
  spaceOperations: {},
  spaceCICDStats: {},
  spaceImageStats: {}
 }, action) {
  return {
    spaceOperations: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACE_OPERATIONS_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACE_OPERATIONS_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACE_OPERATIONS_FAILURE
    }, state.spaceOperations, action, option),
    spaceCICDStats: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACE_CICD_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACE_CICD_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACE_CICD_FAILURE
    }, state.spaceCICDStats, action, option),
    spaceImageStats: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACE_IMAGE_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACE_IMAGE_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACE_IMAGE_FAILURE
    }, state.spaceImageStats, action, option)
  }
}