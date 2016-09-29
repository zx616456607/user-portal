/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * Request api tools
 * support promise and callback
 * 
 * v0.1 - 2016-09-13
 * @author Zhangpc
 */
'use strict'

const urllib = require('urllib')
const _ = require('lodash')
const errors = require('./errors')
const DEFAULT_PROTOCOL = 'http'
const DEFAULT_VERSION = 'v2'
const DEFAULT_TIMEOUT = 1000 * 10
const DEFAULT_DATATYPE = 'json'
const logger = require('../../../utils/logger').getLogger(`tenx_api/request`)

module.exports = (protocol, host, version, auth, timeout) => {
  !protocol && (protocol = DEFAULT_PROTOCOL)
  !version && (version = DEFAULT_VERSION)
  !timeout && (timeout = DEFAULT_TIMEOUT)
  
  const _getUrl = (object) => `${protocol}://${host}/api/${version}${object.endpoint}`

  const _isSuccess = (statusCode) => statusCode < 300

  const _makeRequest = (object, callback) => {
    object = _.clone(object)
    let url = _getUrl(object)
    const options = {}
    options.method = object.method
    options.dataType = object.dataType || DEFAULT_DATATYPE
    options.contentType = object.contentType || DEFAULT_DATATYPE
    options.timeout = object.timeout || timeout
    options.headers = object.headers
    options.data = object.data
    logger.info(`[${options.method || 'GET'}] ${url}`)
    if (!callback) {
      return urllib.request(url, options).then(
        function done(result) {
          if (_isSuccess(result.res.statusCode)) {
            result.data.statusCode = result.res.statusCode 
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
    urllib.request(url, object, (err, data, res) => {
      if (err) {
        err.statusCode = err.res.statusCode
        err = errors.get(err)
        return callback(err)
      }

      if (_isSuccess(res.statusCode)) {
        data.statusCode = res.statusCode 
        return callback(null, data)
      }

      callback(errors.get(result.res))
    })
  }

  return (object, callback) => {
    if (auth) {
      !object.headers && (object.headers = {})
      object.headers.Username = auth.user
      object.headers.Authorization = `token ${auth.token}`
      object.headers.namespace = auth.namespace
    }
    return _makeRequest(object, callback)
  }
}