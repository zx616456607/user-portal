/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Redux actions for Backup
 *
 * v0.1 - 2018-07-12
 * @author zhouhaitao
 */
import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { CREATE_APP_SERVER_FAILURE, CREATE_APP_SERVER_REQUEST, CREATE_APP_SERVER_SUCCESS } from "./clusterAutoScaler";
import {object} from "prop-types";

// 获取备份链
export const GET_BACKUPCHAIN_REQUEST = 'GET_BACKUPCHAIN_REQUEST'
export const GET_BACKUPCHAIN_SUCCESS = 'GET_BACKUPCHAIN_SUCCESS'
export const GET_BACKUPCHAIN_FAILURE = 'GET_BACKUPCHAIN_FAILURE'
const fetchBackupChain = (id, type, name, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_BACKUPCHAIN_REQUEST,
        GET_BACKUPCHAIN_SUCCESS,
        GET_BACKUPCHAIN_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${id}/daas/${type}/${name}/backups`,
      schema: {},
    },
    callback,
    }
}

export const getbackupChain = (id: string, type: string, name: string, callback?: function) => {
  return dispatch => {
    dispatch (fetchBackupChain(id, type, name, callback))
  }
}

// 获取备份链详情
export const GET_BACKUPCHAIN_DETAIL_REQUEST = 'GET_BACKUPCHAIN_DETAIL_REQUEST'
export const GET_BACKUPCHAIN_DETAIL_SUCCESS = 'GET_BACKUPCHAIN_DETAIL_SUCCESS'
export const GET_BACKUPCHAIN_DETAIL_FAILURE = 'GET_BACKUPCHAIN_DETAIL_FAILURE'
const fetchBackupChainDetail = (id, type, callback) => {
  return {
    [FETCH_API]: {
      types: [
        CREATE_APP_SERVER_REQUEST,
        CREATE_APP_SERVER_SUCCESS,
        CREATE_APP_SERVER_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${id}/daas/${type}/backups`,
      schema: {},
    },
    callback,
    }
}

// 手动创建备份链
export const CREATE_BACKUPCHAIN_REQUEST = 'CREATE_BACKUPCHAIN_REQUEST'
export const CREATE_BACKUPCHAIN_SUCCESS = 'CREATE_BACKUPCHAIN_SUCCESS'
export const CREATE_BACKUPCHAIN_FAILURE = 'CREATE_BACKUPCHAIN_FAILURE'

