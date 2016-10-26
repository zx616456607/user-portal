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
import { DEFAULT_PAGE_SIZE } from '../constants'

export default function metrics(
  state = {
    containers: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}
    },
    services: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}
    }
  }, action) {
  return {
    containers: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_CPU_FAILURE
      }, state.containers.CPU, action),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_MEMORY_FAILURE
      }, state.containers.memory, action),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE
      }, state.containers.networkReceived, action),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE
      }, state.containers.networkTransmitted, action),
    },
    services: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_CPU_FAILURE
      }, state.services.CPU, action),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_MEMORY_FAILURE
      }, state.services.memory, action),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_FAILURE
      }, state.services.networkReceived, action),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE
      }, state.services.networkTransmitted, action),
    }
  }
}