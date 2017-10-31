/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/24
 * @author ZhaoXueYu
 */

import * as ActionTypes from '../actions/metrics'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

function formatAllMetrics(type ,state = {}, action) {
  switch(action.type) {
    case ActionTypes[`${type}_REQUEST`]:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes[`${type}_SUCCESS`]:
      return Object.assign({}, state, {
        isFetching: false,
        result: Object.assign({}, action.response.result, {
          data: action.response.result.data.map(item => {
            let key = Object.keys(item)[0]
            return {[key]: [Object.assign({}, item[key], {
              metrics: item[key].metrics.map(res => {
                return res
              })
            })]}
          })
        }),
      })
    case ActionTypes[`${type}_FAILURE`]:
      return Object.assign({}, state, {
        isFetching: false,
        result: {}
      })
    default: 
      return state
  }
}

function forMatMetricsDate(data) {
  return {
    data: [Object.assign({}, data, {
      metrics: data.metrics.map(item => {
        return item
      })
    })]
  }
}

function formatMetricsType(type, state = {}, action) {
  switch(action.type) {
    case ActionTypes[`${type}_REQUEST`]: 
      return Object.assign({}, state, {
        isFetching: true,
      })
    case ActionTypes[`${type}_SUCCESS`]:
      return Object.assign({}, action.response, {
        isFetching: false,
        result: forMatMetricsDate(action.response.result.data[0])
      })
    case ActionTypes[`${type}_FAILURE`]:
      return Object.assign({}, state, {
        isFetching: false,
        data: []
      })
    default: 
      return state
  }
}

export default function metrics(
  state = {
    containers: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}, diskReadIo: {}, diskWriteIo: {}, allcontainersmetrics: {}
    },
    services: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}, diskReadIo: {}, diskWriteIo: {}, allservicesmetrics: {}
    },
    apps: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}, diskReadIo: {}, diskWriteIo: {}, appAllMetrics: {}
    }
  }, action) {
  return {
    containers: {
      CPU: formatMetricsType('METRICS_CONTAINER_CPU', state.containers.CPU, action),
      memory: formatMetricsType('METRICS_CONTAINER_MEMORY', state.containers.memory, action),
      networkReceived: formatMetricsType('METRICS_CONTAINER_NETWORK_RECEIVED', state.containers.networkReceived, action),
      networkTransmitted: formatMetricsType('METRICS_CONTAINER_NETWORK_TRANSMITTED', state.containers.networkTransmitted, action),
      diskReadIo: formatMetricsType('METRICS_CONTAINER_DISK_READ', state.containers.diskReadIo, action),
      diskWriteIo: formatMetricsType('METRICS_CONTAINER_DISK_WRITE', state.containers.diskWriteIo, action),
      allcontainersmetrics: formatAllMetrics('GET_ALL_METRICS_CONTAINER' ,state.containers.allcontainersmetrics, action),
    },
    services: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_CPU_FAILURE
      }, state.services.CPU, action, option),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_MEMORY_FAILURE
      }, state.services.memory, action, option),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_FAILURE
      }, state.services.networkReceived, action, option),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE
      }, state.services.networkTransmitted, action, option),
      diskReadIo: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_DISK_READ_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_DISK_READ_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_DISK_READ_FAILURE
      }, state.services.diskReadIo, action, option),
      diskWriteIo: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_DISK_WRITE_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_DISK_WRITE_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_DISK_WRITE_FAILURE
      }, state.services.diskWriteIo, action, option),
      allservicesmetrics: reducerFactory({
        REQUEST: ActionTypes.GET_ALL_METRICS_SERVICE_REQUEST,
        SUCCESS: ActionTypes.GET_ALL_METRICS_SERVICE_SUCCESS,
        FAILURE: ActionTypes.GET_ALL_METRICS_SERVICE_FAILURE
      }, state.services.allservicesmetrics, action, option),
    },
    apps: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_CPU_FAILURE
      }, state.apps.CPU, action, option),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_MEMORY_FAILURE
      }, state.apps.memory, action, option),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_NETWORK_RECEIVED_FAILURE
      }, state.apps.networkReceived, action, option),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_NETWORK_TRANSMITTED_FAILURE
      }, state.apps.networkTransmitted, action, option),
      diskReadIo: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_DISK_READ_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_DISK_READ_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_DISK_READ_FAILURE
      }, state.apps.diskReadIo, action, option),
      diskWriteIo: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_DISK_WRITE_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_DISK_WRITE_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_DISK_WRITE_FAILURE
      }, state.apps.diskWriteIo, action, option),
      appAllMetrics: reducerFactory({
        REQUEST: ActionTypes.GET_ALL_METRICS_APP_REQUEST,
        SUCCESS: ActionTypes.GET_ALL_METRICS_APP_SUCCESS,
        FAILURE: ActionTypes.GET_ALL_METRICS_APP_FAILURE
      }, state.apps.appAllMetrics, action, option),
    }
  }
}