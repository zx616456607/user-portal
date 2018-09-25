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
      return {
        isFetching: false,
        data,
      }
    case ActionsType.GET_BACKUPCHAIN_FAILURE:
      return {
        isFetching: false,
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
  data: [
    {
      startTime: 1526069282000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1526069582000,
    },
    {
      startTime: 1529007182000,
      status: '1',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1529046782000,
    },
    {
      startTime: 1530591182000,
      status: '2',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1530605582000,
    },
    {
      startTime: 1530864782000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1531440782000,
    },
    {
      startTime: 1531908782000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1531994942000,
    },
    {
      startTime: 1534691342000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1534691522000,
    },
    {
      startTime: 1526915522000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1525273922000,
    },
    {
      startTime: 1534032722000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1534036085000,
    },
    {
      startTime: 1531685285000,
      status: '0',
      whichBackup: 'afdfsddfsfdsfdsfdsfdsfdssdffse',
      whichChain: 'eddxcfsdfsdfdsfdsfdsfdssasda',
      endTime: 1531688885000,
    },
    {
      startTime: 1537045565000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1537121165000,
    },
    {
      startTime: 1529172485000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1529172525000,
    },
    {
      startTime: 1525802925000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1525803285000,
    },
    {
      startTime: 1537856085000,
      status: '0',
      whichBackup: 'ase',
      whichChain: 'edda',
      endTime: 1537859325000,
    },
  ],
}
function rollbackRecord(state = rollbackRecordInitial, action: any) {
  switch (action.type) {
    case ActionsType.ROLLBACK_RECORD_REQUEST:
      return {
        isFetching: true,
        data: [],
      }
    case ActionsType.ROLLBACK_RECORD_SUCCESS:
      // const data = action.response.result.data
      return {
        isFetching: false,
        data: [],
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
    rollbackRecord : rollbackRecord(state.rollbackRecordInitial, action),
  }
}
