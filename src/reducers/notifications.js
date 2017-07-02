/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */

/**
 * Reducer of notifications
 *
 * v0.1 - 2017-06-27
 * @author Zhangpc
 */

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

export default function notifications(state = {}, action) {
  const { type, key, content } = action
  let oldState
  switch (type) {
    case 'ADD_NOTIFICATION':
      return Object.assign({}, state, {
        [key]: content,
      })
    case 'DELETE_NOTIFICATION':
      oldState = cloneDeep(state)
      delete oldState[key]
      return oldState
    case 'UPDATE_NOTIFICATION':
      return merge({}, state, {
        [key]: content,
      })
    default:
      return state
  }
}
