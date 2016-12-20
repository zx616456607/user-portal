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
}

module.exports = config