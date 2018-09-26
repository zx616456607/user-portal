/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * reducers for Backup
 *
 * v0.1 - 2018-07-12
 * @author zhouhaitao
 */
import * as ActionsType from '../actions/backupChain'

function chains(state = {}, action: any) {
  switch (action.type) {
    case ActionsType.GET_BACKUPCHAIN_REQUEST:
      return {
        isFetching: true,
      }
    case ActionsType.GET_BACKUPCHAIN_SUCCESS:
      const data = action.response.result.data.items
      const rollbackComplete = action.response.result.data.rollBack
      return {
        isFetching: false,
        data,
        rollbackComplete,
      }
    case ActionsType.GET_BACKUPCHAIN_FAILURE:
      return {
        isFetching: false,
        rollbackComplete: false,
      }
    case ActionsType.ROLLBACK_REQUEST:
      return {
        ...state,
        rollbackComplete: true,
      }
    case ActionsType.ROLLBACK_SUCCESS:
      return {
        ...state,
        rollbackComplete: false,
      }
    case ActionsType.ROLLBACK_FAILURE:
      return {
        ...state,
        rollbackComplete: false,
      }
    default:
      return state
  }
}

// 自动备份链，对应的是antion内的检查是否有自动备份链
const autoBackupInitial = {
  isFetching: false,
  data: [],
}
function autoBackupChains(state = autoBackupInitial, action: any) {
  switch (action.type) {
    case ActionsType.CHECK_AUTO_BACKUP_EXIST_REQUEST:
      return {
        isFetching: true,
        data: [],
      }
    case ActionsType.CHECK_AUTO_BACKUP_EXIST_SUCCESS:
      const data = action.response.result.data
      return {
        isFetching: false,
        data,
      }
    case ActionsType.CHECK_AUTO_BACKUP_EXIST_FAILURE:
      return {
        isFetching: false,
        data: [],
      }
    default:
      return state
  }
}

const rollbackRecordInitial = {
  isFetching: false,
  data: [],
}
function rollbackRecord(state = rollbackRecordInitial, action: any) {
  switch (action.type) {
    case ActionsType.ROLLBACK_RECORD_REQUEST:
      return {
        isFetching: true,
        data: [],
      }
    case ActionsType.ROLLBACK_RECORD_SUCCESS:
      const data = action.response.result.data.items || []
      return {
        isFetching: false,
        data,
      }
    case ActionsType.ROLLBACK_RECORD_FAILURE:
      return {
        isFetching: false,
        data: [],
      }
    default:
      return state
  }
}
export default function backupChain(state = {}, action) {
  return {
    chains: chains(state.chains, action),
    autoBackupChains : autoBackupChains(state.autoBackupChains, action),
    rollbackRecord : rollbackRecord(state.rollbackRecord, action),
  }
}
