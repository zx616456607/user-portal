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
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_CPU_FAILURE
      }, state.containers.CPU, action, option),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_MEMORY_FAILURE
      }, state.containers.memory, action, option),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE
      }, state.containers.networkReceived, action, option),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE
      }, state.containers.networkTransmitted, action, option),
      diskReadIo: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_DISK_READ_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_DISK_READ_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_DISK_READ_FAILURE
      }, state.containers.diskReadIo, action, option),
      diskWriteIo: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_DISK_WRITE_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_DISK_WRITE_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_DISK_WRITE_FAILURE
      }, state.containers.diskWriteIo, action, option),
      allcontainersmetrics: reducerFactory({
        REQUEST: ActionTypes.GET_ALL_METRICS_CONTAINER_REQUEST,
        SUCCESS: ActionTypes.GET_ALL_METRICS_CONTAINER_SUCCESS,
        FAILURE: ActionTypes.GET_ALL_METRICS_CONTAINER_FAILURE
      }, state.containers.allcontainersmetrics, action, option),
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