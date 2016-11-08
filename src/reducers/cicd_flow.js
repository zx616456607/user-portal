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
import reducerFactory from './factory'
import { cloneDeep, findIndex } from 'lodash'
function codeRepo(state = {}, action) {
  const defaultState = {
    isFetching: false,
    repoList: []
  }
  switch (action.type) {
    case ActionTypes.GET_REPOS_LIST_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.GET_REPOS_LIST_SUCCESS:
      return merge({}, state, {
        isFetching: false,
        repoList: action.response.result.data.results,
        bak: action.response.result.data.results
      })
    case ActionTypes.GET_REPOS_LIST_FAILURE:
      return merge({}, defaultState, state, { isFetching: false })
    // delete
    case ActionTypes.DELETE_REPOS_LIST_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.DELETE_REPOS_LIST_SUCCESS:
      return ({
        isFetching: false,
        repoList: [],
        bak: []
      })
    case ActionTypes.DELETE_REPOS_LIST_FAILURE:
      return merge({}, state, { isFetching: false })
    // registry
    case ActionTypes.REGISTRY_CODE_REPO_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.REGISTRY_CODE_REPO_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.REGISTRY_CODE_REPO_FAILURE:
      return merge({}, state, { isFetching: false })

    // search 
    case ActionTypes.SEARCH_CODE_REPO_LIST:
      const newState = cloneDeep(state)
      if(newState.bak && newState.bak.length >0 && state.repoList.length !== state.bak.length) {
        newState.repoList = newState.bak
      }
      const temp = newState.repoList.filter(list => {
        const search = new RegExp(action.codeName)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      newState.repoList = temp
      return {
        ...newState
      }
    default:
      return state
  }
}

function getProject(state = {}, action) {
  const defaultState = {
    isFetching: false,
    projectList: []
  }
  switch (action.type) {
    case ActionTypes.GET_CODE_STORE_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.GET_CODE_STORE_SUCCESS:
      return merge({}, state, {
        isFetching: false,
        projectList: action.response.result.data.results
      })
    case ActionTypes.GET_CODE_STORE_FAILURE:
      return merge({}, state, { isFetching: false })
    // delete 
    case ActionTypes.DELETE_CODE_STORE_SUCCESS:
      const oldState = cloneDeep(state)
      const indexs = findIndex(oldState.projectList, (item) => {
        return item.id == action.id
      })
      oldState.projectList.splice(indexs, 1)
      return merge({}, oldState, {
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
    total: 0,
    flowList: []
  }
  switch (action.type) {
    case ActionTypes.GET_TENX_FLOW_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_TENX_FLOW_LIST_SUCCESS:
      return Object.assign({}, state, {
          isFetching: false,
          flowList: action.response.result.data.results,
          total: action.response.result.data.total
        }
      )
    case ActionTypes.GET_TENX_FLOW_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getTenxflowDetail(state = {}, action) {
  const defaultState = {
    isFetching: false,
    flowInfo: {}
  }
  switch (action.type) {
    case ActionTypes.GET_SINGLE_TENX_FLOW_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_SINGLE_TENX_FLOW_SUCCESS:
      return Object.assign({}, state, {
          isFetching: false,
          flowInfo: action.response.result.data.results
        }
      )
    case ActionTypes.GET_SINGLE_TENX_FLOW_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export default function cicd_flow(state = {}, action) {
  return {
    codeRepo: codeRepo(state.codeRepo, action),
    managed: getProject(state.managed, action),
    getTenxflowList: getTenxflowList(state.getTenxflowList, action),
    getTenxflowDetail: getTenxflowDetail(state.getTenxflowDetail, action),
    deleteTenxFlowSingle: reducerFactory({
      REQUEST: ActionTypes.DELETE_SINGLE_TENX_FLOW_REQUEST,
      SUCCESS: ActionTypes.DELETE_SINGLE_TENX_FLOW_SUCCESS,
      FAILURE: ActionTypes.DELETE_SINGLE_TENX_FLOW_FAILURE
    }, state.deleteTenxFlowSingle, action),
    createTenxFlowSingle: reducerFactory({
      REQUEST: ActionTypes.CREATE_SINGLE_TENX_FLOW_REQUEST,
      SUCCESS: ActionTypes.CREATE_SINGLE_TENX_FLOW_SUCCESS,
      FAILURE: ActionTypes.CREATE_SINGLE_TENX_FLOW_FAILURE
    }, state.createTenxFlowSingle, action),
  }
}

