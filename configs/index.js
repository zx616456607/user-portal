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
const modes = require('./models');
// Remove the process.dev definition, as configs/index.js will be used in src/routes/index.js which
// cannot recognition the process from node.js, and it is specific for react
// const env = process.env
const config = {
  production: false,
  model: {
    type: 'standard',
    modules: modes['standard']
  },
  // protocol: 'http' || env.DASHBOARD_PROTOCOL,
  // hostname: "0.0.0.0" || env.DASHBOARD_HOST,
  protocol: 'http',
  hostname: '0.0.0.0',
  port: 8003,
  intl_cookie_name: 'intl_locale',
  session_key: 'tce',
  session_secret: ['tenxcloud_dashboard', 'secret_dream008'],
  session_store: {
    // url: null || env.SESSION_STORE_URL,
    // pass: null || env.SESSION_STORE_PASS
    url: null,
    pass: null
  },
  tenx_api: {
    protocol: 'http',
    host: '192.168.1.103:48000'
    // host: "localhost:8000" || env.TENX_API_HOST
    // host: "192.168.0.63:8000" || env.TENX_API_HOST
    // host: "192.168.0.230:8000" || env.TENX_API_HOST
    // host: "192.168.3.3:48000" || env.TENX_API_HOST
  }
}

module.exports = config