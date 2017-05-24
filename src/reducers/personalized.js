/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for license
 *
 * v0.1 - 2017-05-19
 * @author Baiyu
 */

import * as ActionTypes from '../actions/personalized'
import reducerFactory from './factory'
// import merge from 'lodash/merge'

function backColor(state={},action) {
  const styles =[
    {
      logoBack: '#2b333d',
      slideBack: '#333c47'
    },
    {
      logoBack: '#33414e',
      slideBack: '#3b4b5a'
    },
    {
      logoBack: '#1e293d',
      slideBack: '#26334b'
    },
    {
      logoBack: '#2f323b',
      slideBack: '#383c46'
    },
    {
      logoBack: '#005691',
      slideBack: '#1063a5'
    },
    {
      logoBack: '#1e6c72',
      slideBack: '#287b85'
    },
    {
      logoBack: '#2db7f5',
      slideBack: '#4aa0e6'
    },
    {
      logoBack: '#05b287',
      slideBack: '#4aa0e6'
    },
    // default-1
    {
      logoBack: '#05b287',
      slideBack: '#4aa0e6'
    }
  ]
  const types = action.types || 0
  switch(action.type) {
    case ActionTypes.SET_BACK_COLOR:
      return styles[types]
    default:
      return styles[0]
  }

}

function copyright(state= false, action) {
  if (action.type === ActionTypes.SET_COPYRIGHT) {
    return action.types
  }
  return state
}

function info(state={result:{}},action) {

  switch(action.type) {
    case ActionTypes.GET_PERSONALIZED_REQUEST:{
      return Object.assign({}, state, {
          isFetching: true,
      })
    }
    case ActionTypes.GET_PERSONALIZED_SUCCESS:{
      return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result
      })
    }
    case ActionTypes.GET_PERSONALIZED_FAILURE:{
      return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result
      })
    }
    case ActionTypes.GET_DEFAULT_INFO_SUCCESS:{
      return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result
      })
    }
    default: return state

  }
}

export default function personalized(state = {info:{}}, action) {
  return {
    info: info(state.info, action),
    backColor: backColor(state.backColor, action),
    copyright: copyright(state.copyright,action)
  }
}