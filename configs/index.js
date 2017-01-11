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
const constants = require('./constants');

const env = process.env

const config = {
  node_env: env.NODE_ENV || constants.NODE_ENV_DEV, // production / dev
  running_mode: env.RUNNING_MODE || constants.ENTERPRISE_MODE, // enterprise / standard
  protocol: env.DASHBOARD_PROTOCOL || 'http',
  hostname: env.DASHBOARD_HOST || '0.0.0.0',
  port: env.DASHBOARD_PORT || 8003,
  url: env.USERPORTAL_URL || 'https://portal.tenxcloud.com', // USERPORTAL_URL env is only useful in production environments
  intl_cookie_name: 'intl_locale',
  session_key: 'tce',
  session_secret: ['tenxcloud_dashboard', 'secret_dream008'],
  tenx_api: {
    external_protocol: env.TENX_API_EXTERNAL_PROTOCOL || 'https',
    external_host: env.TENX_API_EXTERNAL_HOST || 'apiv2.tenxcloud.com',
//  protocol: env.TENX_API_PROTOCOL || 'http',
    protocol: env.TENX_API_PROTOCOL || 'https',
//  host: env.TENX_API_HOST || '192.168.1.103:48000'
    host: env.TENX_API_HOST || 'apiv2.tenxcloud.com'
    // host: "localhost:8000" || env.TENX_API_HOST
    // host: "192.168.0.8:8000" || env.TENX_API_HOST
//     host: "192.168.0.104:8000" || env.TENX_API_HOST
    // host: "192.168.3.3:48000" || env.TENX_API_HOST
  },
  mail_server: {
    host: "smtp.qq.com",
    port: 465,
    secure: true,
    auth: {
      user: "noreply@tenxcloud.com",
      pass: env.NOREPLY_EMAIL_PWD,
    },
    service_mail: "service@tenxcloud.com"
  },
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
  },
  tenxSysSign: {
    key: 'SYSTEM_CALL_SIGNATURE',
    value: env.SYSTEM_CALL_SIGNATURE|| '8e059c94-f760-4f85-8910-f94c27cf0ff5'
  }
}
const node_env = config.node_env
if (node_env === 'staging') {
  config.url = 'http://v2-api.tenxcloud.com'
} else if (node_env === 'development') {
  config.url = `http://localhost:${config.port}`
}

module.exports = config