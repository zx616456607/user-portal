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
                  project: 'kube-system',
                },
            },
            schema: {},
        },
        callback,
    }
};

export const quickRestartServices = (cluster, serviceList, callback) => dispatch =>
    dispatch(fetchQuickRestartServices(cluster, serviceList, callback))
