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
import cloneDeep from 'lodash/cloneDeep'

function getProjectsApprovalClusters(state = {}, action) {
  const { status } = action
  let filter = undefined
  if(status && status.filter){
    let str = status.filter
    filter = str.substring(str.length - 1, str.length)
    if(str == 'status__neq,1,status__neq,0'){
      filter = 5
    }
  }
  const defaultState = {}
  switch (action.type) {
    case ActionTypes.PROJECTS_CLUSTER_APPROVAL_GET_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true,
        approvalPendingData: [],
        approvedReadyData: [],
        searchList: [],
      })
    case ActionTypes.PROJECTS_CLUSTER_APPROVAL_GET_SUCCESS:
      if(filter == 1){
        return Object.assign({}, defaultState, state, {
          isFetching: false,
          approvalPendingData: action.response.result.data || [],
          searchList: []
        })
      }
      if(filter == 5){
        return Object.assign({}, defaultState, state, {
          isFetching: false,
          approvedReadyData: action.response.result.data || [],
          searchList:  action.response.result.data || [],
        })
      }
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        approvalPendingData: [],
        approvedReadyData: [],
        searchList: [],
      })
    case ActionTypes.PROJECTS_CLUSTER_APPROVAL_GET_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        approvalPendingData: [],
        approvedReadyData: [],
        searchList: []
      })
    case ActionTypes.SEARCH_PROJECTS_CLUSTER_APPROVAL_GET:
      const standardList = cloneDeep(state.searchList)
      const { keyWord } = action
      let searchResult = []
      if(keyWord){
        standardList.forEach(item => {
          if(item.projectName.indexOf(keyWord) > -1){
            searchResult.push(item)
          }
        })
      } else {
        searchResult = standardList
      }
      return Object.assign({}, defaultState, state, {
        isFetching: false,
        approvalPendingData: state.approvalPendingData || [],
        approvedReadyData: searchResult,
        searchList: state.searchList,
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

function projectList(state = {}, action) {
  switch (action.type) {
    case ActionTypes.PROJECTS_LIST_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.PROJECTS_LIST_SUCCESS:
      const result = action.response.result.data || {}
      return Object.assign({}, state, {
        isFetching: false,
        data: result.projects || [],
        total: result.listMeta && result.listMeta.total || 0,
      })
    case ActionTypes.PROJECTS_LIST_FAILURE:
      return merge({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function projectClusterList(state = {}, action) {
  const { projectName, type } = action
  switch (type) {
    case ActionTypes.PROJECTS_CLUSTER_ALL_GET_REQUEST:
      return merge({}, state, {
        [projectName]: {
          isFetching: true,
        }
      })
    case ActionTypes.PROJECTS_CLUSTER_ALL_GET_SUCCESS:
      const clusters = action.response.result.data.clusters || []
      return Object.assign({}, state, {
        [projectName]: {
          isFetching: false,
          data: clusters,
          total: action.response.result.data.listMeta.total,
        },
      })
    case ActionTypes.PROJECTS_CLUSTER_ALL_GET_FAILURE:
      return merge({}, state, {
        [projectName]: {
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
    projectList: projectList(state.projectList, action),
    projectClusterList: projectClusterList(state.projectClusterList, action),
  }
}