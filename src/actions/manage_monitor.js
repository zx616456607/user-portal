/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for manage monitor
 *
 * v0.1 - 2016-11-01
 * @author GaoJian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import {toQuerystring} from "../common/tools";

export const GET_MANAGE_MONITOR_LOG_REQUEST = 'GET_MANAGE_MONITOR_LOG_REQUEST'
export const GET_MANAGE_MONITOR_LOG_SUCCESS = 'GET_MANAGE_MONITOR_LOG_SUCCESS'
export const GET_MANAGE_MONITOR_LOG_FAILURE = 'GET_MANAGE_MONITOR_LOG_FAILURE'

function fetchOperationLogList(body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_MANAGE_MONITOR_LOG_REQUEST, GET_MANAGE_MONITOR_LOG_SUCCESS, GET_MANAGE_MONITOR_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/manage-monitor/getOperationAuditLog`,
      options: {
        method: 'POST',
        body: {
          from: body.from,
          size: body.size,
          namespace: body.namespace,
          operation: body.operation,
          resource: body.resource,
          start_time: body.start_time,
          end_time: body.end_time,
          status: body.status
        },
        headers: { teamspace: body.projectName }
      },
      schema: {}
    },
    callback
  }
}
export function getOperationLogList(body, callback) {
  return (dispatch) => {
    return dispatch(fetchOperationLogList(body, callback))
  }
}

// 获取操作对象
export const GET_OPERATIONAL_TARGET_REQUEST = 'GET_OPERATIONAL_TARGET_REQUEST'
export const GET_OPERATIONAL_TARGET_SUCCESS = 'GET_OPERATIONAL_TARGET_SUCCESS'
export const GET_OPERATIONAL_TARGET_FAILURE = 'GET_OPERATIONAL_TARGET_FAILURE'

function fetchOperationalTarget() {
  return {
    [FETCH_API]: {
      types: [ GET_OPERATIONAL_TARGET_REQUEST, GET_OPERATIONAL_TARGET_SUCCESS, GET_OPERATIONAL_TARGET_FAILURE ],
      endpoint: `${API_URL_PREFIX}/audits/menus`,
      schema: {}
    }
  }
}

export function getOperationalTarget() {
  return dispatch => dispatch(fetchOperationalTarget())
}

// 获取操作类型
export const GET_OPERATIONAL_TYPE_REQUEST = 'GET_OPERATIONAL_TYPE_REQUEST'
export const GET_OPERATIONAL_TYPE_SUCCESS = 'GET_OPERATIONAL_TYPE_SUCCESS'
export const GET_OPERATIONAL_TYPE_FAILURE = 'GET_OPERATIONAL_TYPE_FAILURE'

function fetchOperationalType() {
  return {
    [FETCH_API]: {
      types: [ GET_OPERATIONAL_TYPE_REQUEST, GET_OPERATIONAL_TYPE_SUCCESS, GET_OPERATIONAL_TYPE_FAILURE ],
      endpoint: `${API_URL_PREFIX}/manage-monitor/getOperationTargetLog`,
      schema: {}
    }
  }
}

export function getOperationalType() {
  return dispatch => dispatch(fetchOperationalType())
}

export const GET_QUERY_LOG_REQUEST = 'GET_QUERY_LOG_REQUEST'
export const GET_QUERY_LOG_SUCCESS = 'GET_QUERY_LOG_SUCCESS'
export const GET_QUERY_LOG_FAILURE = 'GET_QUERY_LOG_FAILURE'

function fetchQueryLogList(cluster, instances, body, callback) {
  let headers
  if (body.namespace) {
    headers = {
      onbehalfuser: body.namespace,
    }
  }
  return {
    direction: body.direction,
    [FETCH_API]: {
      types: [GET_QUERY_LOG_REQUEST, GET_QUERY_LOG_SUCCESS, GET_QUERY_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/instances/${instances}/getSearchLog`,
      options: {
        method: 'POST',
        body: {
          kind: 'pod',
          from: body.from,
          size: body.size,
          keyword: body.keyword,
          date_start: body.date_start,
          date_end: body.date_end,
          log_type: body.log_type,
          time_nano: body.time_nano,
          direction: body.direction,
          filename: body.filename,
          wildcard: body.wildcard,
        },
        headers,
      },
      schema: {}
    },
    callback
  }
}

