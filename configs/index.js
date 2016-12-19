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
  protocol: 'http' || env.DASHBOARD_PROTOCOL,
  hostname: '0.0.0.0' || env.DASHBOARD_HOST,
  port: 8003,
  intl_cookie_name: 'intl_locale',
  session_key: 'tce',
  session_secret: ['tenxcloud_dashboard', 'secret_dream008'],
  session_store: {
    url: null || env.SESSION_STORE_URL,
    pass: null || env.SESSION_STORE_PASS
  },
  tenx_api: {
    protocol: 'http',
    host: '192.168.1.103:48000' || env.TENX_API_HOST
    // host: "localhost:8000" || env.TENX_API_HOST
    // host: "192.168.0.30:8000" || env.TENX_API_HOST
    // host: "192.168.0.230:8000" || env.TENX_API_HOST
    // host: "192.168.3.3:48000" || env.TENX_API_HOST
  },
  mail_server: {
    host: "smtp.qq.com",
    port: 465,
    secure: true,
    auth: {
      user: "noreply@tenxcloud.com",
      pass: "TenxCloud001",
    },
    service_mail: "service@tenxcloud.com"
  },
  redis: {
    host: env.USERPORTAL_REDIS_HOST,
    port: env.USERPORTAL_REDIS_PORT,
    password: env.USERPORTAL_REDIS_PWD,
  }
}

module.exports = config