/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * util.js page
 *
 * @author zhangtao
 * @date Tuesday June 26th 2018
 */
import isEmpty from 'lodash/isEmpty'
import { formatDate } from '../../src/common/tools';

/**
 * safely get deep value in a Nested Object or Array
 * @param {object | array} target the obj or array you need to read value from
 * @param {array} propsList the propsList you read
 * @return {any} if read error, return null
 * @example getDeepValue(userList, ['group', 0, 'name'])
 */
export const getDeepValue = (target, propsList) => propsList.reduce((result, prop) =>
  (result && result[prop] !== undefined ? result[prop] : null), target)
/**
 * bizcharts 图例显示有问题，去掉服务名称后的数字（dsb-server-3375465363-1x4v5 => dsb-server-1x4v5）
 * @param {object} data 数据源
 * @return {object} 修改数据中的时间
 */
export const formatMonitorName = data => {
  if (isEmpty(data)) {
    return data
  }
  data.forEach(item => {
    const { container_name, metrics } = item
    let name = container_name.split('-')
    name.splice(-2, 1)
    name = name.join('-')
    metrics.forEach(metric => {
      metric.container_name = name
      metric.timestamp = formatDate(metric.timestamp, 'MM-DD HH:mm:ss')
    })
  })
  return data
}

/**
 * 统一 pod 和 service 监控数据格式
 * @param {object} res 数据源
 * @return {object} result data
 */
export const formatPodMonitor = res => {
  const result = {
    data: [],
  }
  for (const [ key, value ] of Object.entries(res)) {
    const metrics = value.metrics || []
    metrics.forEach(metric => {
      metric.value && (metric.value = Math.ceil(metric.value * 100) / 100)
      metric.floatValue && (metric.floatValue = Math.ceil(metric.floatValue * 100) / 100)
    })
    value.container_name = key
    value.metrics = metrics
    result.data.push(value)
  }
  return result
}
