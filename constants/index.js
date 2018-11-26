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
exports.INTL_COOKIE_NAME = 'intl_locale'
exports.METRICS_DEFAULT_SOURCE = 'prometheus' // influxdb || prometheus
exports.METRICS_INFLUXDB = 'influxdb'
exports.METRICS_CPU = 'cpu/usage_rate'
exports.METRICS_MEMORY = 'memory/usage'
exports.METRICS_NETWORK_RECEIVED = 'network/rx_rate'
exports.METRICSS_NETWORK_TRANSMITTED = 'network/tx_rate'
exports.METRICSS_DISK_READ = 'disk/readio'
exports.METRICSS_DISK_WRITE = 'disk/writeio'
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
exports.INSTANCE_MAX_NUM = 300
exports.INSTANCE_AUTO_SCALE_MAX_CPU = 99
exports.INSTANCE_AUTO_SCALE_MAX_MEMORY = 99
exports.DEFAULT_PAGE = 1
exports.DEFAULT_PAGE_SIZE = 10
exports.MAX_PAGE_SIZE = 100
exports.USER_CURRENT_CONFIG = 'tce_user_current_config'
exports.ANNOTATION_SVC_SCHEMA_PORTNAME = 'system/schemaPortname'
exports.ANNOTATION_LBGROUP_NAME = 'system/lbgroup'
exports.ANNOTATION_HTTPS = 'system/https'
exports.ROLE_USER = 0
exports.ROLE_TEAM_ADMIN = 1//公有云，基本废弃，
exports.ROLE_SYS_ADMIN = 2 //系统管理员，权限最高
exports.ROLE_PLATFORM_ADMIN = 3 //平台管理员
exports.ROLE_BASE_ADMIN = 4 //基础设施管理员
exports.PHONE_REGEX = /^1[0-9]{10}$/
exports.URL_REGEX = /^(http[s]?):\/\/([\da-zA-Z\-][\.]?)+(:\d)?[\da-zA-Z\.\-\/]*$/
exports.HOST_REGEX = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
exports.IP_REGEX = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
exports.IP_PATH_REGEX = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])([\/_a-zA-Z0-9]+)+$/
exports.IP_ALIASES = /^[0-9a-z]+[0-9a-z\.\-]*[0-9a-z]*$/
exports.HOSTNAME_SUBDOMAIN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
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
exports.ADMIN_ROLE = 2
exports.NO_CLUSTER_FLAG = 'no_cluster_flag'
exports.CLUSTER_PAGE = '/cluster'
exports.DEFAULT_CLUSTER_MARK = 1
exports.DEFAULT_LICENSE = {
  max_nodes: 5,
  max_clusters: 1,
}
exports.CREATE_PROJECTS_ROLE_ID = 'RID-Ezeg3KPhm3mS'
exports.CREATE_TEAMS_ROLE_ID = 'RID-XwPiLfrBYjqd'
//项目访客
exports.PROJECT_VISISTOR_ROLE_ID = 'RID-ggNW6A2mwgEX'
//项目管理员
exports.PROJECT_MANAGE_ROLE_ID = 'RID-LFJKCKtKzCrd'
//admin userID
exports.ADMIN_USERID = 1232
//team_manager
exports.TEAM_MANAGE_ROLE_ID = 'RID-z22z7ZnSgLRz'

exports.TEAM_CREATOR_ROLE = 'team-creator'
exports.PROJECT_CREATOR_ROLE = 'project-creator'

exports.APM_SERVICE_LABEL_KEY = 'system/apm-service'

//system_store
exports.SYSTEM_STORE = 'system_store'

//timeout 2min
exports.MAX_TIMEOUT = 120000

// GPU key
exports.RESOURCES_GPU_KEY = 'nvidia.com/gpu'
