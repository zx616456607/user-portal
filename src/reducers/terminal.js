/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for web terminal
 *
 * v0.1 - 2017-03-27
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/terminal'
import merge from 'lodash/merge'
import union from 'lodash/union'
import cloneDeep from 'lodash/cloneDeep'

function list(state, action) {
  const { cluster, item } = action
  const oldList = cloneDeep(state[cluster]) || []
  let existFlag = false
  switch (action.type) {
    case ActionTypes.ADD_TERMINAL_ITEM:
    case ActionTypes.UPDATE_TERMINAL_ITEM:
      oldList.every(oldItem => {
        if (oldItem.metadata.name === item.metadata.name) {
          merge(oldItem, item)
          existFlag = true
          return false
        }
        return true
      })
      if (!existFlag) {
        return Object.assign({}, state, {
          [cluster]: union([], oldList, [item])
        })
      }
      return Object.assign({}, state, {
        [cluster]: oldList
      })
    default:
      return state
  }
}

function active(state, action) {
  const { cluster, item } = action
  switch (action.type) {
    case ActionTypes.ADD_TERMINAL_ITEM:
      return Object.assign({}, state, {
        [cluster]: item.metadata.name
      })
    default:
      return state
  }
}

export default function terminal(state = {
  list: {},
  active: {},
}, action) {
  return {
    list: list(state.list, action),
    active: active(state.active, action),
  }
}