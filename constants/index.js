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

exports.METRICS_DEFAULT_SOURCE = 'influxdb'
exports.METRICS_CPU = 'cpu/usage_rate'
exports.METRICS_MEMORY = 'memory/usage'
exports.METRICS_NETWORK_RECEIVED = 'network/rx_rate'
exports.METRICSS_NETWORK_TRANSMITTED = 'network/tx_rate'
exports.DEFAULT_CONTAINER_RESOURCES_CPU = '60m'
exports.DEFAULT_CONTAINER_RESOURCES_MEMORY = '256Mi'
exports.DEFAULT_CONTAINER_RESOURCES = {
  "limits": {
    "memory": this.DEFAULT_CONTAINER_RESOURCES_MEMORY
  },
  "requests": {
    "cpu": this.DEFAULT_CONTAINER_RESOURCES_CPU,
    "memory": this.DEFAULT_CONTAINER_RESOURCES_MEMORY
  }
}