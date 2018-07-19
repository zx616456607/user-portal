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
const fetchBackupChain = (id, type, callback) => {
  return {
    [FETCH_API]: {
      types: [
        GET_BACKUPCHAIN_REQUEST,
        GET_BACKUPCHAIN_SUCCESS,
        GET_BACKUPCHAIN_FAILURE,
      ],
      endpoint: `${API_URL_PREFIX}/clusters/${id}/daas/${type}/backup`,
      schema: {},
    },
    callback,
    }
}

export const getbackupChain = (id: string, type: string, callback?: function) => {
  return dispatch => {
    dispatch (fetchBackupChain(id, type, callback))
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
      endpoint: `${API_URL_PREFIX}/clusters/${id}/daas/${type}/backup`,
      schema: {},
    },
    callback,
    }
}

// 创建备份链
export const CREATE_BACKUPCHAIN_REQUEST = 'CREATE_BACKUPCHAIN_REQUEST'
export const CREATE_BACKUPCHAIN_SUCCESS = 'CREATE_BACKUPCHAIN_SUCCESS'
export const CREATE_BACKUPCHAIN_FAILURE = 'CREATE_BACKUPCHAIN_FAILURE'

const createBackupChainRequest = (id, type, template, callback) => {
    return {
        [FETCH_API]: {
            types: [CREATE_BACKUPCHAIN_REQUEST, CREATE_BACKUPCHAIN_SUCCESS, CREATE_BACKUPCHAIN_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${id}/daas/${type}/backup`,
            schema: {},
            options: {
                headers: {
                    'Content-Type': 'text/plain',
                },
                method: 'POST',
                body: template,
            },
        },
        callback,
    }
}
export const createBackupChain = (id: string, type: string, template: string, callback) => {
    return dispatch => {
        dispatch (createBackupChainRequest(id, type, template, callback))
    }
}

// 获取备份链展开后的备份点： redis只能全量备份，所以该备份链展开后显示的备份点就是该备份链
export const getbackupChainDetail = (name: string, type: string, callback?: function) => {
    return (dispatch, getState) => {
        // redis里面点开的时候没必要再发请求了,因为当前数据就是要展开的数据
        if (type === 'redis') {
            const { chains } = getState().backupChain
            const { data } = chains
            const expendIndex = data.findIndex(v => {
                return `${v.metadata.name}` === name
            })
            const children = JSON.parse(JSON.stringify([data[expendIndex]]))
            const thisData = JSON.parse(JSON.stringify(data[expendIndex]))
            thisData.children = children
            data[expendIndex] = thisData
            dispatch ({
                type: GET_BACKUPCHAIN_DETAIL_SUCCESS,
                payload: data,
            })
        }
  }
}

// 删除手动备份链
export const DELETE_BACKUPCHAIN_REQUEST = 'DELETE_BACKUPCHAIN_REQUEST'
export const DELETE_BACKUPCHAIN_SUCCESS = 'DELETE_BACKUPCHAIN_SUCCESS'
export const DELETE_BACKUPCHAIN_FAILURE = 'DELETE_BACKUPCHAIN_FAILURE'

const deleteBackupChainRequest = (clusterId, type, name, callback) => {
    return {
        [FETCH_API]: {
            types: [DELETE_BACKUPCHAIN_REQUEST, DELETE_BACKUPCHAIN_SUCCESS, DELETE_BACKUPCHAIN_FAILURE],
            endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/daas/${type}/backup/${name}`,
            schema: {},
            options: {
                method: 'DELETE',
            },
        },
        callback,
    }
}
export const deleteManualBackupChain = (clusterId: string, type: string, name: string, callback) => {
    return dispatch => {
        dispatch (deleteBackupChainRequest(clusterId, type, name, callback))
    }
}
