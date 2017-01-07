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

const config = {
  sms: {
    host: 'https://106.ihuyi.com/webservice/sms.php',
    account: env.USERPORTAL_IHUYI_ACCOUNT || 'cf_huangqg',
    apiKey: env.USERPORTAL_IHUYI_APIKEY || '9611f970a6075b81becfdadf593882f5',
  },
  // sendcloud 邮箱配置
  sendcloud: {
    apiUser: 'tenxcloud_net_trigger',
    apiKey: 'ndUMLMCUNDapKdZC',
    from: 'noreply@tenxcloud.net',
    fromname: '时速云',
    apiUserBatch: 'tenxcloud_net_batch'
  },
}

module.exports = config