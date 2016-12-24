/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index config file for standard mode only
 *
 * v0.1 - 2016-12-15
 * @author Zhangpc
 */
'use strict'
const env = process.env
const node_env = require('../').node_env
const port = require('../').port
const running_mode = require('../').running_mode
const constants = require('../constants');

const config = {
  tenxSysSign: {
    key: 'TenxCloud-System-Signature',
    value: '8e059c94-f760-4f85-8910-f94c27cf0ff5'
  },
  sms: {
    host: 'https://106.ihuyi.com/webservice/sms.php',
    account: env.USERPORTAL_IHUYI_ACCOUNT || 'cf_huangqg',
    apiKey: env.USERPORTAL_IHUYI_APIKEY || '9611f970a6075b81becfdadf593882f5',
  },
  host: env.USERPORTAL_HOST || 'https://console.tenxcloud.com',
}

if (node_env === 'staging') {
  config.host = 'http://v2-api.tenxcloud.com'
} else if (node_env === constants.NODE_ENV_DEV) {
  config.host = `http://localhost:${port}`
} else if (node_env === constants.NODE_ENV_CICD) {
  config.host = `http://user-portal-se-huangxin.test.tenxcloud.com:48003/`
}

module.exports = config