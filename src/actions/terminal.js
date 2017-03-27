/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for web terminal
 *
 * v0.1 - 2017-03-27
 * @author Zhangpc
 */

export const ADD_TERMINAL_ITEM = 'ADD_TERMINAL_ITEM'

// Add terminal item to terminal list
export function addTerminal(cluster, item, callback) {
  return {
    cluster,
    item,
    type: ADD_TERMINAL_ITEM,
    callback
  }
}

export const UPDATE_TERMINAL_ITEM = 'UPDATE_TERMINAL_ITEM'

// Add terminal item to terminal list
export function updateTerminal(cluster, item, callback) {
  return {
    cluster,
    item,
    type:  UPDATE_TERMINAL_ITEM,
    callback
  }
}


export const REMOVE_TERMINAL_ITEM = 'REMOVE_TERMINAL_ITEM'

// Remove terminal item from terminal list
export function removeTerminal(cluster, item, callback) {
  return {
    cluster,
    item,
    type: REMOVE_TERMINAL_ITEM,
    callback
  }
}

export const REMOVE_ALL_TERMINAL_ITEM = 'REMOVE_ALL_TERMINAL_ITEM'

// Remove terminal item from terminal list
export function removeAllTerminal(cluster, callback) {
  return {
    cluster,
    type: REMOVE_ALL_TERMINAL_ITEM,
    callback
  }
}