export function getQueryLogList(cluster, instances, body, callback) {
  return (dispatch) => {
    return dispatch(fetchQueryLogList(cluster, instances, body, callback))
  }
}

export const GET_SERVICE_QUERY_LOG_REQUEST = 'GET_SERVICE_QUERY_LOG_REQUEST'
export const GET_SERVICE_QUERY_LOG_SUCCESS = 'GET_SERVICE_QUERY_LOG_SUCCESS'
export const GET_SERVICE_QUERY_LOG_FAILURE = 'GET_SERVICE_QUERY_LOG_FAILURE'
function fetchServiceQueryLogList(cluster, service, body, callback) {
  let headers
  if (body.namespace) {
    headers = {
      onbehalfuser: body.namespace,
    }
  }
  return {
    direction: body.direction,
    [FETCH_API]: {
      types: [GET_SERVICE_QUERY_LOG_REQUEST, GET_SERVICE_QUERY_LOG_SUCCESS, GET_SERVICE_QUERY_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/getSearchLog`,
      options: {
        method: 'POST',
        body: {
          kind: 'service',
          from: body.from,
          size: body.size,
          keyword: body.keyword,
          date_start: body.date_start,
          date_end: body.date_end,
          log_type: body.log_type,
          time_nano: body.time_nano,
          direction: body.direction,
          filename: body.filename,
          wildcard: body.wildcard,
        },
        headers,
      },
      schema: {}
    },
    callback
  }
}

export function getServiceQueryLogList(cluster, instances, body, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceQueryLogList(cluster, instances, body, callback))
  }
}

export const GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST = 'GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST'
export const GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS = 'GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS'
export const GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE = 'GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE'

function fetchClusterOfQueryLog(projecName, namespace, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST, GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS, GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/manage-monitor/${projecName}/${namespace}/getClusterOfQueryLog`,
      schema: {}
    },
    callback
  }
}

export function getClusterOfQueryLog(projecName, namespace, callback) {
  return (dispatch) => {
    return dispatch(fetchClusterOfQueryLog(projecName, namespace, callback))
  }
}

export const GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST = 'GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST'
export const GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS = 'GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS'
export const GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE = 'GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE'

function fetchServiceOfQueryLog(clusterId, namespace, callback) {
  return {
    [FETCH_API]: {
      types: [GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST, GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS, GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE],
      endpoint: `${API_URL_PREFIX}/manage-monitor/${clusterId}/${namespace}/getServiceOfQueryLog`,
      schema: {}
    },
    callback
  }
}

export function getServiceOfQueryLog(clusterId, namespace, callback) {
  return (dispatch) => {
    return dispatch(fetchServiceOfQueryLog(clusterId, namespace, callback))
  }
}

export const GET_QUERYLOG_LOG_FILE_LIST_REQUEST = 'GET_QUERYLOG_LOG_FILE_LIST_REQUEST'
export const GET_QUERYLOG_LOG_FILE_LIST_SUCCESS = 'GET_QUERYLOG_LOG_FILE_LIST_SUCCESS'
export const GET_QUERYLOG_LOG_FILE_LIST_FAILURE = 'GET_QUERYLOG_LOG_FILE_LIST_FAILURE'

function fetchGetQueryLogFileList(clusterId, instances, body, callback) {
  return {
    [FETCH_API]: {
      types: [GET_QUERYLOG_LOG_FILE_LIST_REQUEST, GET_QUERYLOG_LOG_FILE_LIST_SUCCESS, GET_QUERYLOG_LOG_FILE_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/logs/instances/${instances}/logfiles`,
      schema: {},
      options: {
        method: 'POST',
        body,
      }
    },
    callback
  }
}

export function getQueryLogFileList(clusterId, instances, body, callback) {
  return (dispatch) => {
    return dispatch(fetchGetQueryLogFileList(clusterId, instances, body, callback))
  }
}

export const SEARCH_QUERYLOG_LOG_FILE_LIST = 'SEARCH_QUERYLOG_LOG_FILE_LIST'

export function searchFileLogOfQueryLog(searchValue, callback){
  return {
    type: SEARCH_QUERYLOG_LOG_FILE_LIST,
    searchValue,
    callback,
  }
}

export const GET_PANEL_LIST_REQUEST = 'GET_PANEL_LIST_REQUEST'
export const GET_PANEL_LIST_SUCCESS = 'GET_PANEL_LIST_SUCCESS'
export const GET_PANEL_LIST_FAILURE = 'GET_PANEL_LIST_FAILURE'

function fetchPanelList(clusterId, callback) {
  return {
    [FETCH_API]: {
      types: [GET_PANEL_LIST_REQUEST,GET_PANEL_LIST_SUCCESS,GET_PANEL_LIST_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/${clusterId}/metric/panels`,
      schema: {},
    },
    callback
  }
}

export function getPanelList(clusterId, callback) {
  return dispatch => dispatch(fetchPanelList(clusterId, callback))
}

export const CHECK_PANEL_NAME_REQUEST = 'CHECK_PANEL_NAME_REQUEST'
export const CHECK_PANEL_NAME_SUCCESS = 'CHECK_PANEL_NAME_SUCCESS'
export const CHECK_PANEL_NAME_FAILURE = 'CHECK_PANEL_NAME_FAILURE'

function fetchCheckPanelName(clusterID, name, callback) {
  return {
    [FETCH_API]: {
      types: [CHECK_PANEL_NAME_REQUEST,CHECK_PANEL_NAME_SUCCESS,CHECK_PANEL_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/panels/${name}/check`,
      schema: {}
    },
    callback
  }
}

export function checkPanelName(clusterID, name, callback) {
  return dispatch => dispatch(fetchCheckPanelName(clusterID, name, callback))
}

export const CREATE_PANEL_REQUEST = 'CREATE_PANEL_REQUEST'
export const CREATE_PANEL_SUCCESS = 'CREATE_PANEL_SUCCESS'
export const CREATE_PANEL_FAILURE = 'CREATE_PANEL_FAILURE'

function fetchCreatePanel(clusterId, body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_PANEL_REQUEST,CREATE_PANEL_SUCCESS,CREATE_PANEL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/metric/panels`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function createPanel(clusterId, body, callback) {
  return dispatch => dispatch(fetchCreatePanel(clusterId, body, callback))
}

export const UPDATE_PANEL_REQUEST = 'UPDATE_PANEL_REQUEST'
export const UPDATE_PANEL_SUCCESS = 'UPDATE_PANEL_SUCCESS'
export const UPDATE_PANEL_FAILURE = 'UPDATE_PANEL_FAILURE'

function fetchUpdatePanel(clusterId, panelId, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_PANEL_REQUEST,UPDATE_PANEL_SUCCESS,UPDATE_PANEL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/metric/panels/${panelId}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function updatePanel(clusterId, panelId, body, callback) {
  return dispatch => dispatch(fetchUpdatePanel(clusterId, panelId, body, callback))
}

export const DELETE_PANEL_REQUEST = 'DELETE_PANEL_REQUEST'
export const DELETE_PANEL_SUCCESS = 'DELETE_PANEL_SUCCESS'
export const DELETE_PANEL_FAILURE = 'DELETE_PANEL_FAILURE'

function fetchDeletePanel(clusterId, body, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_PANEL_REQUEST,DELETE_PANEL_SUCCESS,DELETE_PANEL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/metric/panels/batch-delete`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function deletePanel(clusterId, body, callback) {
  return dispatch => dispatch(fetchDeletePanel(clusterId, body, callback))
}

export const GET_CHART_LIST_REQUEST = 'GET_CHART_LIST_REQUEST'
export const GET_CHART_LIST_SUCCESS = 'GET_CHART_LIST_SUCCESS'
export const GET_CHART_LIST_FAILURE = 'GET_CHART_LIST_FAILURE'

function fetchChartList(clusterID, query, callback) {
  return {
    panelId: query.panel_id,
    [FETCH_API]: {
      types: [GET_CHART_LIST_REQUEST,GET_CHART_LIST_SUCCESS,GET_CHART_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/charts?${toQuerystring(query)}`,
      schema: {},
    },
    callback
  }
}

export function getChartList(clusterID, query, callback) {
  return dispatch => dispatch(fetchChartList(clusterID, query, callback))
}

export const CREATE_CHART_REQUEST = 'CREATE_CHART_REQUEST'
export const CREATE_CHART_SUCCESS = 'CREATE_CHART_SUCCESS'
export const CREATE_CHART_FAILURE = 'CREATE_CHART_FAILURE'

function fetchCreateChart(clusterID, body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_CHART_REQUEST,CREATE_CHART_SUCCESS,CREATE_CHART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/charts`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function createChart(clusterID, body, callback) {
  return dispatch => dispatch(fetchCreateChart(clusterID, body, callback))
}

export const CHECK_CHART_NAME_REQUEST = 'CHECK_CHART_NAME_REQUEST'
export const CHECK_CHART_NAME_SUCCESS = 'CHECK_CHART_NAME_SUCCESS'
export const CHECK_CHART_NAME_FAILURE = 'CHECK_CHART_NAME_FAILURE'

function fetchCheckChartName(clusterID, name, query, callback) {
  return {
    [FETCH_API]: {
      types: [CHECK_CHART_NAME_REQUEST,CHECK_CHART_NAME_SUCCESS,CHECK_CHART_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/charts/${name}/check?${toQuerystring(query)}`,
      schema: {},
    },
    callback
  }
}

export function checkChartName(clusterID, name, query, callback) {
  return dispatch => dispatch(fetchCheckChartName(clusterID, name, query, callback))
}

export const UPDATE_CHART_REQUEST = 'UPDATE_CHART_REQUEST'
export const UPDATE_CHART_SUCCESS = 'UPDATE_CHART_SUCCESS'
export const UPDATE_CHART_FAILURE = 'UPDATE_CHART_FAILURE'

function fetchUpdateChart(clusterID, chartID, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_CHART_REQUEST,UPDATE_CHART_SUCCESS,UPDATE_CHART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/charts/${chartID}`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function updateChart(clusterID, chartID, body, callback) {
  return dispatch => dispatch(fetchUpdateChart(clusterID, chartID, body, callback))
}

export const DELETE_CHART_REQUEST = 'DELETE_CHART_REQUEST'
export const DELETE_CHART_SUCCESS = 'DELETE_CHART_SUCCESS'
export const DELETE_CHART_FAILURE = 'DELETE_CHART_FAILURE'

function fetchDeleteChart(clusterID, body, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_CHART_REQUEST,DELETE_CHART_SUCCESS,DELETE_CHART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/charts/batch-delete`,
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export function deleteChart(clusterID, body, callback) {
  return dispatch => dispatch(fetchDeleteChart(clusterID, body, callback))
}

export const GET_METRICS_REQUEST = 'GET_METRICS_REQUEST'
export const GET_METRICS_SUCCESS = 'GET_METRICS_SUCCESS'
export const GET_METRICS_FAILURE = 'GET_METRICS_FAILURE'

function fetchMetrics(clusterID, query, callback) {
  return {
    metricType: query.type,
    [FETCH_API]: {
      types: [GET_METRICS_REQUEST,GET_METRICS_SUCCESS,GET_METRICS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/monitor?${toQuerystring(query)}`,
      schema: {},
      options: {}
    },
    callback
  }
}

export function getMetrics(clusterID, query, callback) {
  return dispatch => dispatch(fetchMetrics(clusterID, query, callback))
}

export const GET_PROXIES_SERVICES_REQUEST = 'GET_PROXIES_SERVICES_REQUEST'
export const GET_PROXIES_SERVICES_SUCCESS = 'GET_PROXIES_SERVICES_SUCCESS'
export const GET_PROXIES_SERVICES_FAILURE = 'GET_PROXIES_SERVICES_FAILURE'

function fetchProxiesServices(clusterID, proxyID, callback) {
  return {
    proxyID,
    [FETCH_API]: {
      types: [GET_PROXIES_SERVICES_REQUEST,GET_PROXIES_SERVICES_SUCCESS,GET_PROXIES_SERVICES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/proxies/${proxyID}/services`,
      schema: {}
    },
    callback
  }
}

export function getProxiesService(clusterID, proxyID, callback) {
  return dispatch => dispatch(fetchProxiesServices(clusterID, proxyID, callback))
}

export const GET_MONITOR_METRICS_REQUEST = 'GET_MONITOR_METRICS_REQUEST'
export const GET_MONITOR_METRICS_SUCCESS = 'GET_MONITOR_METRICS_SUCCESS'
export const GET_MONITOR_METRICS_FAILURE = 'GET_MONITOR_METRICS_FAILURE'

function fetchMonitorMetrics(panelID, chartID, clusterID, lbgroup, services, query, callback) {
  let monitorID = chartID ? panelID + chartID : panelID
  return {
    monitorID,
    [FETCH_API]: {
      types: [GET_MONITOR_METRICS_REQUEST,GET_MONITOR_METRICS_SUCCESS,GET_MONITOR_METRICS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/metric/nexport/${lbgroup}/service/${services}/metrics?${toQuerystring(query)}`,
      schema: {},
    },
    callback
  }
}

export function getMonitorMetrics(panelID, chartID, clusterID, lbgroup, services, query, callback) {
  return dispatch => dispatch(fetchMonitorMetrics(panelID, chartID, clusterID, lbgroup, services, query, callback))
}

export const GET_SERVICES_METRICS_REQUEST = 'GET_SERVICES_METRICS_REQUEST'
export const GET_SERVICES_METRICS_SUCCESS = 'GET_SERVICES_METRICS_SUCCESS'
export const GET_SERVICES_METRICS_FAILURE = 'GET_SERVICES_METRICS_FAILURE'

function fetchServicesMetrics(panelID, chartID, clusterID, services, query, callback) {
  let monitorID = chartID ? panelID + chartID : panelID
  return {
    monitorID,
    [FETCH_API]: {
      types: [GET_SERVICES_METRICS_REQUEST, GET_SERVICES_METRICS_SUCCESS, GET_SERVICES_METRICS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/services/${services}/metrics?${toQuerystring(query)}`,
      schema: {},
    },
    callback
  }
}

export function getServicesMetrics(panelID, chartID, clusterID, services, query, callback) {
  return dispatch => dispatch(fetchServicesMetrics(panelID, chartID, clusterID, services, query, callback))
}

export const GET_CLUSTERS_METRICS_REQUEST = 'GET_CLUSTERS_METRICS_REQUEST'
export const GET_CLUSTERS_METRICS_SUCCESS = 'GET_CLUSTERS_METRICS_SUCCESS'
export const GET_CLUSTERS_METRICS_FAILURE = 'GET_CLUSTERS_METRICS_FAILURE'

function fetchClustersMetrics(panelID, chartID, clusterID, nodes, query, callback) {
  let monitorID = chartID ? panelID + chartID : panelID
  return {
    monitorID,
    [FETCH_API]: {
      types: [GET_CLUSTERS_METRICS_REQUEST, GET_CLUSTERS_METRICS_SUCCESS, GET_CLUSTERS_METRICS_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster-nodes/${clusterID}/${nodes}/panel/metrics?${toQuerystring(query)}`,
      schema: {},
    },
    callback
  }
}

export function getClustersMetrics(panelID, chartID, clusterID, nodes, query, callback) {
  return dispatch => dispatch((fetchClustersMetrics(panelID, chartID, clusterID, nodes, query, callback)))
}
