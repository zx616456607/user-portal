/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Utilities for reducer
 *
 * v0.1 - 2017-01-18
 * @author Zhangpc
 */

import { getValue } from '../common/tools'

/**
 * Merge state by front-end customization requirements
 *
 * @export
 * @param {Array} state
 * @param {Array} newState
 * @param {String} key
 * @param {Object} options
 * @returns {Array}
 */
export function mergeStateByOpts(state, newState, key, options) {
  if (!options || !key) {
    return newState
  }
  const { keepChecked } = options
  if (!keepChecked) {
    return newState
  }
  newState.map(nItem => {
    let nValue = getValue(nItem, key)
    state.map(item => {
      if (getValue(item, key) === nValue) {
        keepChecked && (nItem.checked = item.checked)
      }
    })
  })
  return newState
}