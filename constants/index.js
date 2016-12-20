/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * App constants for backend and frontend
 *
 * v0.1 - 2016-10-24
 * @author Zhangpc
 */
'use strict'

exports.METRICS_DEFAULT_SOURCE = 'influxdb'
exports.METRICS_CPU = 'cpu/usage_rate'
exports.METRICS_MEMORY = 'memory/usage'
exports.METRICS_NETWORK_RECEIVED = 'network/rx_rate'
exports.METRICSS_NETWORK_TRANSMITTED = 'network/tx_rate'
exports.DEFAULT_CONTAINER_RESOURCES_CPU = '60m'
exports.DEFAULT_CONTAINER_RESOURCES_MEMORY = '256Mi'
exports.DEFAULT_CONTAINER_RESOURCES = {
  "limits": {
    "memory": exports.DEFAULT_CONTAINER_RESOURCES_MEMORY
  },
  "requests": {
    "cpu": exports.DEFAULT_CONTAINER_RESOURCES_CPU,
    "memory": exports.DEFAULT_CONTAINER_RESOURCES_MEMORY
  }
}
exports.INSTANCE_MAX_NUM = 10
exports.INSTANCE_AUTO_SCALE_MAX_CPU = 99
exports.DEFAULT_PAGE = 1
exports.DEFAULT_PAGE_SIZE = 10
exports.MAX_PAGE_SIZE = 100
exports.USER_CURRENT_CONFIG = 'tce_user_current_config'
exports.ANNOTATION_SVC_SCHEMA_PORTNAME = 'tenxcloud.com/schemaPortname'
exports.ROLE_USER = 0
exports.ROLE_TEAM_ADMIN = 1
exports.PHONE_REGEX = /(^(13\d|14[57]|15[^4,\D]|17[678]|18\d)\d{8}|170[059]\d{7})$/
