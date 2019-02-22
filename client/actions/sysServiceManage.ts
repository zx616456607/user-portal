/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for sysServiceManage
 *
 * v0.1 - 2018-12-24
 * @author songsz
 */

import { FETCH_API } from '../../src/middleware/api';
import { API_URL_PREFIX } from '../../src/constants';
import { toQuerystring } from '../../src/common/tools'

export const SYS_SERVICE_MANAGE_RESTART_REQUEST = 'SYS_SERVICE_MANAGE_RESTART_REQUEST';
export const SYS_SERVICE_MANAGE_RESTART_SUCCESS = 'SYS_SERVICE_MANAGE_RESTART_SUCCESS';
export const SYS_SERVICE_MANAGE_RESTART_FAILURE = 'SYS_SERVICE_MANAGE_RESTART_FAILURE';

const fetchQuickRestartServices = (cluster, serviceList, callback) => {
    return {
        cluster,
        [FETCH_API]: {
            types: [
                SYS_SERVICE_MANAGE_RESTART_REQUEST,
                SYS_SERVICE_MANAGE_RESTART_SUCCESS,
                SYS_SERVICE_MANAGE_RESTART_FAILURE,
            ],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-quickrestart`,
            options: {
                method: 'PUT',
                body: serviceList,
                headers: {
                  teamspace: 'kube-system',
                },
            },
            schema: {},
        },
        callback,
    }
};

export const quickRestartServices = (cluster, serviceList, callback) => dispatch =>
    dispatch(fetchQuickRestartServices(cluster, serviceList, callback))

export const SYS_SERVICE_MANAGE_LIST_REQUEST = 'SYS_SERVICE_MANAGE_LIST_REQUEST';
export const SYS_SERVICE_MANAGE_LIST_SUCCESS = 'SYS_SERVICE_MANAGE_LIST_SUCCESS';
export const SYS_SERVICE_MANAGE_LIST_FAILURE = 'SYS_SERVICE_MANAGE_LIST_FAILURE';

const fetchSysList = (cluster, callback) => {
    return {
        cluster,
        [FETCH_API]: {
            types: [
                SYS_SERVICE_MANAGE_LIST_REQUEST,
                SYS_SERVICE_MANAGE_LIST_SUCCESS,
                SYS_SERVICE_MANAGE_LIST_FAILURE,
            ],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}/sysServiceManage`,
            options: {
                method: 'GET',
            },
            schema: {},
        },
        callback,
    }
};

export const getSysList = (cluster, callback) => dispatch =>
    dispatch(fetchSysList(cluster, callback))

// 获取监控
export const SYS_SERVICE_MANAGE_MONITOR_REQUEST = 'SYS_SERVICE_MANAGE_MONITOR_REQUEST'
export const SYS_SERVICE_MANAGE_MONITOR_SUCCESS = 'SYS_SERVICE_MANAGE_MONITOR_SUCCESS'
export const SYS_SERVICE_MANAGE_MONITOR_FAILURE = 'SYS_SERVICE_MANAGE_MONITOR_FAILURE'
export const getSysMonitor = (cluster, pods, query, switchFetchType, callback) => dispatch => dispatch({
    cluster,
    [FETCH_API]: {
        types: [
            SYS_SERVICE_MANAGE_MONITOR_REQUEST,
            SYS_SERVICE_MANAGE_MONITOR_SUCCESS,
            SYS_SERVICE_MANAGE_MONITOR_FAILURE,
        ],
        endpoint: `${API_URL_PREFIX}/clusters/${cluster}/sysServiceManage/${
            pods}/metrics?${toQuerystring(query)}`,
        options: {
            headers: {
                teamspace: 'kube-system',
            },
        },
        schema: {},
    },
    callback,
    switchFetchType,
})

// logs
export const SYS_SERVICE_MANAGE_LOGS_REQUEST = 'SYS_SERVICE_MANAGE_LOGS_REQUEST'
export const SYS_SERVICE_MANAGE_LOGS_SUCCESS = 'SYS_SERVICE_MANAGE_LOGS_SUCCESS'
export const SYS_SERVICE_MANAGE_LOGS_FAILURE = 'SYS_SERVICE_MANAGE_LOGS_FAILURE'
export const getSysLogs = (cluster, instances, body, callback) => dispatch => dispatch({
    cluster,
    [FETCH_API]: {
        types: [
            SYS_SERVICE_MANAGE_LOGS_REQUEST,
            SYS_SERVICE_MANAGE_LOGS_SUCCESS,
            SYS_SERVICE_MANAGE_LOGS_FAILURE,
        ],
        endpoint: `${API_URL_PREFIX}/clusters/${cluster}/logs/instances/${instances}/logs`,
        options: {
            headers: { teamspace: 'kube-system' },
            method: 'POST',
            body,
        },
        schema: {},
    },
    callback,
})

// get Deployment/DaemonSet instance
export const SYS_SERVICE_MANAGE_INSTANCE_REQUEST = 'SYS_SERVICE_MANAGE_INSTANCE_REQUEST'
export const SYS_SERVICE_MANAGE_INSTANCE_SUCCESS = 'SYS_SERVICE_MANAGE_INSTANCE_SUCCESS'
export const SYS_SERVICE_MANAGE_INSTANCE_FAILURE = 'SYS_SERVICE_MANAGE_INSTANCE_FAILURE'
export const sysServiceInstance = (cluster, type, name, callback) => {
    const suffix = type === 'Pod' ? `/containers/${name}/detail` : `/native/${type}/${name}/instances`
    return {
        cluster,
        [FETCH_API]: {
            types: [ SYS_SERVICE_MANAGE_INSTANCE_REQUEST,
                SYS_SERVICE_MANAGE_INSTANCE_SUCCESS, SYS_SERVICE_MANAGE_INSTANCE_FAILURE ],
            endpoint: `${API_URL_PREFIX}/clusters/${cluster}${suffix}`,
            schema: {},
            options: {
                method: 'GET',
                headers: {
                    teamspace: 'kube-system',
                },
            },
        },
        callback,
    }
}
