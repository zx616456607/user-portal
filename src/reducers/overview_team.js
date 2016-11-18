/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-11-18
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/overview_team'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function overviewTeam(state = {
  teamDetail: {}
 }, action) {
  return {
    teamDetail: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_TEAM_DETAIL_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_TEAM_DETAIL_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_TEAM_DETAIL_FAILURE
    }, state.teamDetail, action, option)
  }
}