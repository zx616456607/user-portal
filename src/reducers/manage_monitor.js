/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for manage monitor
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import * as ActionTypes from '../actions/manage_monitor'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'
import union from 'lodash/union'

function operationAuditLog(state = {}, action) {
  const defaultState = {
    logs: {
      isFetching: false,
      logs: []
    }
  }
  switch (action.type) {
    case ActionTypes.GET_MANAGE_MONITOR_LOG_REQUEST:
      return Object.assign({}, defaultState, state, {
        logs: { isFetching: true }
      })
    case ActionTypes.GET_MANAGE_MONITOR_LOG_SUCCESS:
      return Object.assign({}, state, {
        logs: {
          isFetching: false,
          logs: action.response.result.logs || [],
          count: action.response.result.count
        }
      })
    case ActionTypes.GET_MANAGE_MONITOR_LOG_FAILURE:
      return Object.assign({}, defaultState, state, {
        logs: { isFetching: false, count: 0 }
      })
    default:
      return state
  }
}

function getQueryLog(state = {logs:{}}, action) {
  const defaultState = {
    logs: {
      isFetching: false,
      logs: [],
      count: 0
    }
  }
  const { direction } = action
  let resLogs = []
  switch (action.type) {
    case ActionTypes.GET_QUERY_LOG_REQUEST:
    case ActionTypes.GET_SERVICE_QUERY_LOG_REQUEST:
      if (direction === 'forward') {
        return merge({}, state, {
          logs: {
            isFetching: false,
          }
        })
      }
      return merge({}, defaultState, state, {
        logs: { isFetching: true }
      })
    case ActionTypes.GET_QUERY_LOG_SUCCESS:
    case ActionTypes.GET_SERVICE_QUERY_LOG_SUCCESS:
      const resData = action.response.result.logs || {}
      resLogs = resData.logs || []
      if (direction === 'forward') {
        resLogs.shift()
      }
      return Object.assign({}, state, {
        logs: {
          isFetching: false,
          count: resData ? resData.count: 0,
          logs: (
            direction === 'forward'
            ? state.logs.logs.concat(resLogs)
            : resLogs
          )
        }
      })
    case ActionTypes.GET_QUERY_LOG_FAILURE:
    case ActionTypes.GET_SERVICE_QUERY_LOG_FAILURE:
      return Object.assign({}, defaultState, {
        logs: { isFetching: false, count: 0, }
      })
    default:
      return state
  }
}

function getClusterOfQueryLog(state = {}, action) {
  const defaultState = {
    isFetching: false,
    clusterList: []
  }
  switch (action.type) {
    case ActionTypes.GET_CLUSTER_OF_TEAM_FOR_LOG_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_CLUSTER_OF_TEAM_FOR_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        clusterList: action.response.result.clusterList || []
      })
    case ActionTypes.GET_CLUSTER_OF_TEAM_FOR_LOG_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getServiceOfQueryLog(state = {}, action) {
  const defaultState = {
    isFetching: false,
    clusterList: []
  }
  switch (action.type) {
    case ActionTypes.GET_SERVICE_OF_TEAM_FOR_LOG_REQUEST:
      return Object.assign({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_SERVICE_OF_TEAM_FOR_LOG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        clusterList: action.response.result.data || []
      })
    case ActionTypes.GET_SERVICE_OF_TEAM_FOR_LOG_FAILURE:
      return Object.assign({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getLogFileOfQueryLog(state = {}, action){
  switch(action.type){
    case ActionTypes.GET_QUERYLOG_LOG_FILE_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        fileList: [],
        searchList: [],
      })
    case ActionTypes.GET_QUERYLOG_LOG_FILE_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        fileList: action.response.result.data,
        searchList: action.response.result.data,
      })
    default:
    case ActionTypes.GET_QUERYLOG_LOG_FILE_LIST_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        fileList: [],
        searchList: [],
      })
    case ActionTypes.SEARCH_QUERYLOG_LOG_FILE_LIST:
      const list = cloneDeep(state.searchList)
      const searchValue = action.searchValue
      let result = []
      if(searchValue){
        list.forEach((item, index) => {
          if(item.indexOf(searchValue) > -1){
            result.push(item)
          }
        })
      } else {
        result = list
      }
      return Object.assign({}, state, {
        isFetching: false,
        fileList: result,
        searchList: list,
      })
  }
}

function monitorPanel(state = {}, action) {
  switch(action.type) {
    case ActionTypes.GET_PANEL_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_PANEL_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        ...action.response.result.data
      })
    case ActionTypes.GET_PANEL_LIST_FAILURE:
      return Object.assign({}, {
        isFetching: false
      })
    default:
      return state
  }
}

function panelCharts(state = {}, action) {
  const { panelId } = action
  switch(action.type) {
    case ActionTypes.GET_CHART_LIST_REQUEST:
      return {
        ...state,
        [panelId]: Object.assign({}, state[panelId], {
          isFetching: true
        })
      }
    case ActionTypes.GET_CHART_LIST_SUCCESS:
      return {
        ...state,
        [panelId]: Object.assign({}, state[panelId], {
          isFetching: false,
          ...action.response.result.data
        })
      }
    case ActionTypes.GET_CHART_LIST_FAILURE:
      return {
        ...state,
        [panelId]: Object.assign({}, state[panelId], {
          isFetching: false
        })
      }
    default:
      return state
  }
}

