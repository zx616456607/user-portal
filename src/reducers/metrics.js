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
import merge from 'lodash/merge'
import union from 'lodash/union'
import cloneDeep from 'lodash/cloneDeep'
import reducerFactory from './factory'
import { DEFAULT_PAGE_SIZE } from '../constants'

export default function metrics(state = { containers: {}}, action) {
  return {
    containers: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_CPU_FAILURE
      }, state.containers.CPU, action)
    }
  }
}