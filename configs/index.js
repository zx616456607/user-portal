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
const env = process.env
const config = {
  production: false,
  protocol: 'http' || env.DASHBOARD_PROTOCOL,
  hostname: "0.0.0.0" || env.DASHBOARD_HOST,
  port: 8003 || env.DASHBOARD_PORT,
  intl_cookie_name: "intl_locale",
  session_key: "tce",
  session_secret: ["tenxcloud_dashboard", "secret_dream008"],
  session_store: {
    url: null || env.SESSION_STORE_URL,
    pass: null || env.SESSION_STORE_PASS
  },
  tenx_api: {
    protocol: "http" || env.TENX_API_PROTOCOL,
    // host: "localhost:8000" || env.TENX_API_HOST
    host: "192.168.0.63:8000" || env.TENX_API_HOST
    // host: "192.168.1.103:48000" || env.TENX_API_HOST
  }
}

module.exports = config