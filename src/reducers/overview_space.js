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

const spaceCICDStatsReducer = (state = { isFetching: false }, action) => {
  switch (action.type) {
    case ActionTypes.OVERVIEW_SPACE_CICD_REQUEST:
      return { ...state, isFetching: true }
    case ActionTypes.OVERVIEW_SPACE_CICD_SUCCESS:
      const result = action.response.result.data.results
      return Object.assign({}, state, {
        isFetching: false,
        result
      })
    case ActionTypes.OVERVIEW_SPACE_CICD_FAILURE:
      return { ...state, isFetching: false }
    default:
      return state
  }
}

export default function overviewSpace(state = {
  spaceInfo: {},
  spaceOperations: {},
  spaceCICDStats: {},
  spaceImageStats: {},
  spaceTemplateStats: {},
  spaceWarnings: {}
 }, action) {
  return {
    spaceInfo: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACEINFO_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACEINFO_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACEINFO_FAILURE
    }, state.spaceInfo, action, option),
    spaceOperations: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACE_OPERATIONS_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACE_OPERATIONS_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACE_OPERATIONS_FAILURE
    }, state.spaceOperations, action, option),
    spaceCICDStats: spaceCICDStatsReducer(state.spaceCICDStats, action, option),
    spaceImageStats: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACE_IMAGE_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACE_IMAGE_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACE_IMAGE_FAILURE
    }, state.spaceImageStats, action, option),
    spaceTemplateStats: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACE_TEMPLATE_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACE_TEMPLATE_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACE_TEMPLATE_FAILURE
    }, state.spaceTemplateStats, action, option),
    spaceWarnings: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_SPACE_WARNING_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_SPACE_WARNING_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_SPACE_WARNING_FAILURE
    }, state.spaceWarnings, action, option)
  }
}
