/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for vm_terminal & log
 *
 * v0.1 - 2018-12-13
 * @author songsz
 */

import * as ActionTypes from '../actions/vmTerminalNLog'

const terminal = (state = {
  data: {},
}, action) => {
  switch (action.type) {
    case ActionTypes.VM_TERM_LOG_UPDATE_TERM:
      return { ...state, ...action.data }
    default:
      return state;
  }
}


const log = (state = {
  show: false,
  data: {},
  tomcatList: [],
  selectTomcat: '',
}, action) => {
  switch (action.type) {
    case ActionTypes.VM_TERM_LOG_UPDATE_LOG:
      return { ...state, ...action.data }
    default:
      return state;
  }
}

const vmTerminalNLog = (state = {}, action) => ({
  term: terminal(state.term, action),
  log: log(state.log, action),
})
export default vmTerminalNLog
