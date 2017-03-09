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

exports.METRICS_DEFAULT_SOURCE = 'prometheus' // influxdb || prometheus
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
exports.ANNOTATION_HTTPS = 'tenxcloud.com/https'
exports.ROLE_USER = 0
exports.ROLE_TEAM_ADMIN = 1
exports.ROLE_SYS_ADMIN = 2
exports.PHONE_REGEX = /^1[0-9]{10}$/
exports.URL_REGEX = /^(http[s]?):\/\/[\da-zA-Z-]+\.[\da-zA-Z\.-:\/]+$/
exports.AMOUNT_CONVERSION = 10000 // 10000 = 1 元
exports.AMOUNT_DEFAULT_PRECISION = 2 // 小数点后两位
exports.TENX_LOCAL_TIME_VOLUME = {
  "name": "tenxcloud-time-localtime",
  "hostPath": {
    "path": "/etc/localtime"
  }
}
exports.DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
exports.CERT_REGEX = /^-----BEGIN CERTIFICATE-----\n(.+\n)+-----END CERTIFICATE-----$/
exports.PRIVATE_KEY_REGEX = /^-----BEGIN RSA PRIVATE KEY-----\n(.+\n)+-----END RSA PRIVATE KEY-----$/

// Service proxy type
exports.SERVICE_TENX_PROXY = 'tenx-proxy'
exports.SERVICE_KUBE_NODE_PORT = 'kube-nodeport'
exports.SERVICE_KUBE_EXTERNAL_IPS = 'kube-externalips'

exports.PROXY_TYPE = process.env.PROXY_TYPE || 'tenx-proxy'

exports.K8S_NODE_SELECTOR_KEY = 'kubernetes.io/hostname'