const createBackupChainRequest = (id, type, name, body, callback) => {
    return {
        [FETCH_API]: {
            types: [CREATE_BACKUPCHAIN_REQUEST, CREATE_BACKUPCHAIN_SUCCESS, CREATE_BACKUPCHAIN_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${id}/daas/${type}/${name}/backups`,
            schema: {},
            options: {
                method: 'POST',
                body,
            },
        },
        callback,
    }
}
export const createBackupChain = (id: string, type: string, name: string, body: object, callback) => {
    return dispatch => {
        dispatch (createBackupChainRequest(id, type, name, body, callback))
    }
}

// 删除手动备份链
export const DELETE_BACKUPCHAIN_REQUEST = 'DELETE_BACKUPCHAIN_REQUEST'
export const DELETE_BACKUPCHAIN_SUCCESS = 'DELETE_BACKUPCHAIN_SUCCESS'
export const DELETE_BACKUPCHAIN_FAILURE = 'DELETE_BACKUPCHAIN_FAILURE'

const deleteBackupChainRequest = (clusterId, type, clusterName, name, callback) => {
    return {
        [FETCH_API]: {
            types: [DELETE_BACKUPCHAIN_REQUEST, DELETE_BACKUPCHAIN_SUCCESS, DELETE_BACKUPCHAIN_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${clusterName}/backups/${name}`,
            schema: {},
            options: {
                method: 'DELETE',
            },
        },
        callback,
    }
}
export const deleteManualBackupChain = (
    clusterId: string, type: string, clusterName: string, name: string, callback
) => {
    return dispatch => {
        dispatch (deleteBackupChainRequest(clusterId, type, clusterName, name, callback))
    }
}

// 检查是否有自动备份
export const CHECK_AUTO_BACKUP_EXIST_REQUEST = 'CHECK_AUTO_BACKUP_EXIST_REQUEST'
export const CHECK_AUTO_BACKUP_EXIST_SUCCESS = 'CHECK_AUTO_BACKUP_EXIST_SUCCESS'
export const CHECK_AUTO_BACKUP_EXIST_FAILURE = 'CHECK_AUTO_BACKUP_EXIST_FAILURE'

const checkAutoBackupExistRequest = (clusterId, type, name, callback) => {
    return {
        [FETCH_API]: {
            types: [CHECK_AUTO_BACKUP_EXIST_REQUEST, CHECK_AUTO_BACKUP_EXIST_SUCCESS, CHECK_AUTO_BACKUP_EXIST_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${name}/cronbackups`,
            schema: {},
        },
        callback,
    }
}
export const checkAutoBackupExist = (clusterId: string, type: string, name: string, callback) => {
    return dispatch => {
        dispatch (checkAutoBackupExistRequest(clusterId, type, name, callback))
    }
}

// 设置自动备份
export const AUTO_BACKUP_SET_REQUEST = 'AUTO_BACKUP_SET_REQUEST'
export const AUTO_BACKUP_SET_SUCCESS = 'AUTO_BACKUP_SET_SUCCESS'
export const AUTO_BACKUP_SET_FAILURE = 'AUTO_BACKUP_SET_FAILURE'

const autoBackupSetRequest = (clusterId, type, name, body, callback) => {
    return {
        [FETCH_API]: {
            types: [AUTO_BACKUP_SET_REQUEST, AUTO_BACKUP_SET_SUCCESS, AUTO_BACKUP_SET_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${name}/cronbackups`,
            schema: {},
            options: {
                method: 'POST',
                body,
            },
        },
        callback,
    }
}
export const autoBackupSet = (clusterId: string, type: string, name: string, body: object, callback) => {
    return dispatch => {
        dispatch (autoBackupSetRequest(clusterId, type, name, body, callback))
    }
}

// 修改自动备份
export const UPDATE_BACKUP_SET_REQUEST = 'UPDATE_BACKUP_SET_REQUEST'
export const UPDATE_BACKUP_SET_SUCCESS = 'UPDATE_BACKUP_SET_SUCCESS'
export const UPDATE_BACKUP_SET_FAILURE = 'UPDATE_BACKUP_SET_FAILURE'

const updateAutoBackupSetRequest = (clusterId, type, name, body, callback) => {
    return {
        [FETCH_API]: {
            types: [UPDATE_BACKUP_SET_REQUEST, UPDATE_BACKUP_SET_SUCCESS, UPDATE_BACKUP_SET_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${name}/cronbackups`,
            schema: {},
            options: {
                method: 'PUT',
                body,
            },
        },
        callback,
    }
}
export const updateAutoBackupSet = (clusterId: string, type: string, name: string, body: object, callback) => {
    return dispatch => {
        dispatch (updateAutoBackupSetRequest(clusterId, type, name, body, callback))
    }
}

// 关闭自动备份
export const AUTO_BACKUP_DELETE_REQUEST = 'AUTO_BACKUP_DELETE_REQUEST'
export const AUTO_BACKUP_DELETE_SUCCESS = 'AUTO_BACKUP_DELETE_SUCCESS'
export const AUTO_BACKUP_DELETE_FAILURE = 'AUTO_BACKUP_DELETE_FAILURE'

const autoBackupDeleteRequest = (clusterId, type, clusterName, name, callback) => {
    return {
        [FETCH_API]: {
            types: [AUTO_BACKUP_DELETE_REQUEST, AUTO_BACKUP_DELETE_SUCCESS, AUTO_BACKUP_DELETE_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${clusterName}/cronbackups/${name}`,
            schema: {},
            options: {
                method: 'DELETE',
            },
        },
        callback,
    }
}
export const autoBackupDetele = (clusterId: string, type: string, clusterName: string, name: string, callback) => {
    return dispatch => {
        dispatch (autoBackupDeleteRequest(clusterId, type, clusterName, name, callback))
    }
}

// 回滚
export const ROLLBACK_REQUEST = 'ROLLBACK_REQUEST'
export const ROLLBACK_SUCCESS = 'ROLLBACK_SUCCESS'
export const ROLLBACK_FAILURE = 'ROLLBACK_FAILURE'

const rollbackRequest = (clusterId, type, pointName, body, callback) => {
    return {
        [FETCH_API]: {
            types: [ROLLBACK_REQUEST, ROLLBACK_SUCCESS, ROLLBACK_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/${pointName}/restores`,
            schema: {},
            options: {
                method: 'POST',
                body,
            },
        },
        callback,
    }
}
export const postRollback = (clusterId: string, type: string, pointName: string, body: object, callback) => {
    return dispatch => {
        dispatch (rollbackRequest(clusterId, type, pointName, body, callback))
    }
}
