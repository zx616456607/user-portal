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
      return merge({}, state, { 
          isFetching: false,
          repoList: null
        })
    // delete
    case ActionTypes.DELETE_REPOS_LIST_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.DELETE_REPOS_LIST_SUCCESS:
      return ({
        isFetching: false,
        repoList:null,
        bak: null
      })
    case ActionTypes.DELETE_REPOS_LIST_FAILURE:
      return merge({}, state, { isFetching: false })
    // registry
    case ActionTypes.REGISTRY_CODE_REPO_REQUEST:
      return merge({}, defaultState, state, { isFetching: false })
    case ActionTypes.REGISTRY_CODE_REPO_SUCCESS:
      return merge({}, state, { isFetching: false })
    case ActionTypes.REGISTRY_CODE_REPO_FAILURE:
      return merge({}, state, { isFetching: false })

    // search 
    case ActionTypes.SEARCH_CODE_REPO_LIST:
      const newState = cloneDeep(state)
      if (action.codeName == '') {
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
  // add active
    case ActionTypes.ADD_CODE_STORE_SUCCESS:
      const addState = cloneDeep(state)
      const indexs = findIndex(addState.repoList, (item) => {
        return item.name == action.names
      })
      addState.repoList[indexs].active = 1
      return addState
    default:
      return state
  }
}

function getProject(state = {}, action) {
  const defaultState = {
    isFetching: false,
    projectList: [],
  }
  switch (action.type) {
    case ActionTypes.GET_CODE_STORE_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.GET_CODE_STORE_SUCCESS:
      return merge({}, state, {
        isFetching: false,
        projectList: action.response.result.data.results,
        bak: action.response.result.data.results
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
      oldState.bak = oldState.projectList
      return {
        ...oldState
      }
    case ActionTypes.DELETE_CODE_STORE_FAILURE:
      return merge({}, state, { isFetching: false })
    // search 
    case ActionTypes.SEARCH_CODE_STORE_LIST:
      const newState = cloneDeep(state)
      if (action.codeName == '') {
        newState.projectList = newState.bak
      }
      const temp = newState.projectList.filter(list => {
        const search = new RegExp(action.codeName)
        if (search.test(list.name)) {
          return true
        }
        return false
      })
      newState.projectList = temp
      return {
        ...newState
      }
    // filter
    case ActionTypes.FILTER_CODE_STORE_LIST:
      const filterState = cloneDeep(state)
      if (action.types == 'all') {
        filterState.projectList = filterState.bak
        return {  ...filterState }
      }
      const lists = filterState.bak.filter(list => {
        if (list.isPrivate == action.types) {
          return true
        }
        return false
      })
      filterState.projectList = lists
      return {
        ...filterState
      }
    default:
      return state
  }
}
function getUserInfo(state = {}, action) {
  const defaultState = {
    isFetching: false,
    repoUser: {username:'',depot:''}
  }
  switch (action.type) {
    case ActionTypes.GET_REPO_USER_INFO_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_REPO_USER_INFO_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        repoUser: action.response.result.data.results,
      }
      )
    case ActionTypes.GET_REPO_USER_INFO_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
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
    userInfo: getUserInfo(state.userInfo, action),
    createTenxFlowSingle: reducerFactory({
      REQUEST: ActionTypes.CREATE_SINGLE_TENX_FLOW_REQUEST,
      SUCCESS: ActionTypes.CREATE_SINGLE_TENX_FLOW_SUCCESS,
      FAILURE: ActionTypes.CREATE_SINGLE_TENX_FLOW_FAILURE
    }, state.createTenxFlowSingle, action),
    updateTenxFlowAlert: reducerFactory({
      REQUEST: ActionTypes.UPDATE_TENX_FLOW_ALERT_REQUEST,
      SUCCESS: ActionTypes.UPDATE_TENX_FLOW_ALERT_SUCCESS,
      FAILURE: ActionTypes.UPDATE_TENX_FLOW_ALERT_FAILURE
    }, state.updateTenxFlowAlert, action),
    deleteTenxFlowSingle: reducerFactory({
      REQUEST: ActionTypes.DELETE_SINGLE_TENX_FLOW_REQUEST,
      SUCCESS: ActionTypes.DELETE_SINGLE_TENX_FLOW_SUCCESS,
      FAILURE: ActionTypes.DELETE_SINGLE_TENX_FLOW_FAILURE
    }, state.deleteTenxFlowSingle, action),
  }
}

