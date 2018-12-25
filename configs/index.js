/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index config file
 *
 * v0.1 - 2016-09-02
 * @author Zhangpc
 */
'use strict'
const constants = require('./constants')
const globalConstants = require('../constants')
const registryTemplate = require('./3rd_account/registry_template.json')
const env = process.env

const config = {
  node_env: env.NODE_ENV || constants.NODE_ENV_DEV, // production / dev
  running_mode: env.RUNNING_MODE || constants.ENTERPRISE_MODE, // enterprise / standard
  protocol: env.DASHBOARD_PROTOCOL || 'http',
  hostname: env.DASHBOARD_HOST || '0.0.0.0',
  port: env.DASHBOARD_PORT || 8003,
  url: env.USERPORTAL_URL || 'https://portal.tenxcloud.com', // USERPORTAL_URL env is only useful in production environments
  intl_cookie_name: globalConstants.INTL_COOKIE_NAME,
  showMoreLoginMethods: env.SHOW_MORE_LOGIN_METHODS || 'flase',
  session_key: 'tce',
  session_secret: ['tenxcloud_dashboard', 'se cret_dream008'],
  tenx_api: {
    external_protocol: env.TENX_API_EXTERNAL_PROTOCOL || 'http',
    external_host: env.TENX_API_EXTERNAL_HOST || '192.168.1.230:48000',
    protocol: env.TENX_API_PROTOCOL || 'http',
    host: env.TENX_API_HOST || '192.168.1.230:48000'
  },
  vm_api: {
    protocol: env.TENX_VM_API_PROTOCOL,
    host: env.TENX_VM_API_HOST,
  },
  mesh_api: {
    protocol: env.SERVICEMESH_API_PROTOCOL || env.TENX_API_PROTOCOL || 'http',
    host: env.SERVICEMESH_API_HOST || env.TENX_API_HOST || '192.168.1.59:65532',
    version: env.SERVICEMESH_API_PREFIX || 'v3',
  },
  vm_term_api: {
    protocol: env.VM_TERM_API_PROTOCOL || env.TENX_API_EXTERNAL_PROTOCOL || 'http',
    host: env.VM_TERM_API_HOST || env.TENX_API_EXTERNAL_HOST || '192.168.1.59:65533',
    version: env.VM_TERM_API_PREFIX || 'v3',
  },
  htkg_api: {
    protocol: env.HTKG_API_PROTOCOL || 'http',
    host: env.HTKG_API_HOST || '10.14.34.134:7001',
    prefix: env.HTKG_API_PREFIX || '/api/v1',
    api_key_id: env.HTKG_API_KEY_ID || '0ee5d7173e800000',
    api_key_secret: env.HTKG_API_KEY_SECRET || 'bceba0eaa3d86bd2f43f977e38063371fe5a730460a539618c27be4150f286c0',
  },
  // mail_server: {
  //   host: "smtp.qq.com",
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: "noreply@tenxcloud.com",
  //     pass: env.NOREPLY_EMAIL_PWD,
  //   },
  //   service_mail: "service@tenxcloud.com"
  // },
  // sendcloud 邮箱配置
  sendcloud: {
    apiUser: env.SENDCLOUD_API_USER,
    apiKey: env.SENDCLOUD_API_KEY,
    from: env.SENDCLOUD_FROM,
    fromname: env.SENDCLOUD_FROM_NAME,
    apiUserBatch: env.SENDCLOUD_API_USER_BATCH
  },
  session_store: env.USERPORTAL_REDIS_SESSION_STORE || 'true',
  redis: {
    host: env.REDIS_HOST || '192.168.1.87',
    port: env.REDIS_PORT || 6380,
    password: env.REDIS_PWD || '',
    sessionPrefix: 'session_',
    session_store_prefix: 'koa:sess:',
  },
  tenxSysSign: {
    key: 'SYSTEM_CALL_SIGNATURE',
    value: env.SYSTEM_CALL_SIGNATURE || '8e059c94-f760-4f85-8910-f94c27cf0ff5'
  },
  storageConfig: {
    name: '',
    agent: {
      user: env.STORAGE_AGENT_USER || 'system',
      password: env.STORAGE_AGENT_PASSWORD || '31e120b3-512a-4e3b-910c-85c747fb1ec2'
    },
    pool: env.STORAGE_POOL || 'tenx-pool',
    user: env.STORAGE_USER || 'admin',
    keyring: env.STORAGE_KEYRING || '/etc/ceph/ceph.client.admin.keyring',
    fsType: env.STORAGE_FSTYPE || ''
  },
  registryConfig: {
    user: env.REGISTRY_USER || 'admin',
    password: env.REGISTRY_PASSWORD || 'e3442e6a-779b-4c34-911f-855b42ea80af'
  },
  registryTemplate: env.REGISTRY_TEMPLATE || JSON.stringify(registryTemplate)
}
const node_env = config.node_env
if (node_env === 'staging') {
  config.url = 'http://v2-api.tenxcloud.com'
} else if (node_env === 'development') {
  config.url = `http://localhost:${config.port}`
}

module.exports = config
