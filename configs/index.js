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
  intl_cookie_name: 'intl_locale',
  session_key: 'tce',
  session_secret: ['tenxcloud_dashboard', 'secret_dream008'],
  tenx_api: {
    external_protocol: env.TENX_API_EXTERNAL_PROTOCOL || 'https',
    external_host: env.TENX_API_EXTERNAL_HOST || 'apiv2.tenxcloud.com',
    protocol: env.TENX_API_PROTOCOL || 'http',
    host: env.TENX_API_HOST || '192.168.1.103:48000'
    // host: "localhost:8000" || env.TENX_API_HOST
    // host: "192.168.0.8:8000" || env.TENX_API_HOST
    // host: "192.168.0.230:8000" || env.TENX_API_HOST
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
  session_store: env.USERPORTAL_REDIS_SESSION_STORE || 'true',
  redis: {
    host: env.USERPORTAL_REDIS_HOST || '192.168.1.87',
    port: env.USERPORTAL_REDIS_PORT || '6380',
    password: env.USERPORTAL_REDIS_PWD || '',
  }
}

module.exports = config