function metrics(state = {}, action) {
  const { metricType } = action
  switch(action.type) {
    case ActionTypes.GET_METRICS_REQUEST:
      return {
        ...state,
        metricType,
        [metricType]: Object.assign({}, state[metricType], {
          isFetching: true
        })
      }
    case ActionTypes.GET_METRICS_SUCCESS:
      return {
        ...state,
        metricType,
        [metricType]: Object.assign(({}, state[metricType], {
          isFetching: false,
          ...action.response.result.data
        }))
      }
    case ActionTypes.GET_METRICS_FAILURE:
      return {
        ...state,
        metricType,
        [metricType]: Object.assign({}, state[metricType], {
          isFetching: false
        })
      }
    default:
      return state
  }
}

function proxiesServices(state = {}, action) {
  const { proxyID } = action
  switch(action.type) {
    case ActionTypes.GET_PROXIES_SERVICES_REQUEST:
      return {
        ...state,
        proxyID,
        [proxyID]: Object.assign({}, state[proxyID], {
          isFetching: true
        })
      }
    case ActionTypes.GET_PROXIES_SERVICES_SUCCESS:
      return {
        ...state,
        proxyID,
        [proxyID]: Object.assign({}, state[proxyID], {
          isFetching: false,
          ...action.response.result
        })
      }
    case ActionTypes.GET_PROXIES_SERVICES_FAILURE:
      return {
        ...state,
        proxyID,
        [proxyID]: Object.assign({}, state[proxyID], {
          isFetching: false
        })
      }
    default:
      return state
  }
}

function formatMetric(result) {
  let data = []
  for (let i in result) {
    if (i === 'statusCode') {
      break
    }
    let obj = {
      name: i,
      ...result[i]
    }
    data.push(obj)
  }
  return data
}
function monitorMetrics(state = {}, action) {
  const { monitorID } = action
  switch(action.type) {
    case ActionTypes.GET_MONITOR_METRICS_REQUEST:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: true
        })
      }
    case ActionTypes.GET_MONITOR_METRICS_SUCCESS:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: false,
          data: formatMetric(action.response.result)
        })
      }
    case ActionTypes.GET_MONITOR_METRICS_FAILURE:
      return {
        ...state,
        [monitorID]: Object.assign(({}, state[monitorID], {
          isFetching: false
        }))
      }
    default:
      return state
  }
}

function serviceMetrics(state = {}, action) {
  const { monitorID, type } = action
  switch(type) {
    case ActionTypes.GET_SERVICES_METRICS_REQUEST:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: true
        })
      }
    case ActionTypes.GET_SERVICES_METRICS_SUCCESS:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: false,
          data: action.response.result.data.map(item => {
            return {
              name: item.containerName,
              metrics: item.metrics
            }
          })
        })
      }
    case ActionTypes.GET_SERVICES_METRICS_FAILURE:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: false
        })
      }
    default:
      return state
  }
}

function nodeMetrics(state = {}, action) {
  const { monitorID, type } = action
  switch(type) {
    case ActionTypes.GET_CLUSTERS_METRICS_REQUEST:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: true
        })
      }
    case ActionTypes.GET_CLUSTERS_METRICS_SUCCESS:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: false,
          data: formatMetric(action.response.result)
        })
      }
    case ActionTypes.GET_CLUSTERS_METRICS_FAILURE:
      return {
        ...state,
        [monitorID]: Object.assign({}, state[monitorID], {
          isFetching: false
        })
      }
    default:
      return state
  }
}

function operationalTarget(state = {}, action) {
  const defaultState = {
    isFetching: false,
    data: []
  }
  switch (action.type) {
    case ActionTypes.GET_OPERATIONAL_TARGET_REQUEST:
      return Object.assign({}, state, defaultState, {
        isFetching: true
      })

    case ActionTypes.GET_OPERATIONAL_TARGET_SUCCESS:
      return Object.assign({}, state, defaultState, {
        data: action.response.result.data,
        isFetching: false
      })
    case ActionTypes.GET_OPERATIONAL_TARGET_FAILURE:
      return Object.assign({}, state, defaultState, {
        isFetching: false
      })
    default:
      return state
  }
}


export function manageMonitor(state = { manageMonitor: {} }, action) {
  return {
    operationAuditLog: operationAuditLog(state.operationAuditLog, action),
    getQueryLog: getQueryLog(state.getQueryLog, action),
    getClusterOfQueryLog: getClusterOfQueryLog(state.getClusterOfQueryLog, action),
    getServiceOfQueryLog: getServiceOfQueryLog(state.getServiceOfQueryLog, action),
    getLogFileOfQueryLog: getLogFileOfQueryLog(state.getLogFileOfQueryLog, action),
    monitorPanel: monitorPanel(state.monitorPanel, action),
    panelCharts: panelCharts(state.panelCharts, action),
    metrics: metrics(state.metrics, action),
    proxiesServices: proxiesServices(state.proxiesServices, action),
    monitorMetrics: monitorMetrics(state.monitorMetrics, action),
    serviceMetrics: serviceMetrics(state.serviceMetrics, action),
    nodeMetrics: nodeMetrics(state.nodeMetrics, action),
    operationalTarget: operationalTarget(state.operationalTarget, action),

  }
}
