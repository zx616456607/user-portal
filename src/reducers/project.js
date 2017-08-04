/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for license
 *
 * v0.1 - 2017-05-19
 * @author Baiyu
 */

import * as ActionTypes from '../actions/project'
import merge from 'lodash/merge'

function getProjectsApprovalClusters(state = {}, action) {
  const defaultState = {}
  switch (action.type) {
    case ActionTypes.PROJECTS_CLUSTER_APPROVAL_GET_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.PROJECTS_CLUSTER_APPROVAL_GET_SUCCESS:
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.PROJECTS_CLUSTER_APPROVAL_GET_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        data: action.response
      })
    default:
      return state
  }
}

function projectsDetail(state = {}, action) {
  const { type, projectsName } = action
  const defaultState = {
    [projectsName]: {}
  }
  switch (type) {
    case ActionTypes.PROJECTS_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        [projectsName]: {
          isFetching: true,
        }
      })
    case ActionTypes.PROJECTS_DETAIL_SUCCESS:
      return Object.assign({}, defaultState, state, {
        [projectsName]: {
          isFetching: false,
          data: action.response.result,
        }
      })
    case ActionTypes.PROJECTS_DETAIL_FAILURE:
      return Object.assign({}, defaultState, state, {
        [projectsName]: {
          isFetching: false,
        }
      })
    default:
      return state
  }
}

export default function projectAuthority(state = {}, action) {
  return {
    projectsApprovalClustersList: getProjectsApprovalClusters(state.projectsApprovalClustersList, action),
    projectsDetail: projectsDetail(state.projectsDetail, action),
  }
}