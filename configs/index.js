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

const config = {
  production: false,
  protocol: 'http' || process.env.DASHBOARD_PROTOCOL,
  host: "0.0.0.0" || process.env.DASHBOARD_HOST,
  port: 8003 || process.env.DASHBOARD_PORT,
  intl_cookie_name: "intl_locale",
  session_key: "tce",
  session_secret: ["tenxcloud_dashboard", "secret_dream008"],
  session_store: {
    url: null || process.env.SESSION_STORE_URL,
    pass: null || process.env.SESSION_STORE_PASS
  }
}

module.exports = config