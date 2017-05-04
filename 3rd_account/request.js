/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Request function
 *
 * v0.1 - 2017-01-10
 * @author Zhangpc
 */
'use strict'

const urllib = require('urllib')
const logger = require('../utils/logger').getLogger('3rd_account/request')
const errors = require('../tenx_api/v2/lib/errors')
const DefaultOpts = {
  method: 'GET',
  dataType: 'json',
  contentType: 'json',
  timeout: 1000 * 20
}
const _isSuccess = (statusCode) => statusCode < 300

module.exports = function (name) {
  return function request(url, options) {
    options = Object.assign({}, DefaultOpts, options)
    logger.info(name, `[${options.method || 'GET'}] ${url}`)
    logger.info(name, JSON.stringify(options, null, 2))
    return urllib.request(url, options).then(
      function done(result) {
        logger.info(name, `api result: ${JSON.stringify(result.data)}`)
        if (_isSuccess(result.res.statusCode)) {
          // data maybe null
          if (!result.data) {
            result.data = {}
          }
          return result.data
        }
        throw errors.get(result.res)
      },
      function fail(err) {
        err.statusCode = err.res.statusCode
        throw errors.get(err)
      }
    )
  }
}