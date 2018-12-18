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
  data: [],
  select: '',
}, action) => {
  switch (action.type) {
    case ActionTypes.VM_TERM_LOG_UPDATE_TERM:
      return { ...state, ...action.data }
    case ActionTypes.VM_TERM_LOG_ADD_TERM:
      return state.data.filter(d => d.vminfoId === action.data.vminfoId).length > 0
        ? { ...state, select: action.data.vminfoId }
        : { data: state.data.concat(action.data), select: action.data.vminfoId }
    case ActionTypes.VM_TERM_LOG_DELETE_TERM: {
      const data = state.data.filter(d => d.vminfoId !== action.data)
      let select = ''
      data.length > 0 && (select = state.select === action.data ? data[0].vminfoId : state.select)
      return { data, select }
    }
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
