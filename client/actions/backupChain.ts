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
import {CREATE_APP_SERVER_FAILURE, CREATE_APP_SERVER_REQUEST, CREATE_APP_SERVER_SUCCESS} from "./clusterAutoScaler";

// 获取备份链
export const GET_BACKUPCHAIN_REQUEST = 'GET_BACKUPCHAIN_REQUEST'
export const GET_BACKUPCHAIN_SUCCESS = 'GET_BACKUPCHAIN_SUCCESS'
export const GET_BACKUPCHAIN_FAILURE = 'GET_BACKUPCHAIN_FAILURE'
// const fetchBackupChainDetail = (id, callback) => {
//   return {
//     [FETCH_API]: {
//       types: [
//         GET_BACKUPCHAIN_REQUEST,
//         GET_BACKUPCHAIN_SUCCESS,
//         GET_BACKUPCHAIN_FAILURE,
//       ],
//       endpoint: `${API_URL_PREFIX}/clusters/autoscaler/server`,
//       schema: {},
//       options: {
//         method: 'POST',
//         body,
//       },
//     },
//     callback,
//     }
// }

export const getbackupChain = (id: string, callback?: function) => {
  return dispatch => {
    dispatch ({
      type: GET_BACKUPCHAIN_SUCCESS,
    })
  }
}

// 获取备份链详情
export const GET_BACKUPCHAIN_DETAIL_REQUEST = 'GET_BACKUPCHAIN_DETAIL_REQUEST'
export const GET_BACKUPCHAIN_DETAIL_SUCCESS = 'GET_BACKUPCHAIN_DETAIL_SUCCESS'
export const GET_BACKUPCHAIN_DETAIL_FAILURE = 'GET_BACKUPCHAIN_DETAIL_FAILURE'
// const fetchBackupChainDetail = (id, callback) => {
//   return {
//     [FETCH_API]: {
//       types: [
//         CREATE_APP_SERVER_REQUEST,
//         CREATE_APP_SERVER_SUCCESS,
//         CREATE_APP_SERVER_FAILURE,
//       ],
//       endpoint: `${API_URL_PREFIX}/clusters/autoscaler/server`,
//       schema: {},
//       options: {
//         method: 'POST',
//         body,
//       },
//     },
//     callback,
//     }
// }

export const getbackupChainDetail = (id: string, callback?: function) => {

    return (dispatch, getState) => {
        const { chains } = getState().backupChain
        const { data } = chains
        const expendIndex = data.findIndex(v => {
          return `${v.id}` === id
        })
        data[expendIndex].children = [
            {
                time: '2018-05-30T17:11:43+08:00',
                size: '3MB',
                type: '增量备份（手动）',
                status: 0,
                backupType: '1',
                id: 1,
            },
            {
                time: '2018-05-30T17:11:43+08:00',
                size: '3MB',
                type: '增量备份（手动）',
                status: 1,
                backupType: '2',
                id: 2,
            },
            {
                time: '2018-05-30T17:11:43+08:00',
                size: '3MB',
                type: '增量备份（手动）',
                status: 2,
                backupType: '4',
                id: 3,
            },
            {
                time: '2018-05-30T17:11:43+08:00',
                size: '3MB',
                type: '全量备份（手动）',
                backupType: '5',
                status: 1,
                id: 4,
            },
        ]
        dispatch ({
            type: GET_BACKUPCHAIN_DETAIL_SUCCESS,
            payload: data,
        })
  }
}
