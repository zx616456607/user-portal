/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  config group
 *
 * v2.0 - 2016/11/07
 * @author  BaiYu
 */


import * as ActionTypes from '../actions/cicd_flow'
import merge from 'lodash/merge'
import { cloneDeep, findIndex } from 'lodash'
function codeRepo(state = {}, action) {
  const defaultState = {
      isFetching: false,
      repoList: []
  }
  switch (action.type) {
    case ActionTypes.GET_REPOS_LIST_REQUEST:
      return  merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.GET_REPOS_LIST_SUCCESS:
      return  merge({}, state, { 
        isFetching: false,
        repoList: action.response.result.data.results
      })
    case ActionTypes.GET_REPOS_LIST_FAILURE:
      return merge({}, defaultState, state, { isFetching: false })
// delete
    case ActionTypes.DELETE_REPOS_LIST_REQUEST:
      return  merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.DELETE_REPOS_LIST_SUCCESS:
      return ({ 
        isFetching: false,
        repoList: []
      })
    case ActionTypes.DELETE_REPOS_LIST_FAILURE:
      return merge({}, state, { isFetching: false })
// registry
    case ActionTypes.REGISTRY_CODE_REPO_REQUEST:
      return  merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.REGISTRY_CODE_REPO_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.REGISTRY_CODE_REPO_FAILURE:
      return merge({}, state, { isFetching: false })
    default:
      return state
  }
}

function getProject(state ={}, action) {
  const defaultState = {
      isFetching: false,
      projectList: []
  }
  switch (action.type) {
    case ActionTypes.GET_CODE_STORE_REQUEST:
      return  merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.GET_CODE_STORE_SUCCESS:
      return  merge({}, state, { 
        isFetching: false,
        projectList: action.response.result.data.results
      })
    case ActionTypes.GET_CODE_STORE_FAILURE:
      return merge({}, state, { isFetching: false })
// delete 
    case ActionTypes.DELETE_CODE_STORE_SUCCESS:
      const oldState = cloneDeep(state)
      const indexs = findIndex(oldState.projectList, (item)=> {
        return item.id == action.id
      })
      oldState.projectList.splice(indexs, 1)
      return  merge({}, oldState, { 
        isFetching: false,
      })
    case ActionTypes.DELETE_CODE_STORE_FAILURE:
      return merge({}, state, { isFetching: false })

    default:
      return state
  }
}

function getTenxflowList(state = {}, action) {
  const defaultState = {
    isFetching: false,
    flowList: []
  }
  switch (action.type) {
    case ActionTypes.GET_TENX_FLOW_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.GET_TENX_FLOW_LIST_SUCCESS:
      return Object.assign({}, state, {
          isFetching: false,
          flowList: action.response.result.data,
        }
      )
    case ActionTypes.GET_TENX_FLOW_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    default:
      return state
  }
}

export default function cicd_flow(state = {}, action) {
  return {
    codeRepo: codeRepo(state.codeRepo, action),
    managed: getProject(state.managed, action),
    getTenxflowList: getTenxflowList(state.getTenxflowList, action)
  }
}

