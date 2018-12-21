/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Htkg request
 *
 * 航天科工
 *
 * v0.1 - 2018-12-18
 * @author Zhangxuan
 */
'use strict'

const configs = require('../configs/index')
const urllib = require('urllib')

const htkgConfig = configs.htkg_api
const HTKG_URL = htkgConfig.protocol + '://' + htkgConfig.host
const DEFAULT_HEADERS = {
  'api-key-id': htkgConfig.api_key_id,
  'api-key-secret': htkgConfig.api_key_secret,
}

module.exports = (path, options) => {
  const url = HTKG_URL + path
  const defaultOptions = {
    dataType: 'json',
    dataAsQueryString: true,
    headers: Object.assign({}, DEFAULT_HEADERS, options.headers)
  }
  delete options.headers
  return urllib.request(url, Object.assign({}, defaultOptions, options)).then(
    function done(result) {
      if (result.status === 101) {
        result.statusCode = 401
        result.body.message = '认证失败'
      } else {
        result.statusCode = result.status
      }
      return result
    }
  )
}